const db = require('../../db/database');

const createSubscription = (data, callback) => {
  const query = `INSERT INTO subscriptions (user_id, plan_type, features, start_date, end_date, payment_reference)
                 VALUES (?, ?, ?, ?, ?, ?)`;
  const values = [
    data.user_id,
    data.plan_type,
    data.features,
    data.start_date,
    data.end_date,
    data.payment_reference,
  ];
  db.run(query, values, function (err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID, ...data });
  });
};

module.exports = { createSubscription };