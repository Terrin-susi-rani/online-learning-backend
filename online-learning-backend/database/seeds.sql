-- Users (5 records)
INSERT INTO Users (name, email, password, mobile, role, targetExam, preferredLanguage, currentLevel) VALUES
('Rahul Sharma', 'rahul@example.com', '$2a$10$xJwL5v5zL3h7WqKkQdT7E.9VZ8sYt1XfL2pB3cD4vE5rF6gH7iJ8k', '+919876543210', 'learner', 'JEE', 'English', 'Intermediate'),
('Priya Patel', 'priya@example.com', '$2a$10$xJwL5v5zL3h7WqKkQdT7E.9VZ8sYt1XfL2pB3cD4vE5rF6gH7iJ8k', '+919876543211', 'learner', 'NEET', 'Hindi', 'Beginner'),
('Dr. Amit Singh', 'amit@example.com', '$2a$10$xJwL5v5zL3h7WqKkQdT7E.9VZ8sYt1XfL2pB3cD4vE5rF6gH7iJ8k', '+919876543212', 'educator', NULL, 'English', NULL),
('Prof. Neha Gupta', 'neha@example.com', '$2a$10$xJwL5v5zL3h7WqKkQdT7E.9VZ8sYt1XfL2pB3cD4vE5rF6gH7iJ8k', '+919876543213', 'educator', NULL, 'Hindi', NULL),
('Admin User', 'admin@example.com', '$2a$10$xJwL5v5zL3h7WqKkQdT7E.9VZ8sYt1XfL2pB3cD4vE5rF6gH7iJ8k', '+919876543214', 'admin', NULL, 'English', NULL);

-- Educators (5 records)
INSERT INTO Educators (userId, qualification, experience, subjects, rating) VALUES
(3, 'PhD in Physics, IIT Delhi', 8, '["Physics", "Mathematics"]', 4.8),
(4, 'MSc Chemistry, BHU', 5, '["Chemistry", "Biology"]', 4.5),
(3, 'MTech Computer Science, IIT Bombay', 6, '["Computer Science", "Mathematics"]', 4.7),
(4, 'MBBS, AIIMS Delhi', 10, '["Biology", "Medical Sciences"]', 4.9),
(3, 'BEd, Delhi University', 4, '["General Science", "Environmental Science"]', 4.2);

-- Courses (5 records)
INSERT INTO Courses (title, description, educatorId, targetExam, subject, language, duration, price, discountedPrice, type, thumbnailUrl) VALUES
('Complete Physics for JEE', 'Master all concepts for JEE Main and Advanced', 3, 'JEE', 'Physics', 'English', 180, 5999, 3999, 'recorded', 'https://example.com/physics-thumb.jpg'),
('NEET Biology Crash Course', 'Fast-track preparation for NEET aspirants', 4, 'NEET', 'Biology', 'Hindi', 90, 4999, 3499, 'live', 'https://example.com/biology-thumb.jpg'),
('Mathematics for Engineering', 'Advanced mathematics concepts', 3, 'JEE', 'Mathematics', 'English', 120, 6999, 4999, 'recorded', 'https://example.com/math-thumb.jpg'),
('Organic Chemistry Made Easy', 'Complete organic chemistry syllabus', 4, 'NEET', 'Chemistry', 'Hindi', 150, 5499, 4499, 'recorded', 'https://example.com/chem-thumb.jpg'),
('Computer Science Fundamentals', 'CS basics for competitive exams', 3, 'JEE', 'Computer Science', 'English', 60, 2999, 1999, 'live', 'https://example.com/cs-thumb.jpg');

-- Lessons (5 records)
INSERT INTO Lessons (courseId, title, description, videoUrl, duration, orderInCourse, isFree) VALUES
(1, 'Introduction to Mechanics', 'Basic concepts of motion and forces', 'https://example.com/videos/mech1.mp4', 1800, 1, TRUE),
(1, 'Newton''s Laws of Motion', 'Detailed explanation of all three laws', 'https://example.com/videos/newton.mp4', 2700, 2, FALSE),
(2, 'Cell Biology Basics', 'Structure and function of cells', 'https://example.com/videos/cell-bio.mp4', 2400, 1, TRUE),
(3, 'Calculus Fundamentals', 'Introduction to differentiation', 'https://example.com/videos/calculus.mp4', 3600, 1, FALSE),
(4, 'Organic Reactions', 'Common organic chemistry reactions', 'https://example.com/videos/org-chem.mp4', 1800, 1, TRUE);

-- LiveClasses (5 records)
INSERT INTO LiveClasses (courseId, educatorId, maximumStudents, recordingAvailability) VALUES
(2, 4, 100, TRUE),
(5, 3, 50, FALSE),
(2, 4, 75, TRUE),
(5, 3, 60, TRUE),
(2, 4, 80, FALSE);

