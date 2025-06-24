const db = require('../../db/database');

const enrollUser = (userId, courseId, expiry_date, callback) => {
  const query = `INSERT INTO enrollments (user_id, course_id, expiry_date)
                 VALUES (?, ?, ?)`;
  db.run(query, [userId, courseId, expiry_date], function (err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID, userId, courseId });
  });
};

const getUserEnrollments = (userId, callback) => {
  const query = `SELECT * FROM enrollments WHERE user_id = ?`;
  db.all(query, [userId], callback);
};

module.exports = { enrollUser, getUserEnrollments };