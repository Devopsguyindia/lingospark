const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, display_name, age, target_language } = req.body;

        // Validation
        if (!username || !email || !password || !display_name || !age) {
            return res.status(400).json({ error: 'All fields are required: username, email, password, display_name, age' });
        }

        if (age < 6) {
            return res.status(400).json({ error: 'Learner must be at least 6 years old' });
        }

        if (password.length < 4) {
            return res.status(400).json({ error: 'Password must be at least 4 characters' });
        }

        // Check if username or email already exists
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await pool.query(
            `INSERT INTO users (username, email, password_hash, display_name, age, target_language)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [username, email, password_hash, display_name, age, target_language || 'en']
        );

        // Generate JWT
        const token = jwt.sign(
            { id: result.insertId, username, email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            message: 'Registration successful!',
            token,
            user: {
                id: result.insertId,
                username,
                email,
                display_name,
                age,
                cefr_level: 'A1',
                target_language: target_language || 'en',
                avatar: 'default',
                total_stars: 0,
                total_xp: 0
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = rows[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                display_name: user.display_name,
                age: user.age,
                cefr_level: user.cefr_level,
                target_language: user.target_language,
                avatar: user.avatar,
                total_stars: user.total_stars,
                total_xp: user.total_xp
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, username, email, display_name, avatar, age, cefr_level, 
              target_language, total_stars, total_xp, created_at 
       FROM users WHERE id = ?`,
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: rows[0] });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/auth/profile — update profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { display_name, avatar, target_language } = req.body;
        const updates = [];
        const values = [];

        if (display_name) { updates.push('display_name = ?'); values.push(display_name); }
        if (avatar) { updates.push('avatar = ?'); values.push(avatar); }
        if (target_language) { updates.push('target_language = ?'); values.push(target_language); }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(req.user.id);
        await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        const [rows] = await pool.query(
            `SELECT id, username, email, display_name, avatar, age, cefr_level, 
              target_language, total_stars, total_xp FROM users WHERE id = ?`,
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User no longer exists. Please re-register.' });
        }

        res.json({ message: 'Profile updated', user: rows[0] });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
