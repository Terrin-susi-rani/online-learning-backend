const db = require('../../db/database');

const getAllCourses = (callback) => {
  db.all(`SELECT * FROM courses`, [], callback);
};

const createCourse = (data, callback) => {
  const query = `INSERT INTO courses (title, description, target_exam, duration_weeks, validity_days, price, discount_percent, course_type, educator_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    data.title,
    data.description,
    data.target_exam,
    data.duration_weeks,
    data.validity_days,
    data.price,
    data.discount_percent,
    data.course_type,
    data.educator_id,
  ];
  db.run(query, values, function (err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID, ...data });
  });
};

module.exports = { getAllCourses, createCourse };