const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'No token provided' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check if user still exists
        const user = await new Promise((resolve) => {
            db.get('SELECT id, email, role FROM Users WHERE id = ?', 
                 [decoded.id], (err, row) => resolve(row));
        });

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Check if token matches user role
        if (decoded.role !== user.role) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token for user role' 
            });
        }

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        next();
    } catch (err) {
        console.error('Authentication error:', err.message);
        res.status(401).json({ 
            success: false,
            message: 'Please authenticate' 
        });
    }
};

module.exports = { auth };