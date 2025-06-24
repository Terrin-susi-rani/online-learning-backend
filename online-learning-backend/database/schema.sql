CREATE TABLE Users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    mobile TEXT,
    role TEXT NOT NULL CHECK (role IN('learner','educator','admin')),
    targetExam TEXT,
    preferredLanguage TEXT,
    currentLevel TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Educators(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INT NOT NULL,
    qualification TEXT,
    experience INTEGER,
    subjects TEXT,
    rating REAL DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES Users(id)

);
CREATE TABLE  EducatorFollows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    educatorId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    followedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (educatorId) REFERENCES Users(id),
    FOREIGN KEY (userId) REFERENCES Users(id),
    UNIQUE(educatorId, userId)
  )

CREATE TABLE Courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    educatorId INTEGER NOT NULL,
    targetExam TEXT NOT NULL,
    subject TEXT NOT NULL,
    language TEXT NOT NULL,
    duration INTEGER,  -- in days
    price REAL NOT NULL,
    discountedPrice REAL,
    type TEXT CHECK (type IN ('live', 'recorded')),
    thumbnailUrl TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (educatorId) REFERENCES Users(id)
);

CREATE TABLE Lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    courseId INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    videoUrl TEXT,
    duration INTEGER,  
    orderInCourse INTEGER NOT NULL,
    isFree BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (courseId) REFERENCES Courses(id)
);

CREATE TABLE LiveClasses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          courseId INTEGER NOT NULL,
          educatorId INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          scheduledAt DATETIME NOT NULL,
          duration INTEGER NOT NULL,
          maximumStudents INTEGER NOT NULL,
          status TEXT CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')) DEFAULT 'scheduled',
          joinUrl TEXT,
          recordingUrl TEXT,
          recordingAvailability BOOLEAN DEFAULT FALSE,
          chatEnabled BOOLEAN DEFAULT TRUE,
          pollsEnabled BOOLEAN DEFAULT TRUE,
          FOREIGN KEY (courseId) REFERENCES Courses(id),
          FOREIGN KEY (educatorId) REFERENCES Educators(id)
        );
CREATE TABLE LiveClassParticipants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          classId INTEGER NOT NULL,
          userId INTEGER NOT NULL,
          joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          leftAt DATETIME,
          attendanceDuration INTEGER,
          FOREIGN KEY (classId) REFERENCES LiveClasses(id),
          FOREIGN KEY (userId) REFERENCES Users(id),
          UNIQUE(classId, userId)
        );

CREATE TABLE  LiveClassQuestions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          classId INTEGER NOT NULL,
          userId INTEGER NOT NULL,
          question TEXT NOT NULL,
          timestamp INTEGER,
          isAnswered BOOLEAN DEFAULT FALSE,
          askedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (classId) REFERENCES LiveClasses(id),
          FOREIGN KEY (userId) REFERENCES Users(id)
        )

CREATE TABLE Enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    courseId INTEGER NOT NULL,
    enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiryDate DATETIME,
    completed BOOLEAN DEFAULT FALSE,
    progress INTEGER DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (courseId) REFERENCES Courses(id),
    UNIQUE(userId, courseId)
);

-- Watch History
CREATE TABLE WatchHistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    lessonId INTEGER NOT NULL,
    watchedDuration INTEGER DEFAULT 0,
    totalDuration INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    lastWatched DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (lessonId) REFERENCES Lessons(id),
    UNIQUE(userId, lessonId)
);
-- Tests
CREATE TABLE Tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    courseId INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('practice', 'mock', 'chapter')) NOT NULL,
    subject TEXT,
    totalQuestions INTEGER NOT NULL,
    totalMarks INTEGER NOT NULL,
    duration INTEGER NOT NULL,  -- in minutes
    passingScore INTEGER,
    difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'hard')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (courseId) REFERENCES Courses(id));

-- Test Attempts
CREATE TABLE  TestQuestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    testId INTEGER NOT NULL,
    questionText TEXT NOT NULL,
    options TEXT NOT NULL, -- JSON array of options
    correctOption INTEGER NOT NULL,
    marks INTEGER DEFAULT 4,
    negativeMarks INTEGER DEFAULT 1,
    subject TEXT,
    topic TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'hard')),
    FOREIGN KEY (testId) REFERENCES Tests(id));

CREATE TABLE  TestSessions (
    id TEXT PRIMARY KEY,
    testId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME,
    completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (testId) REFERENCES Tests(id),
    FOREIGN KEY (userId) REFERENCES Users(id)
  )

  CREATE TABLE TestAttempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId TEXT NOT NULL,
    questionId INTEGER NOT NULL,
    selectedOption INTEGER,
    isCorrect BOOLEAN,
    timeSpent INTEGER, -- in seconds
    FOREIGN KEY (sessionId) REFERENCES TestSessions(id),
    FOREIGN KEY (questionId) REFERENCES TestQuestions(id)
  )

