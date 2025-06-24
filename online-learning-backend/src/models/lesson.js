const db = require('../../db/database');

const getLessonsByCourseId = (courseId, callback) => {
  db.all(`SELECT * FROM lessons WHERE course_id = ? ORDER BY lesson_order ASC`, [courseId], callback);
};

const createLesson = (data, callback) => {
  const query = `INSERT INTO lessons (course_id, title, video_url, duration_minutes, lesson_order, resources)
                 VALUES (?, ?, ?, ?, ?, ?)`;
  const values = [
    data.course_id,
    data.title,
    data.video_url,
    data.duration_minutes,
    data.lesson_order,
    data.resources,
  ];
  db.run(query, values, function (err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID, ...data });
  });
};

module.exports = { getLessonsByCourseId, createLesson };