const db = require('../../db/database');

const createEducator = (data, callback) => {
  const query = `INSERT INTO educators (name, email, password, profile, subjects, rating, review_count, verified, years_experience)
                 VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?)`;
  const values = [
    data.name,
    data.email,
    data.password,
    data.profile,
    data.subjects,
    data.years_experience,
  ];
  db.run(query, values, function (err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID, ...data });
  });
};

module.exports = { createEducator };