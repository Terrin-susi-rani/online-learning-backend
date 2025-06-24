const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register Learner
exports.registerLearner = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, mobile, targetExam, preferredLanguage, currentLevel } = req.body;

    try {
        db.get("SELECT email FROM Users WHERE email = ?", [email], async (err, row) => {
            if (row) return res.status(400).json({ error: "Email already exists" });

            const hashedPassword = await bcrypt.hash(password, 10);
            db.run(
                `INSERT INTO Users (name, email, password, mobile, role, targetExam, preferredLanguage, currentLevel) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, email, hashedPassword, mobile, 'learner', targetExam, preferredLanguage, currentLevel],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    
                    const token = jwt.sign(
                        { id: this.lastID, role: 'learner' },
                        JWT_SECRET,
                        { expiresIn: '7d' }
                    );
                    
                    res.status(201).json({
                        success: true,
                        message: "Registration successful",
                        userId: this.lastID,
                        token,
                        user: {
                            id: this.lastID,
                            name,
                            email,
                            role: 'learner',
                            targetExam,
                            preferredLanguage,
                            currentLevel
                        }
                    });
                }
            );
        });
    } catch (err) {
        res.status(500).json({ error: "Registration failed" });
    }
};

// Register Educator 
exports.registerEducator = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, mobile, subjects, qualification, experience, rating } = req.body;

    try {
        db.get("SELECT email FROM Users WHERE email = ?", [email], async (err, row) => {
            if (row) return res.status(400).json({ error: "Email already exists" });

            const hashedPassword = await bcrypt.hash(password, 10);
            db.run(
                `INSERT INTO Users (name, email, password, mobile, role) 
                 VALUES (?, ?, ?, ?, ?)`,
                [name, email, hashedPassword, mobile, 'educator'],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    
                    const userId = this.lastID;
                    db.run(
                        `INSERT INTO Educators (userId, subjects, qualification, experience, rating)
                         VALUES (?, ?, ?, ?, ?)`,
                        [userId, JSON.stringify(subjects), qualification, experience, rating || 0], // Default rating to 0 if not provided
                        function(err) {
                            if (err) return res.status(500).json({ error: err.message });
                            
                            const token = jwt.sign(
                                { id: userId, role: 'educator' },
                                JWT_SECRET,
                                { expiresIn: '7d' }
                            );
                            
                            res.status(201).json({
                                success: true,
                                message: "Educator registration successful",
                                userId,
                                token
                            });
                        }
                    );
                }
            );
        });
    } catch (err) {
        res.status(500).json({ error: "Registration failed" });
    }
};


// Login
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    try {
        db.get(`
            SELECT u.*, e.subjects, e.qualification 
            FROM Users u
            LEFT JOIN Educators e ON e.userId = u.id
            WHERE u.email = ? AND u.role = ?
        `, [email, role], async (err, user) => {
            if (!user) return res.status(404).json({ error: "User not found" });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

            const token = jwt.sign(
                { id: user.id, role: user.role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

             const response = {
        success: true,
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
            if (user.role === 'educator') {
        response.user.subjects = JSON.parse(user.subjects);
        response.user.qualification = user.qualification;
        response.user.experience = user.experience;
        response.user.rating = user.rating;  // Added rating to response
    } else {
        response.user.targetExam = user.targetExam;
        response.user.preferredLanguage = user.preferredLanguage;
         response.user.currentLevel = user.currentLevel;
    }

    res.json(response);
        });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
};