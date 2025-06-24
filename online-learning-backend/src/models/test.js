const db = require('../../db/database');

const createTest = (data, callback) => {
  const query = `INSERT INTO tests (title, course_id, is_mock, question_bank, time_limit_minutes)
                 VALUES (?, ?, ?, ?, ?)`;
  const values = [
    data.title,
    data.course_id,
    data.is_mock,
    data.question_bank,
    data.time_limit_minutes,
  ];
  db.run(query, values, function (err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID, ...data });
  });
};

module.exports = { createTest };