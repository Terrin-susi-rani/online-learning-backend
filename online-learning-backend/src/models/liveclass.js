const db = require('../../db/database');

const createLiveClass = (data, callback) => {
  const query = `INSERT INTO live_classes (title, scheduled_time, educator_id, max_students, recording_url)
                 VALUES (?, ?, ?, ?, ?)`;
  const values = [
    data.title,
    data.scheduled_time,
    data.educator_id,
    data.max_students,
    data.recording_url,
  ];
  db.run(query, values, function (err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID, ...data });
  });
};

const getUpcomingLiveClasses = (callback) => {
  const now = new Date().toISOString();
  db.all(`SELECT * FROM live_classes WHERE scheduled_time > ? ORDER BY scheduled_time ASC`, [now], callback);
};

module.exports = { createLiveClass, getUpcomingLiveClasses };