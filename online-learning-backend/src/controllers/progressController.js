const db = require('../config/database');
const { auth } = require('../middleware/auth');

// Helper function to get current week's dates (Sunday to Saturday)
function getCurrentWeekDates() {
    const now = new Date();
    const day = now.getDay(); // 0 (Sunday) to 6 (Saturday)
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - day);
    startDate.setHours(0, 0, 0, 0);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
}

// GET /api/progress/dashboard
async function getDashboard(req, res) {
    try {
        const userId = req.user.id;
        
        // Get streak days
        const streakQuery = `
            SELECT streakDays FROM UserStreaks WHERE userId = ?
        `;
        const streakDays = await new Promise((resolve, reject) => {
            db.get(streakQuery, [userId], (err, row) => {
                if (err) reject(err);
                resolve(row ? row.streakDays : 0);
            });
        });
        
        // Get total watch time (in minutes)
        const watchTimeQuery = `
            SELECT SUM(watchedDuration) / 60 AS totalWatchTime 
            FROM WatchHistory 
            WHERE userId = ?
        `;
        const totalWatchTime = await new Promise((resolve, reject) => {
            db.get(watchTimeQuery, [userId], (err, row) => {
                if (err) reject(err);
                resolve(row ? Math.floor(row.totalWatchTime) : 0);
            });
        });
        
        // Get course stats
        const courseQuery = `
            SELECT 
                COUNT(*) AS coursesEnrolled,
                SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS coursesCompleted
            FROM Enrollments
            WHERE userId = ?
        `;
        const courseStats = await new Promise((resolve, reject) => {
            db.get(courseQuery, [userId], (err, row) => {
                if (err) reject(err);
                resolve(row || { coursesEnrolled: 0, coursesCompleted: 0 });
            });
        });
        
        // Get upcoming live classes (next 7 days)
        const upcomingQuery = `
            SELECT COUNT(*) AS upcomingClasses
            FROM LiveClassParticipants lcp
            JOIN LiveClasses lc ON lcp.classId = lc.id
            WHERE lcp.userId = ? 
            AND lc.scheduledAt BETWEEN datetime('now') AND datetime('now', '+7 days')
            AND lc.status = 'scheduled'
        `;
        const upcomingClasses = await new Promise((resolve, reject) => {
            db.get(upcomingQuery, [userId], (err, row) => {
                if (err) reject(err);
                resolve(row ? row.upcomingClasses : 0);
            });
        });
        
        // Get pending tests
        const pendingTestsQuery = `
            SELECT COUNT(*) AS pendingTests
            FROM Tests t
            WHERE t.courseId IN (
                SELECT courseId FROM Enrollments WHERE userId = ?
            )
            AND t.id NOT IN (
                SELECT testId FROM TestSessions WHERE userId = ? AND completed = 1
            )
        `;
        const pendingTests = await new Promise((resolve, reject) => {
            db.get(pendingTestsQuery, [userId, userId], (err, row) => {
                if (err) reject(err);
                resolve(row ? row.pendingTests : 0);
            });
        });
        
        // Get weekly progress (last 7 days)
        const weekDates = getCurrentWeekDates();
        const weeklyWatchTime = Array(7).fill(0);
        const weeklyLessonsCompleted = Array(7).fill(0);
        
        // Get watch time per day
        const weeklyWatchQuery = `
            SELECT 
                strftime('%w', lastWatched) AS dayOfWeek,
                SUM(watchedDuration) / 60 AS watchTime
            FROM WatchHistory
            WHERE userId = ?
            AND date(lastWatched) BETWEEN date(?, '-6 days') AND date(?)
            GROUP BY dayOfWeek
        `;
        const watchResults = await new Promise((resolve, reject) => {
            db.all(weeklyWatchQuery, [userId, weekDates[6], weekDates[6]], (err, rows) => {
                if (err) reject(err);
                resolve(rows || []);
            });
        });
        
        watchResults.forEach(row => {
            const dayIndex = parseInt(row.dayOfWeek); // 0 (Sunday) to 6 (Saturday)
            weeklyWatchTime[dayIndex] = Math.floor(row.watchTime);
        });
        
        // Get lessons completed per day
        const weeklyLessonsQuery = `
            SELECT 
                strftime('%w', lastWatched) AS dayOfWeek,
                COUNT(*) AS lessonsCompleted
            FROM WatchHistory
            WHERE userId = ?
            AND completed = 1
            AND date(lastWatched) BETWEEN date(?, '-6 days') AND date(?)
            GROUP BY dayOfWeek
        `;
        const lessonResults = await new Promise((resolve, reject) => {
            db.all(weeklyLessonsQuery, [userId, weekDates[6], weekDates[6]], (err, rows) => {
                if (err) reject(err);
                resolve(rows || []);
            });
        });
        
        lessonResults.forEach(row => {
            const dayIndex = parseInt(row.dayOfWeek);
            weeklyLessonsCompleted[dayIndex] = row.lessonsCompleted;
        });
        
        // Construct response
        res.json({
            success: true,
            dashboard: {
                streakDays: streakDays,
                totalWatchTime: totalWatchTime,
                coursesEnrolled: courseStats.coursesEnrolled,
                coursesCompleted: courseStats.coursesCompleted,
                upcomingClasses: upcomingClasses,
                pendingTests: pendingTests,
                weeklyProgress: {
                    watchTime: weeklyWatchTime,
                    lessonsCompleted: weeklyLessonsCompleted
                }
            }
        });
        
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// GET /api/progress/course/:courseId
async function getCourseProgress(req, res) {
    try {
        const userId = req.user.id;
        const courseId = req.params.courseId;
        
        // Basic course enrollment info
        const enrollmentQuery = `
            SELECT 
                e.enrolledAt,
                e.expiryDate,
                e.progress AS overallProgress,
                e.completed,
                c.title AS courseTitle,
                c.duration AS courseDuration
            FROM Enrollments e
            JOIN Courses c ON e.courseId = c.id
            WHERE e.userId = ? AND e.courseId = ?
        `;
        const enrollment = await new Promise((resolve, reject) => {
            db.get(enrollmentQuery, [userId, courseId], (err, row) => {
                if (err) reject(err);
                if (!row) reject(new Error('Course not found or not enrolled'));
                resolve(row);
            });
        });
        
        // Chapter-wise progress
        const chaptersQuery = `
            SELECT 
                ch.name,
                COUNT(l.id) AS totalLessons,
                SUM(CASE WHEN wh.completed = 1 THEN 1 ELSE 0 END) AS completedLessons,
                CASE 
                    WHEN COUNT(l.id) = 0 THEN 0
                    ELSE ROUND(SUM(CASE WHEN wh.completed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(l.id)
                END AS progress
            FROM Chapters ch
            LEFT JOIN Lessons l ON ch.id = l.chapterId
            LEFT JOIN WatchHistory wh ON l.id = wh.lessonId AND wh.userId = ?
            WHERE ch.courseId = ?
            GROUP BY ch.id, ch.name
            ORDER BY ch.orderInCourse
        `;
        const chapters = await new Promise((resolve, reject) => {
            db.all(chaptersQuery, [userId, courseId], (err, rows) => {
                if (err) reject(err);
                resolve(rows || []);
            });
        });
        
        // Test attempts and average score
        const testsQuery = `
            SELECT 
                COUNT(tr.sessionId) AS testsAttempted,
                ROUND(AVG(tr.score * 100.0 / tr.totalMarks), 2) AS avgTestScore
            FROM TestResults tr
            JOIN Tests t ON tr.testId = t.id
            WHERE tr.userId = ? AND t.courseId = ?
        `;
        const testStats = await new Promise((resolve, reject) => {
            db.get(testsQuery, [userId, courseId], (err, row) => {
                if (err) reject(err);
                resolve(row || { testsAttempted: 0, avgTestScore: 0 });
            });
        });
        
        // Certificate eligibility (example: at least 80% progress and average test score >= 60)
        const certificateEligible = 
            enrollment.overallProgress >= 80 && 
            testStats.avgTestScore >= 60 &&
            enrollment.completed;
        
        // Construct response
        res.json({
            success: true,
            progress: {
                courseId: courseId,
                courseTitle: enrollment.courseTitle,
                enrolledOn: enrollment.enrolledAt,
                validity: enrollment.expiryDate,
                overallProgress: enrollment.overallProgress,
                chapters: chapters,
                testsAttempted: testStats.testsAttempted,
                avgTestScore: testStats.avgTestScore,
                certificateEligible: certificateEligible
            }
        });
        
    } catch (error) {
        console.error('Course progress error:', error);
        if (error.message === 'Course not found or not enrolled') {
            res.status(404).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}

module.exports = {
    getDashboard,
    getCourseProgress
};