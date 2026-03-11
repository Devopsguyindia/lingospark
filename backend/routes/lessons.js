const express = require('express');
const { pool } = require('../utils/db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/lessons — list lessons with filters
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { level, skill, language } = req.query;
        let query = `SELECT id, language_code, cefr_level, skill, title, title_translation, description, description_translation, order_index 
                 FROM lessons WHERE 1=1`;
        const params = [];

        if (level) {
            query += ' AND cefr_level = ?';
            params.push(level);
        }
        if (skill) {
            query += ' AND skill = ?';
            params.push(skill);
        }
        if (language) {
            query += ' AND language_code = ?';
            params.push(language);
        } else {
            query += ' AND language_code = ?';
            params.push('en');
        }

        query += ' ORDER BY cefr_level, skill, order_index';

        const [lessons] = await pool.query(query, params);

        // If user is authenticated, attach their progress
        if (req.user) {
            const [progressRows] = await pool.query(
                'SELECT lesson_id, score, stars, completed FROM progress WHERE user_id = ?',
                [req.user.id]
            );
            const progressMap = {};
            progressRows.forEach(p => { progressMap[p.lesson_id] = p; });

            lessons.forEach(lesson => {
                lesson.progress = progressMap[lesson.id] || null;
            });
        }

        res.json({ lessons });
    } catch (err) {
        console.error('Lessons list error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/lessons/:id — single lesson with full content
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, language_code, cefr_level, skill, title, title_translation, description, description_translation, content, order_index FROM lessons WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        const lesson = rows[0];

        // Parse content if it's a string
        if (typeof lesson.content === 'string') {
            lesson.content = JSON.parse(lesson.content);
        }

        // Attach user progress if authenticated
        if (req.user) {
            const [progress] = await pool.query(
                'SELECT * FROM progress WHERE user_id = ? AND lesson_id = ?',
                [req.user.id, lesson.id]
            );
            lesson.userProgress = progress[0] || null;
        }

        res.json({ lesson });
    } catch (err) {
        console.error('Lesson detail error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/lessons/skills/summary — summary of lessons per skill and level
router.get('/skills/summary', optionalAuth, async (req, res) => {
    try {
        const language = req.query.language || 'en';

        const [rows] = await pool.query(
            `SELECT cefr_level, skill, COUNT(*) as total_lessons
       FROM lessons WHERE language_code = ?
       GROUP BY cefr_level, skill
       ORDER BY cefr_level, FIELD(skill, 'listening', 'speaking', 'reading', 'writing')`,
            [language]
        );

        // If authenticated, get completed counts
        let completedMap = {};
        if (req.user) {
            const [completed] = await pool.query(
                `SELECT l.cefr_level, l.skill, COUNT(*) as completed_count
         FROM progress p
         JOIN lessons l ON p.lesson_id = l.id
         WHERE p.user_id = ? AND p.completed = TRUE AND l.language_code = ?
         GROUP BY l.cefr_level, l.skill`,
                [req.user.id, language]
            );
            completed.forEach(c => {
                completedMap[`${c.cefr_level}_${c.skill}`] = c.completed_count;
            });
        }

        const summary = rows.map(row => ({
            ...row,
            completed_lessons: completedMap[`${row.cefr_level}_${row.skill}`] || 0
        }));

        res.json({ summary });
    } catch (err) {
        console.error('Skills summary error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
