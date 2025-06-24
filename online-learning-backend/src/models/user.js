const db = require('../../db/database');

const createUser = (data, callback) => {
  const query = `INSERT INTO users (name, email, password, target_exam, preferred_language, preparation_level)
                 VALUES (?, ?, ?, ?, ?, ?)`;
  const values = [
    data.name,
    data.email,
    data.password,
    data.target_exam,
    data.preferred_language,
    data.preparation_level,
  ];
  db.run(query, values, function (err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID, ...data });
  });
};

const findUserByEmail = (email, callback) => {
  db.get(`SELECT * FROM users WHERE email = ?`, [email], callback);
};

module.exports = { createUser, findUserByEmail };