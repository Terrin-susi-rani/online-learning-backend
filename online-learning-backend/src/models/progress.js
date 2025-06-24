const db = require('../../db/database');

const updateWatchHistory = (data, callback) => {
  const query = `INSERT INTO watch_history (user_id, lesson_id, watched_seconds, last_watched_at, completed)
                 VALUES (?, ?, ?, ?, ?)
                 ON CONFLICT(user_id, lesson_id) DO UPDATE SET
                 watched_seconds = excluded.watched_seconds,
                 last_watched_at = excluded.last_watched_at,
                 completed = excluded.completed`;
  const values = [
    data.user_id,
    data.lesson_id,
    data.watched_seconds,
    data.last_watched_at,
    data.completed,
  ];
  db.run(query, values, callback);
};

const getUserProgress = (userId, callback) => {
  const query = `SELECT * FROM watch_history WHERE user_id = ?`;
  db.all(query, [userId], callback);
};

module.exports = { updateWatchHistory, getUserProgress };