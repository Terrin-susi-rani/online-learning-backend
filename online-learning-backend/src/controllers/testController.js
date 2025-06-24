const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get available tests
exports.getTests = (req, res) => {
  const { courseId, type, subject } = req.query;
  
  let query = `SELECT 
    t.id, t.title, t.type, t.subject, t.totalQuestions, 
    t.duration, t.totalMarks, t.difficulty,
    (SELECT COUNT(*) FROM TestSessions WHERE testId = t.id) AS attemptedBy,
    (SELECT AVG(score) FROM TestResults WHERE testId = t.id) AS avgScore
    FROM Tests t WHERE 1=1`;
  
  const params = [];
  
  if (courseId) {
    query += ' AND t.courseId = ?';
    params.push(courseId);
  }
  
  if (type) {
    query += ' AND t.type = ?';
    params.push(type);
  }
  
  if (subject) {
    query += ' AND t.subject = ?';
    params.push(subject);
  }
  
  query += ' ORDER BY t.createdAt DESC';
  
  db.all(query, params, (err, tests) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Format the response
    const formattedTests = tests.map(test => ({
      id: test.id,
      title: test.title,
      type: test.type,
      questions: test.totalQuestions,
      duration: test.duration,
      maxMarks: test.totalMarks,
      attemptedBy: test.attemptedBy || 0,
      avgScore: Math.round(test.avgScore) || 0,
      difficulty: test.difficulty || 'moderate'
    }));
    
    res.status(200).json({ success: true, tests: formattedTests });
  });
};

// Start a test
exports.startTest = (req, res) => {
  const testId = req.params.id;
  const userId = req.user.id;
  
  // First check if test exists
  db.get('SELECT * FROM Tests WHERE id = ?', [testId], (err, test) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    // Create a test session
    const sessionId = `TEST_SESSION_${uuidv4()}`;
    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + test.duration * 60000).toISOString();
    
    db.run(
      `INSERT INTO TestSessions (id, testId, userId, startTime, endTime) 
       VALUES (?, ?, ?, ?, ?)`,
      [sessionId, testId, userId, startTime, endTime],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Get all questions for this test
        db.all(
          `SELECT id, questionText, options, marks, negativeMarks 
           FROM TestQuestions WHERE testId = ?`,
          [testId],
          (err, questions) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            
            // Format questions for response
            const formattedQuestions = questions.map(q => ({
              id: q.id,
              question: q.questionText,
              options: JSON.parse(q.options),
              marks: q.marks,
              negativeMarks: q.negativeMarks
            }));
            
            res.status(200).json({
              success: true,
              testSession: {
                sessionId,
                startTime,
                endTime,
                questions: formattedQuestions
              }
            });
          }
        );
      }
    );
  });
};

// Submit test answers
exports.submitTest = (req, res) => {
  const sessionId = req.params.sessionId;
  const { answers, timeSpent } = req.body;
  const userId = req.user.id;
  
  // Validate input
  if (!Array.isArray(answers) || !timeSpent) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  
  // First get the test session
  db.get(
    `SELECT ts.*, t.totalMarks 
     FROM TestSessions ts
     JOIN Tests t ON ts.testId = t.id
     WHERE ts.id = ? AND ts.userId = ?`,
    [sessionId, userId],
    (err, session) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!session) {
        return res.status(404).json({ error: 'Test session not found' });
      }
      if (session.completed) {
        return res.status(400).json({ error: 'Test already submitted' });
      }
      
      // Process each answer
      let score = 0;
      let correct = 0;
      let incorrect = 0;
      const answerPromises = answers.map(answer => {
        return new Promise((resolve, reject) => {
          db.get(
            `SELECT correctOption, marks, negativeMarks 
             FROM TestQuestions WHERE id = ?`,
            [answer.questionId],
            (err, question) => {
              if (err) return reject(err);
              
              const isCorrect = question.correctOption === answer.selectedOption;
              let questionScore = 0;
              
              if (isCorrect) {
                questionScore = question.marks;
                correct++;
              } else if (answer.selectedOption !== null) {
                questionScore = -question.negativeMarks;
                incorrect++;
              }
              
              score += questionScore;
              
              // Record the attempt
              db.run(
                `INSERT INTO TestAttempts 
                 (sessionId, questionId, selectedOption, isCorrect, timeSpent) 
                 VALUES (?, ?, ?, ?, ?)`,
                [sessionId, answer.questionId, answer.selectedOption, isCorrect, answer.timeSpent],
                (err) => {
                  if (err) return reject(err);
                  resolve();
                }
              );
            }
          );
        });
      });
      
      // Wait for all answers to be processed
      Promise.all(answerPromises)
        .then(() => {
          // Calculate percentile and rank (simplified for example)
          const unattempted = session.totalQuestions - correct - incorrect;
          
          // Mark session as completed
          db.run(
            `UPDATE TestSessions SET completed = 1 WHERE id = ?`,
            [sessionId],
            (err) => {
              if (err) {
                console.error('Error marking session complete:', err);
              }
              
              // Save the result
              db.run(
                `INSERT INTO TestResults (
                  sessionId, userId, testId, score, totalMarks, 
                  correctAnswers, incorrectAnswers, unattempted, timeTaken
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  sessionId, userId, session.testId, score, session.totalMarks,
                  correct, incorrect, unattempted, timeSpent
                ],
                (err) => {
                  if (err) {
                    console.error('Error saving test result:', err);
                  }
                  
                  // Get percentile and rank (in a real app, this would be calculated properly)
                  const percentile = Math.min(100, Math.round((score / session.totalMarks) * 100));
                  const rank = Math.floor(Math.random() * 5000) + 1; // Mock rank
                  
                  // Subject-wise analysis (simplified)
                  const analysis = {
                    physics: {
                      score: Math.round(score * 0.35),
                      accuracy: `${Math.round((correct / (correct + incorrect)) * 100)}%`
                    },
                    chemistry: {
                      score: Math.round(score * 0.35),
                      accuracy: `${Math.round((correct / (correct + incorrect)) * 100)}%`
                    },
                    math: {
                      score: Math.round(score * 0.30),
                      accuracy: `${Math.round((correct / (correct + incorrect)) * 100)}%`
                    }
                  };
                  
                  res.status(200).json({
                    success: true,
                    result: {
                      score,
                      maxScore: session.totalMarks,
                      rank,
                      percentile,
                      correct,
                      incorrect,
                      unattempted,
                      analysis
                    }
                  });
                }
              );
            }
          );
        })
        .catch(err => {
          res.status(500).json({ error: err.message });
        });
    }
  );
};