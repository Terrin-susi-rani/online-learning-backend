const sqlite3 = require('sqlite3').verbose();



// Initialize database connection
const db = new sqlite3.Database('../../online-learning.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');

    // Run schema creation
    db.serialize(() => {
      db.exec(`
        -- User Streaks Tracking
        CREATE TABLE IF NOT EXISTS UserStreaks (
          userId INTEGER PRIMARY KEY,
          streakDays INTEGER NOT NULL DEFAULT 0,
          lastActiveDate DATE NOT NULL,
          FOREIGN KEY (userId) REFERENCES Users(id)
        );

        -- Course Chapters
        CREATE TABLE IF NOT EXISTS Chapters (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          courseId INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          orderInCourse INTEGER NOT NULL,
          FOREIGN KEY (courseId) REFERENCES Courses(id)
        );
      `, (err) => {
        if (err) {
          console.error('Error creating tables:', err.message);
        } else {
          console.log('✅ Tables created or already exist.');
        }
      });
    });
  }
});

module.exports = db;

  
