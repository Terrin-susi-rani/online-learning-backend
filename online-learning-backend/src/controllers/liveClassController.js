const db = require('../config/database');
// Create a new live class
exports.createLiveClass = (req, res) => {
  const { 
    courseId, 
    educatorId, 
    title, 
    description, 
    scheduledAt, 
    duration, 
    maximumStudents,
    joinUrl,
    recordingAvailability,
    chatEnabled,
    pollsEnabled
  } = req.body;

  // Validate required fields
  if (!courseId || !educatorId || !title || !scheduledAt || !duration || !maximumStudents) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO LiveClasses (
      courseId, educatorId, title, description, scheduledAt, 
      duration, maximumStudents, joinUrl, recordingAvailability,
      chatEnabled, pollsEnabled
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      courseId, educatorId, title, description, scheduledAt, 
      duration, maximumStudents, joinUrl || null, 
      recordingAvailability || false, 
      chatEnabled !== false, pollsEnabled !== false
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ 
          error: 'Failed to create live class',
          details: err.message 
        });
      }
      
      // Return the newly created live class
      db.get(
        `SELECT * FROM LiveClasses WHERE id = ?`,
        [this.lastID],
        (err, liveClass) => {
          if (err || !liveClass) {
            return res.status(201).json({
              success: true,
              message: 'Live class created but could not retrieve details',
              classId: this.lastID
            });
          }
          res.status(201).json({
            success: true,
            liveClass
          });
        }
      );
    }
  );
};

// Get live class schedule

exports.getSchedule = (req, res) => {
  const { courseId, date, upcoming } = req.query;
  
  let query = `SELECT 
    lc.id, lc.title, lc.description, lc.scheduledAt, lc.duration,
    lc.maximumStudents, lc.status, lc.joinUrl,
    c.title AS courseTitle,
    u.name AS educator,
    (SELECT COUNT(*) FROM LiveClassParticipants WHERE classId = lc.id) AS enrolled
    FROM LiveClasses lc
    JOIN Courses c ON lc.courseId = c.id
    JOIN Users u ON lc.educatorId = u.id
    WHERE 1=1`;
  
  const params = [];
  
  if (courseId) {
    query += ' AND lc.courseId = ?';
    params.push(courseId);
  }
  
  if (date) {
    query += ' AND DATE(lc.scheduledAt) = DATE(?)';
    params.push(date);
  }
  
  if (upcoming === 'true') {
    query += ' AND lc.scheduledAt > datetime("now")';
  }
  
  query += ' ORDER BY lc.scheduledAt ASC';
  
  db.all(query, params, (err, liveClasses) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ success: true, liveClasses });
  });
};

// Join live class
exports.joinLiveClass = (req, res) => {
  const classId = req.params.id;
  const userId = req.user.id;
  
  // Check if user is enrolled in the course
  db.get(
    `SELECT 1 FROM Enrollments 
     WHERE userId = ? AND courseId = (
       SELECT courseId FROM LiveClasses WHERE id = ?
     )`,
    [userId, classId],
    (err, enrollment) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!enrollment) {
        return res.status(403).json({ error: 'You must be enrolled in the course to join the live class' });
      }
      
      // Check if class exists and is scheduled/ongoing
      db.get(
        `SELECT * FROM LiveClasses 
         WHERE id = ? AND status IN ('scheduled', 'ongoing')`,
        [classId],
        (err, liveClass) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          if (!liveClass) {
            return res.status(404).json({ error: 'Live class not available' });
          }
          
          // Check if class is full
          db.get(
            `SELECT COUNT(*) as count FROM LiveClassParticipants 
             WHERE classId = ?`,
            [classId],
            (err, result) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              
              if (result.count >= liveClass.maximumStudents) {
                return res.status(403).json({ error: 'This live class is full' });
              }
              
              // Generate join URL and token (in a real app, use a proper video conferencing API)
              const joinUrl = `https://live-class.example.com/${classId}?token=${generateToken(userId, classId)}`;
              
              // Record participant
              db.run(
                `INSERT OR IGNORE INTO LiveClassParticipants 
                 (classId, userId) VALUES (?, ?)`,
                [classId, userId],
                function(err) {
                  if (err) {
                    return res.status(500).json({ error: err.message });
                  }
                  
                  res.status(200).json({
                    success: true,
                    liveClass: {
                      joinUrl,
                      token: generateToken(userId, classId),
                      chatEnabled: liveClass.chatEnabled,
                      pollsEnabled: liveClass.pollsEnabled
                    }
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

// Ask question during live class
exports.askQuestion = (req, res) => {
  const classId = req.params.id;
  const userId = req.user.id;
  const { question, timestamp } = req.body;
  
  // Validate input
  if (!question || typeof question !== 'string' || question.trim() === '') {
    return res.status(400).json({ error: 'Invalid question' });
  }
  
  // Check if user is in the class
  db.get(
    `SELECT 1 FROM LiveClassParticipants 
     WHERE classId = ? AND userId = ? AND leftAt IS NULL`,
    [classId, userId],
    (err, participant) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!participant) {
        return res.status(403).json({ error: 'You must be in the live class to ask questions' });
      }
      
      // Record question
      db.run(
        `INSERT INTO LiveClassQuestions 
         (classId, userId, question, timestamp) 
         VALUES (?, ?, ?, ?)`,
        [classId, userId, question.trim(), timestamp || null],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          res.status(201).json({ 
            success: true,
            questionId: this.lastID,
            message: 'Question submitted successfully'
          });
        }
      );
    }
  );
};

// Helper function to generate token
function generateToken(userId, classId) {
  // In a real app, use JWT or similar with proper signing
  return Buffer.from(`${userId}:${classId}:${Date.now()}`).toString('base64');
}