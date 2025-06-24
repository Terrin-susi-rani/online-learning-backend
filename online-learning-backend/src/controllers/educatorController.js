const db = require('../config/database');

// Browse educators
exports.getEducators = (req, res) => {
  const { subject, exam, rating } = req.query;
  
  let query = `SELECT 
    u.id, u.name,
    e.qualification, e.experience, e.subjects, e.rating,
    (SELECT COUNT(*) FROM Courses WHERE educatorId = u.id) AS courseCount,
    (SELECT COUNT(DISTINCT e.userId) FROM Enrollments e
     JOIN Courses c ON e.courseId = c.id
     WHERE c.educatorId = u.id) AS studentCount
    FROM Users u
    JOIN Educators e ON u.id = e.userId
    WHERE u.role = 'educator'`;
  
  const params = [];
  
  if (subject) {
    query += ' AND e.subjects LIKE ?';
    params.push(`%${subject}%`);
  }
  
  if (exam) {
    query += ' AND EXISTS (SELECT 1 FROM Courses WHERE educatorId = u.id AND targetExam = ?)';
    params.push(exam);
  }
  
  if (rating) {
    query += ' AND e.rating >= ?';
    params.push(rating);
  }
  
  query += ' ORDER BY e.rating DESC';
  
  db.all(query, params, (err, educators) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Format the response
    const formattedEducators = educators.map(educator => ({
      id: educator.userId,  // Using userId as the identifier
      name: educator.name,
      subjects: educator.subjects ? educator.subjects.split(',') : [],
      experience: `${educator.experience} years`,
      rating: educator.rating,
      totalStudents: educator.studentCount || 0,
      courses: educator.courseCount || 0,
      qualification: educator.qualification
    }));
    
    res.status(200).json({ success: true, educators: formattedEducators });
  });
};

// Get educator profile
exports.getEducatorProfile = (req, res) => {
  const educatorId = req.params.id;
  
  db.get(
    `SELECT 
      u.id, u.name, u.email,
      e.qualification, e.experience, e.subjects, e.rating
     FROM Users u
     JOIN Educators e ON u.id = e.userId
     WHERE u.id = ? AND u.role = 'educator'`,
    [educatorId],
    (err, educator) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!educator) {
        return res.status(404).json({ error: 'Educator not found' });
      }
      
      // Get educator's courses
      db.all(
        `SELECT 
          id, title, description, thumbnailUrl, targetExam, subject,
          price, discountedPrice, type, duration,
          (SELECT COUNT(*) FROM Enrollments WHERE courseId = Courses.id) AS enrollmentCount
         FROM Courses 
         WHERE educatorId = ?
         ORDER BY createdAt DESC LIMIT 5`,
        [educatorId],
        (err, courses) => {
          if (err) {
            console.error('Error fetching educator courses:', err);
            courses = [];
          }
          
          // Get educator stats
          db.get(
            `SELECT 
              (SELECT COUNT(*) FROM Courses WHERE educatorId = ?) AS courseCount,
              (SELECT COUNT(DISTINCT e.userId) FROM Enrollments e
               JOIN Courses c ON e.courseId = c.id
               WHERE c.educatorId = ?) AS studentCount,
              (SELECT COUNT(*) FROM EducatorFollows WHERE educatorId = ?) AS followerCount`,
            [educatorId, educatorId, educatorId],
            (err, stats) => {
              if (err) {
                console.error('Error fetching educator stats:', err);
                stats = { courseCount: 0, studentCount: 0, followerCount: 0 };
              }
              
              // Format the response
              const response = {
                id: educator.id,
                name: educator.name,
                email: educator.email,
                qualification: educator.qualification,
                experience: `${educator.experience} years`,
                subjects: educator.subjects ? educator.subjects.split(',') : [],
                rating: educator.rating,
                stats: {
                  courses: stats.courseCount || 0,
                  students: stats.studentCount || 0,
                  followers: stats.followerCount || 0
                },
                topCourses: courses.map(course => ({
                  id: course.id,
                  title: course.title,
                  description: course.description,
                  thumbnailUrl: course.thumbnailUrl,
                  targetExam: course.targetExam,
                  subject: course.subject,
                  price: course.price,
                  discountedPrice: course.discountedPrice,
                  type: course.type,
                  duration: course.duration,
                  enrollmentCount: course.enrollmentCount || 0
                }))
              };
              
              res.status(200).json({ success: true, educator: response });
            }
          );
        }
      );
    }
  );
};

// Follow an educator
exports.followEducator = (req, res) => {
  const educatorId = req.params.id;
  const userId = req.user.id;
  
  // Check if educator exists
  db.get(
    `SELECT 1 FROM Users u JOIN Educators e ON u.id = e.userId 
     WHERE u.id = ? AND u.role = 'educator'`,
    [educatorId],
    (err, educator) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!educator) {
        return res.status(404).json({ error: 'Educator not found' });
      }
      
      // Check if already following
      db.get(
        `SELECT 1 FROM EducatorFollows 
         WHERE educatorId = ? AND userId = ?`,
        [educatorId, userId],
        (err, existingFollow) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          if (existingFollow) {
            return res.status(400).json({ error: 'Already following this educator' });
          }
          
          // Create follow relationship
          db.run(
            `INSERT INTO EducatorFollows (educatorId, userId) 
             VALUES (?, ?)`,
            [educatorId, userId],
            function(err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              
              // Update follower count
              db.run(
                `UPDATE Educators SET rating = 
                 (SELECT AVG(rating) FROM EducatorReviews WHERE educatorId = ?)
                 WHERE userId = ?`,
                [educatorId, educatorId],
                (err) => {
                  if (err) {
                    console.error('Error updating educator rating:', err);
                  }
                  
                  res.status(201).json({ 
                    success: true,
                    message: 'Successfully followed educator',
                    followId: this.lastID
                  });
                }
              );
            }
          );
        }
      );
    }
  );
};