-- Enrollments (5 records)
INSERT INTO Enrollments (userId, courseId, expiryDate, progress) VALUES
(1, 1, '2024-12-31', 25),
(2, 2, '2024-10-15', 40),
(1, 3, '2024-11-30', 10),
(2, 4, '2025-01-15', 75),
(1, 5, '2024-09-30', 5);

-- WatchHistory (5 records)
INSERT INTO WatchHistory (userId, lessonId, watchedDuration, totalDuration, completed) VALUES
(1, 1, 1800, 1800, TRUE),
(1, 2, 900, 2700, FALSE),
(2, 3, 2400, 2400, TRUE),
(1, 4, 1200, 3600, FALSE),
(2, 5, 1800, 1800, TRUE);

-- Insert sample tests
INSERT INTO Tests (courseId, title, description, type, subject, totalQuestions, totalMarks, duration, passingScore, difficulty)
VALUES 
(1, 'JEE Main Mock Test - 1', 'Full length practice test for JEE Main', 'mock', 'Physics, Chemistry, Math', 90, 360, 180, 120, 'moderate'),
(1, 'NEET Chapter Test - Mechanics', 'Focused test on mechanics concepts', 'chapter', 'Physics', 30, 120, 60, 40, 'hard'),
(2, 'Class 12 Board Practice Test', 'CBSE pattern practice test', 'practice', 'Physics, Chemistry, Math', 50, 200, 120, 70, 'easy'),
(3, 'GATE CS Mock Test', 'Computer Science GATE exam simulation', 'mock', 'Computer Science', 65, 260, 180, 90, 'hard');

-- Insert sample test questions
INSERT INTO TestQuestions (testId, questionText, options, correctOption, marks, negativeMarks, subject, topic, difficulty)
VALUES
-- Questions for Test 1 (JEE Main Mock)
(1, 'A particle moves with constant acceleration. If it covers 10 m in first second and 20 m in next second, what is its acceleration?', 
 '["2 m/s²", "5 m/s²", "10 m/s²", "20 m/s²"]', 2, 4, 1, 'Physics', 'Kinematics', 'moderate'),

(1, 'Which of the following is not a transition element?', 
 '["Copper", "Silver", "Zinc", "Iron"]', 3, 4, 1, 'Chemistry', 'd-Block Elements', 'easy'),

(1, 'If x² + y² = 25, what is the maximum value of 3x + 4y?', 
 '["10", "15", "20", "25"]', 4, 4, 1, 'Math', 'Coordinate Geometry', 'hard'),

-- Questions for Test 2 (NEET Chapter Test)
(2, 'A force of 10N acts on a body of mass 2kg at rest. What is its velocity after 5 seconds?', 
 '["10 m/s", "20 m/s", "25 m/s", "50 m/s"]', 3, 4, 1, 'Physics', 'Laws of Motion', 'moderate'),

(2, 'The dimensional formula for impulse is same as that for:', 
 '["Force", "Momentum", "Pressure", "Work"]', 2, 4, 1, 'Physics', 'Units & Dimensions', 'easy'),

-- Questions for Test 3 (Class 12 Board)
(3, 'The SI unit of electric potential is:', 
 '["Joule", "Volt", "Ohm", "Watt"]', 2, 4, 1, 'Physics', 'Electrostatics', 'easy'),

(3, 'Which of these is a reducing sugar?', 
 '["Sucrose", "Maltose", "Lactose", "Both B and C"]', 4, 4, 1, 'Chemistry', 'Biomolecules', 'moderate');

-- Insert test sessions (assuming user 1 exists)
INSERT INTO TestSessions (id, testId, userId, startTime, endTime, completed)
VALUES
('session_001', 1, 1, '2024-03-20T10:00:00', '2024-03-20T13:00:00', 1),
('session_002', 2, 1, '2024-03-21T14:00:00', '2024-03-21T15:00:00', 1),
('session_003', 1, 2, '2024-03-22T09:00:00', NULL, 0);

-- Insert test attempts (answers)
INSERT INTO TestAttempts (sessionId, questionId, selectedOption, isCorrect, timeSpent)
VALUES
-- Session 1 attempts
('session_001', 1, 2, 1, 120),
('session_001', 2, 3, 1, 90),
('session_001', 3, 4, 1, 180),
('session_001', 4, 3, 1, 150),
('session_001', 5, 2, 1, 60),

-- Session 2 attempts
('session_002', 4, 3, 1, 100),
('session_002', 5, 2, 1, 80),
('session_002', 6, 2, 1, 120);

