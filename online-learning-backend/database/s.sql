

INSERT INTO Chapters (courseId, name, description, orderInCourse) VALUES
-- Complete Physics for JEE (courseId 1)
(1, 'Mechanics', 'Motion and forces', 1),
(1, 'Thermodynamics', 'Heat and energy', 2),
(1, 'Electromagnetism', 'Electricity and magnetism', 3),
(1, 'Modern Physics', 'Quantum and nuclear physics', 4),

-- NEET Biology Crash Course (courseId 2)
(2, 'Cell Biology', 'Cell structure and function', 1),
(2, 'Genetics', 'Heredity and variation', 2),
(2, 'Human Physiology', 'Body systems', 3),

-- Mathematics for Engineering (courseId 3)
(3, 'Calculus', 'Differentiation and integration', 1),
(3, 'Algebra', 'Advanced algebraic concepts', 2),
(3, 'Coordinate Geometry', 'Geometric systems', 3),

-- Organic Chemistry Made Easy (courseId 4)
(4, 'Basics of Organic Chemistry', 'Fundamental concepts', 1),
(4, 'Hydrocarbons', 'Alkanes, alkenes, alkynes', 2),
(4, 'Functional Groups', 'Alcohols, phenols, etc.', 3),

-- Computer Science Fundamentals (courseId 5)
(5, 'Programming Basics', 'Introduction to coding', 1),
(5, 'Data Structures', 'Arrays, linked lists', 2),
(5, 'Algorithms', 'Sorting and searching', 3);
-- Add chapterId column to Lessons table
