const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/sqliteDb');

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please include all fields' });
        }

        // Check if user already exists
        db.get(`SELECT id FROM users WHERE email = ?`, [email], async (err, row) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({ message: 'Server error', error: err.message });
            }

            if (row) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            db.run(
                `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
                [name, email, hashedPassword],
                function (err) {
                    if (err) {
                        console.error("Insert error:", err);
                        return res.status(500).json({ message: 'Server error', error: err.message });
                    }

                    // this.lastID contains the auto-incremented id
                    res.status(201).json({
                        _id: this.lastID,
                        name: name,
                        email: email,
                        token: generateToken(this.lastID),
                    });
                }
            );
        });

    } catch (error) {
        console.error("REGISTER ERROR DETAILS:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login user / get token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please include an email and password' });
        }

        // Check for user
        db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
            if (err) {
                return res.status(500).json({ message: 'Server error', error: err.message });
            }

            if (user && (await bcrypt.compare(password, user.password))) {
                res.json({
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user.id),
                });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