-- Insert test results
INSERT INTO TestResults (sessionId, userId, testId, score, totalMarks, correctAnswers, incorrectAnswers, unattempted, timeTaken, percentile, rank)
VALUES
('session_001', 1, 1, 320, 360, 80, 5, 5, 10200, 85.5, 1250),
('session_002', 1, 2, 105, 120, 26, 2, 2, 5400, 92.3, 450);

 INSERT INTO EducatorFollows (educatorId, userId) VALUES(1,1);

-- Subscriptions (5 records)
INSERT INTO Subscriptions (userId, planId, endDate, paymentAmount, status) VALUES
(1, 1, '2024-06-30', 999, 'active'),
(2, 2, '2024-12-31', 2999, 'active'),
(1, 1, '2024-05-31', 999, 'expired'),
(2, 1, '2024-04-30', 999, 'active'),
(1, 2, '2024-09-30', 2999, 'active');

-- DoubtSessions (5 records)
INSERT INTO DoubtSessions (title, description, courseId, lessonId, status) VALUES
('Mechanics Doubts', 'Questions about physics concepts', 1, 1, 'open'),
('Biology Questions', 'NEET biology doubts', 2, 3, 'resolved'),
('Math Problem Solving', 'Calculus difficulties', 3, 4, 'open'),
('Organic Chemistry Help', 'Reaction mechanisms', 4, 5, 'closed'),
('CS Fundamentals', 'Programming concepts', 5, NULL, 'open');

-- DoubtQuestions (5 records)
INSERT INTO DoubtQuestions (doubtSessionId, userId, questionText, isAnonymous) VALUES
(1, 1, 'Why is normal force always perpendicular?', FALSE),
(2, 2, 'What is the difference between mitosis and meiosis?', FALSE),
(3, 1, 'How to solve this differential equation?', TRUE),
(4, 2, 'Why do SN2 reactions need polar aprotic solvents?', FALSE),
(5, 1, 'Explain object-oriented programming concepts', FALSE);

-- DoubtAnswers (5 records)
INSERT INTO DoubtAnswers (questionId, educatorId, answerText, isVerified) VALUES
(1, 3, 'Normal force is perpendicular because...', TRUE),
(2, 4, 'Mitosis produces 2 identical cells while meiosis...', TRUE),
(3, 3, 'First separate the variables then integrate...', FALSE),
(4, 4, 'Polar aprotic solvents prevent nucleophile solvation...', TRUE),
(5, 3, 'OOP has four main principles: encapsulation...', FALSE);

-- DoubtVotes (5 records)
INSERT INTO DoubtVotes (answerId, userId, voteType) VALUES
(1, 1, 'up'),
(1, 2, 'up'),
(2, 1, 'up'),
(3, 2, 'down'),
(4, 1, 'up');

-- DoubtTags (5 records)
INSERT INTO DoubtTags (name) VALUES
('Physics'),
('Biology'),
('Mathematics'),
('Chemistry'),
('Computer Science');

-- DoubtSessionTags (5 records)
INSERT INTO DoubtSessionTags (doubtSessionId, tagId) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-- StudyMaterials (5 records)
INSERT INTO StudyMaterials (title, description, courseId, lessonId, chapter, fileUrl, fileType, fileSize, isFree, downloadPermission, uploaderId) VALUES
('Physics Formulas', 'Important formulas for JEE', 1, 1, 'Mechanics', 'https://example.com/files/physics-formulas.pdf', 'pdf', 2500, TRUE, 'all', 3),
('Biology Diagrams', 'Essential diagrams for NEET', 2, 3, 'Cell Biology', 'https://example.com/files/bio-diagrams.pdf', 'pdf', 1800, FALSE, 'enrolled', 4),
('Math Problems', 'Practice problems with solutions', 3, 4, 'Calculus', 'https://example.com/files/math-problems.pdf', 'pdf', 3200, FALSE, 'subscribed', 3),
('Organic Reactions', 'Reaction mechanisms chart', 4, 5, 'Organic Chemistry', 'https://example.com/files/org-reactions.pdf', 'pdf', 1500, TRUE, 'all', 4),
('CS Cheat Sheet', 'Programming quick reference', 5, NULL, 'Fundamentals', 'https://example.com/files/cs-cheatsheet.pdf', 'pdf', 800, TRUE, 'all', 3);

-- MaterialDownloads (5 records)
INSERT INTO MaterialDownloads (materialId, userId) VALUES
(1, 1),
(1, 2),
(2, 2),
(3, 1),
(5, 1);

-- MaterialViews (5 records)
INSERT INTO MaterialViews (materialId, userId, duration) VALUES
(1, 1, 300),
(1, 2, 180),
(2, 2, 420),
(3, 1, 600),
(5, 1, 120);

-- MaterialBookmarks (5 records)
INSERT INTO MaterialBookmarks (materialId, userId) VALUES
(1, 1),
(2, 2),
(3, 1),
(4, 2),
(5, 1);