CREATE TABLE TestResults (
    sessionId TEXT PRIMARY KEY,
    userId INTEGER NOT NULL,
    testId INTEGER NOT NULL,
    score INTEGER NOT NULL,
    totalMarks INTEGER NOT NULL,
    correctAnswers INTEGER NOT NULL,
    incorrectAnswers INTEGER NOT NULL,
    unattempted INTEGER NOT NULL,
    timeTaken INTEGER NOT NULL, -- in seconds
    percentile REAL,
    rank INTEGER,
    completedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sessionId) REFERENCES TestSessions(id),
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (testId) REFERENCES Tests(id)
  )

-- User Streaks Tracking
CREATE TABLE UserStreaks (
    userId INTEGER PRIMARY KEY,
    streakDays INTEGER NOT NULL DEFAULT 0,
    lastActiveDate DATE NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id)
);

-- Course Chapters
CREATE TABLE Chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    courseId INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    orderInCourse INTEGER NOT NULL,
    FOREIGN KEY (courseId) REFERENCES Courses(id)
);
  
-- Subscriptions
CREATE TABLE Subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    planId INTEGER NOT NULL,
    startDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    endDate DATETIME NOT NULL,
    paymentAmount REAL NOT NULL,
    status TEXT CHECK (status IN ('active', 'expired', 'cancelled')),
    FOREIGN KEY (userId) REFERENCES Users(id)
);

-- Doubt Sessions Table
CREATE TABLE DoubtSessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    courseId INTEGER,
    lessonId INTEGER,
    status TEXT NOT NULL CHECK (status IN ('open', 'resolved', 'closed')) DEFAULT 'open',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (courseId) REFERENCES Courses(id),
    FOREIGN KEY (lessonId) REFERENCES Lessons(id)
);

-- Doubt Questions Table
CREATE TABLE DoubtQuestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doubtSessionId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    questionText TEXT NOT NULL,
    attachments TEXT, -- JSON array of file URLs
    isAnonymous BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doubtSessionId) REFERENCES DoubtSessions(id),
    FOREIGN KEY (userId) REFERENCES Users(id)
);

-- Doubt Answers Table
CREATE TABLE DoubtAnswers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    questionId INTEGER NOT NULL,
    educatorId INTEGER NOT NULL,
    answerText TEXT NOT NULL,
    attachments TEXT, -- JSON array of file URLs
    isVerified BOOLEAN DEFAULT FALSE, -- For marking as "correct answer"
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (questionId) REFERENCES DoubtQuestions(id),
    FOREIGN KEY (educatorId) REFERENCES Users(id)
);

-- Doubt Votes Table (for upvoting helpful answers)
CREATE TABLE DoubtVotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    answerId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    voteType TEXT CHECK (voteType IN ('up', 'down')) DEFAULT 'up',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (answerId) REFERENCES DoubtAnswers(id),
    FOREIGN KEY (userId) REFERENCES Users(id),
    UNIQUE(answerId, userId) -- Prevent duplicate votes
);

-- Doubt Tags Table (for categorizing doubts)
CREATE TABLE DoubtTags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- Doubt-Tag Mapping Table
CREATE TABLE DoubtSessionTags (
    doubtSessionId INTEGER NOT NULL,
    tagId INTEGER NOT NULL,
    PRIMARY KEY (doubtSessionId, tagId),
    FOREIGN KEY (doubtSessionId) REFERENCES DoubtSessions(id),
    FOREIGN KEY (tagId) REFERENCES DoubtTags(id)
);
-- Study Materials Table
CREATE TABLE StudyMaterials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    courseId INTEGER,
    lessonId INTEGER,
    chapter TEXT,
    fileUrl TEXT NOT NULL,
    fileType TEXT NOT NULL CHECK (fileType IN ('pdf', 'video', 'audio', 'image', 'ppt', 'doc')),
    fileSize INTEGER NOT NULL, -- in KB
    isFree BOOLEAN DEFAULT FALSE,
    downloadPermission TEXT CHECK (downloadPermission IN ('all', 'enrolled', 'subscribed', 'none')) DEFAULT 'enrolled',
    uploaderId INTEGER NOT NULL, -- Educator who uploaded
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (courseId) REFERENCES Courses(id),
    FOREIGN KEY (lessonId) REFERENCES Lessons(id),
    FOREIGN KEY (uploaderId) REFERENCES Users(id)
);

-- Material Downloads Tracking Table
CREATE TABLE MaterialDownloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    materialId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    downloadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (materialId) REFERENCES StudyMaterials(id),
    FOREIGN KEY (userId) REFERENCES Users(id)
);

-- Material Views Tracking Table
CREATE TABLE MaterialViews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    materialId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    viewedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration INTEGER, -- in seconds (for videos/audio)
    FOREIGN KEY (materialId) REFERENCES StudyMaterials(id),
    FOREIGN KEY (userId) REFERENCES Users(id)
);

-- Material Bookmarks Table
CREATE TABLE MaterialBookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    materialId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (materialId) REFERENCES StudyMaterials(id),
    FOREIGN KEY (userId) REFERENCES Users(id),
    UNIQUE(materialId, userId) -- Prevent duplicate bookmarks
);