const db = require('../config/database');
const { validationResult } = require('express-validator');

// Helper function to get educator details
const getEducatorDetails = (educatorId) => {
    return new Promise((resolve) => {
        db.get(`
            SELECT u.name, e.qualification, e.experience, e.rating, e.subjects
            FROM Users u
            JOIN Educators e ON u.id = e.userId
            WHERE u.id = ?
        `, [educatorId], (err, educator) => {
            if (err || !educator) {
                if (err) console.error('Error fetching educator details:', err);
                resolve(null);
            } else {
                resolve({
                    ...educator,
                    subjects: JSON.parse(educator.subjects || '[]')
                });
            }
        });
    });
};

// Get all courses with filtering
exports.getCourses = async (req, res) => {
    try {
        const { exam, subject, language, type, educator, sort } = req.query;
        let query = `SELECT * FROM Courses WHERE 1=1`;
        const params = [];

        // Build filters
        if (exam) { query += ` AND targetExam = ?`; params.push(exam); }
        if (subject) { query += ` AND subject = ?`; params.push(subject); }
        if (language) { query += ` AND language = ?`; params.push(language); }
        if (type) { query += ` AND type = ?`; params.push(type); }
        if (educator) { query += ` AND educatorId = ?`; params.push(educator); }

        // Apply sortin
        if (sort === 'price') query += ` ORDER BY price ASC`;
        else if (sort === 'rating') query += ` ORDER BY rating DESC`;

        db.all(query, params, async (err, courses) => {
            if (err) return res.status(500).json({ error: err.message });

            // Enhance courses with educator details and highlights
            const enhancedCourses = await Promise.all(courses.map(async course => {
                const educator = await getEducatorDetails(course.educatorId);
                const highlights = await new Promise(resolve => {
                    db.all(`SELECT text FROM CourseHighlights WHERE courseId = ?`, [course.id], (err, rows) => {
                        if (err || !rows) resolve([]);
                        else resolve(rows.map(row => row.text));
                    });
                });

                return {
                    id: course.id,
                    title: course.title,
                    educator: educator ? {
                        id: course.educatorId,
                        name: educator.name,
                        rating: educator.rating
                    } : null,
                    targetExam: course.targetExam,
                    duration: `${course.duration} months`,
                    totalLessons: await getLessonCount(course.id),
                    language: course.language,
                    price: course.price,
                    discountedPrice: course.discountedPrice,
                    rating: course.rating,
                    enrolledStudents: course.enrolledStudents,
                    thumbnail: course.thumbnailUrl,
                    highlights
                };
            }));

            res.json({ success: true, courses: enhancedCourses });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get course details
exports.getCourseDetails = async (req, res) => {
    try {
        const courseId = req.params.id;

        // Get basic course info
        db.get(`SELECT * FROM Courses WHERE id = ?`, [courseId], async (err, course) => {
            if (err || !course) return res.status(404).json({ error: 'Course not found' });

            const educator = await getEducatorDetails(course.educatorId);
            const highlights = await new Promise(resolve => {
                db.all(`SELECT text FROM CourseHighlights WHERE courseId = ?`, [courseId], (err, rows) => {
                    if (err || !rows) resolve([]);
                    else resolve(rows.map(row => row.text));
                });
            });

            // Get syllabus structure
            const syllabus = await new Promise(resolve => {
                db.all(`
                    SELECT s.id, s.chapter, 
                           json_group_array(
                               json_object(
                                   'id', l.id,
                                   'title', l.title,
                                   'duration', l.duration,
                                   'isFree', l.isFree
                               )
                           ) as lessons
                    FROM Syllabus s
                    LEFT JOIN Lessons l ON l.syllabusId = s.id
                    WHERE s.courseId = ?
                    GROUP BY s.id
                `, [courseId], (err, rows) => {
                    if (err || !rows) resolve([]);
                    else resolve(rows.map(row => ({
                        chapter: row.chapter,
                        lessons: JSON.parse(row.lessons).filter(l => l.id)
                    })));
                });
            });

            // Get course features
            const features = {
                liveClasses: await countCourseItems(courseId, 'LiveClasses'),
                recordedVideos: await countCourseItems(courseId, 'Lessons'),
                mockTests: await countCourseItems(courseId, 'Tests'),
                pdfNotes: await hasCourseItems(courseId, 'StudyMaterials', "fileType = 'pdf'"),
                doubtSupport: true // Assuming all courses have doubt support
            };

            // Get recent reviews
            const reviews = await new Promise(resolve => {
                db.all(`
                    SELECT r.rating, r.comment, u.name as userName 
                    FROM Reviews r
                    JOIN Users u ON r.userId = u.id
                    WHERE r.courseId = ?
                    LIMIT 5
                `, [courseId], (err, rows) => {
                    resolve(rows || []);
                });
            });

            res.json({
                success: true,
                course: {
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    educator: educator ? {
                        id: course.educatorId,
                        name: educator.name,
                        qualification: educator.qualification,
                        experience: educator.experience,
                        rating: educator.rating
                    } : null,
                    syllabus,
                    features,
                    validity: `${course.duration} months`,
                    price: course.price,
                    reviews,
                    highlights
                }
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Enroll in course
exports.enrollCourse = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const userId = req.user.id;
        const courseId = req.params.id;

        // Check if already enrolled
        db.get(`SELECT id FROM Enrollments WHERE userId = ? AND courseId = ?`, 
            [userId, courseId], async (err, enrollment) => {
                if (enrollment) return res.status(409).json({ error: 'Already enrolled' });

                // Get course duration
                db.get(`SELECT duration FROM Courses WHERE id = ?`, [courseId], (err, course) => {
                    if (err || !course) return res.status(404).json({ error: 'Course not found' });

                    const expiryDate = new Date();
                    expiryDate.setMonth(expiryDate.getMonth() + course.duration);

                    // Create enrollment
                    db.run(`
                        INSERT INTO Enrollments 
                        (userId, courseId, enrolledAt, expiryDate) 
                        VALUES (?, ?, ?, ?)
                    `, [userId, courseId, new Date(), expiryDate], function(err) {
                        if (err) return res.status(500).json({ error: err.message });

                        // Update enrolled students count
                        db.run(`UPDATE Courses SET enrolledStudents = enrolledStudents + 1 WHERE id = ?`, [courseId]);

                        res.status(201).json({ 
                            success: true,
                            enrollmentId: this.lastID,
                            expiryDate: expiryDate.toISOString()
                        });
                    });
                });
            });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Helper functions
async function getLessonCount(courseId) {
    return new Promise(resolve => {
        db.get(`SELECT COUNT(*) as count FROM Lessons WHERE courseId = ?`, [courseId], (err, row) => {
            resolve(row ? row.count : 0);
        });
    });
}

async function countCourseItems(courseId, table) {
    return new Promise(resolve => {
        db.get(`SELECT COUNT(*) as count FROM ${table} WHERE courseId = ?`, [courseId], (err, row) => {
            resolve(row ? row.count : 0);
        });
    });
}

async function hasCourseItems(courseId, table, condition = '') {
    return new Promise(resolve => {
        db.get(`SELECT 1 FROM ${table} WHERE courseId = ? ${condition ? 'AND ' + condition : ''} LIMIT 1`, 
            [courseId], (err, row) => {
                resolve(!!row);
            });
    });
}