const db = require('../config/database');
const { validationResult } = require('express-validator');

// Get lesson details (now includes study materials)
exports.getLessonDetails = async (req, res) => {
    try {
        const lessonId = req.params.id;
        const userId = req.user.id;

        // Verify enrollment
        const enrollment = await new Promise((resolve) => {
            db.get(`
                SELECT 1 FROM Enrollments e
                JOIN Lessons l ON e.courseId = l.courseId
                WHERE e.userId = ? AND l.id = ?
            `, [userId, lessonId], (err, row) => resolve(row));
        });

        if (!enrollment) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not enrolled in this course' 
            });
        }

        // Get lesson details
        db.get(`
            SELECT l.*, 
                   (SELECT id FROM Lessons 
                    WHERE courseId = l.courseId AND orderInCourse > l.orderInCourse 
                    ORDER BY orderInCourse ASC LIMIT 1) as nextLessonId
            FROM Lessons l
            WHERE l.id = ?
        `, [lessonId], async (err, lesson) => {
            if (err || !lesson) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Lesson not found' 
                });
            }

            // Get study materials
            const studyMaterials = await new Promise((resolve) => {
                db.all(`
                    SELECT id, title, description, fileUrl, fileType, fileSize, isFree
                    FROM StudyMaterials 
                    WHERE lessonId = ?
                    ORDER BY createdAt DESC
                `, [lessonId], (err, rows) => resolve(rows || []));
            });

            // Get next lesson info if exists
            let nextLesson = null;
            if (lesson.nextLessonId) {
                nextLesson = await new Promise((resolve) => {
                    db.get(`
                        SELECT id, title FROM Lessons WHERE id = ?
                    `, [lesson.nextLessonId], (err, row) => resolve(row));
                });
            }

            res.json({
                success: true,
                lesson: {
                    id: lesson.id,
                    title: lesson.title,
                    description: lesson.description,
                    videoUrl: lesson.videoUrl,
                    duration: lesson.duration,
                    studyMaterials,
                    nextLesson
                }
            });
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};



// Update lesson progress
exports.updateLessonProgress = (req, res) => {
    const lessonId = req.params.id;
    const userId = req.user.id;
    const { watchedDuration, totalDuration, completed } = req.body;

    // Validate input
    if (typeof watchedDuration !== 'number' || watchedDuration < 0 ||
        typeof totalDuration !== 'number' || totalDuration <= 0 ||
        typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    // Check if lesson exists
    const checkLessonQuery = `SELECT id FROM Lessons WHERE id = ?`;
    db.get(checkLessonQuery, [lessonId], (err, lesson) => {
        if (err) {
            console.error('Error checking lesson:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        // Insert or update watch history
        const insertOrUpdateQuery = `
            INSERT INTO WatchHistory (
                userId, lessonId, watchedDuration, totalDuration, completed, lastWatched
            ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(userId, lessonId) DO UPDATE SET
                watchedDuration = excluded.watchedDuration,
                totalDuration = excluded.totalDuration,
                completed = excluded.completed,
                lastWatched = CURRENT_TIMESTAMP
        `;

        db.run(
            insertOrUpdateQuery,
            [userId, lessonId, watchedDuration, totalDuration, completed ? 1 : 0],
            function (err) {
                if (err) {
                    console.error('Error updating progress:', err.message);
                    return res.status(500).json({ error: 'Failed to update progress' });
                }

                const progressPercent = Math.min(
                    Math.round((watchedDuration / totalDuration) * 100),
                    100
                );

                res.status(200).json({
                    success: true,
                    progress: progressPercent,
                    watchedDuration,
                    totalDuration,
                    completed
                });
            }
        );
    });
};

// Get lesson progress
exports.getLessonProgress = (req, res) => {
    const lessonId = req.params.id;
    const userId = req.user.id;

    const query = `
        SELECT 
            watchedDuration, 
            totalDuration, 
            completed,
            lastWatched
        FROM WatchHistory
        WHERE userId = ? AND lessonId = ?
    `;

    db.get(query, [userId, lessonId], (err, row) => {
        if (err) {
            console.error('Error fetching progress:', err.message);
            return res.status(500).json({ 
                error: 'Internal server error',
                details: err.message
            });
        }

        if (!row) {
            return res.status(404).json({ 
                error: 'Progress not found for this lesson' 
            });
        }

        const progressPercent = Math.min(
            Math.round((row.watchedDuration / row.totalDuration) * 100),
            100
        );

        res.status(200).json({
            success: true,
            progress: progressPercent,
            ...row
        });
    });
};
