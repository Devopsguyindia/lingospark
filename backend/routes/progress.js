const express = require('express');
const { pool } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/progress — record or update a lesson attempt
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { lesson_id, score, time_spent_seconds } = req.body;
        const user_id = req.user.id;

        if (!lesson_id || score === undefined) {
            return res.status(400).json({ error: 'lesson_id and score are required' });
        }

        // Get lesson info
        const [lessonRows] = await pool.query('SELECT * FROM lessons WHERE id = ?', [lesson_id]);
        if (lessonRows.length === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        const lesson = lessonRows[0];

        // Calculate stars based on score
        let stars = 0;
        if (score >= 90) stars = 3;
        else if (score >= 70) stars = 2;
        else if (score >= 50) stars = 1;

        const completed = score >= 50;

        // Check existing progress
        const [existing] = await pool.query(
            'SELECT * FROM progress WHERE user_id = ? AND lesson_id = ?',
            [user_id, lesson_id]
        );

        let progressId;
        if (existing.length > 0) {
            // Update: keep best score, add attempt
            const bestScore = Math.max(existing[0].score, score);
            const bestStars = Math.max(existing[0].stars, stars);
            const isNowCompleted = existing[0].completed || completed;

            await pool.query(
                `UPDATE progress 
         SET score = ?, stars = ?, completed = ?, attempts = attempts + 1, 
             time_spent_seconds = time_spent_seconds + ?,
             completed_at = IF(? AND completed_at IS NULL, NOW(), completed_at)
         WHERE user_id = ? AND lesson_id = ?`,
                [bestScore, bestStars, isNowCompleted, time_spent_seconds || 0, isNowCompleted, user_id, lesson_id]
            );
            progressId = existing[0].id;
        } else {
            // Insert new progress
            const [result] = await pool.query(
                `INSERT INTO progress (user_id, lesson_id, skill, score, stars, completed, time_spent_seconds, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [user_id, lesson_id, lesson.skill, score, stars, completed, time_spent_seconds || 0, completed ? new Date() : null]
            );
            progressId = result.insertId;
        }

        // Update user XP and stars
        if (completed) {
            const xpGained = score; // 1 XP per score point
            await pool.query(
                `UPDATE users SET total_xp = total_xp + ?, total_stars = (
          SELECT COALESCE(SUM(stars), 0) FROM progress WHERE user_id = ?
        ) WHERE id = ?`,
                [xpGained, user_id, user_id]
            );
        }

        // Check for badges
        const earnedBadges = await checkAndAwardBadges(user_id, lesson.skill, lesson.cefr_level);

        res.json({
            message: completed ? '🎉 Lesson completed!' : 'Progress saved',
            progress: { id: progressId, score, stars, completed },
            xp_gained: completed ? score : 0,
            new_badges: earnedBadges
        });
    } catch (err) {
        console.error('Progress save error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/progress/summary — overall progress overview
router.get('/summary', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;

        // Per-skill stats
        const [skillStats] = await pool.query(
            `SELECT p.skill,
              COUNT(*) as total_attempted,
              SUM(p.completed) as total_completed,
              ROUND(AVG(p.score), 1) as avg_score,
              SUM(p.stars) as total_stars,
              SUM(p.time_spent_seconds) as total_time
       FROM progress p
       WHERE p.user_id = ?
       GROUP BY p.skill
       ORDER BY FIELD(p.skill, 'listening', 'speaking', 'reading', 'writing')`,
            [user_id]
        );

        // Per-level stats
        const [levelStats] = await pool.query(
            `SELECT l.cefr_level,
              COUNT(DISTINCT p.lesson_id) as lessons_attempted,
              SUM(p.completed) as lessons_completed,
              (SELECT COUNT(*) FROM lessons WHERE cefr_level = l.cefr_level AND language_code = 'en') as total_lessons
       FROM progress p
       JOIN lessons l ON p.lesson_id = l.id
       WHERE p.user_id = ?
       GROUP BY l.cefr_level`,
            [user_id]
        );

        // Badges earned
        const [badges] = await pool.query(
            `SELECT b.name, b.description, b.icon, b.skill, b.cefr_level, ub.earned_at
       FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = ?
       ORDER BY ub.earned_at DESC`,
            [user_id]
        );

        // User info
        const [userRows] = await pool.query(
            'SELECT total_stars, total_xp, cefr_level FROM users WHERE id = ?',
            [user_id]
        );

        res.json({
            user: userRows[0],
            skill_stats: skillStats,
            level_stats: levelStats,
            badges,
            total_badges: badges.length
        });
    } catch (err) {
        console.error('Progress summary error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/progress/skill/:skill — detailed progress for one skill
router.get('/skill/:skill', authenticateToken, async (req, res) => {
    try {
        const { skill } = req.params;
        const level = req.query.level || null;
        const user_id = req.user.id;

        let query = `
      SELECT l.id, l.title, l.description, l.cefr_level, l.order_index,
             p.score, p.stars, p.completed, p.attempts, p.time_spent_seconds, p.completed_at
      FROM lessons l
      LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = ?
      WHERE l.skill = ? AND l.language_code = 'en'`;
        const params = [user_id, skill];

        if (level) {
            query += ' AND l.cefr_level = ?';
            params.push(level);
        }

        query += ' ORDER BY l.cefr_level, l.order_index';

        const [rows] = await pool.query(query, params);

        res.json({ skill, lessons: rows });
    } catch (err) {
        console.error('Skill progress error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Helper: Check and award badges
async function checkAndAwardBadges(userId, skill, cefrLevel) {
    const earnedBadges = [];

    try {
        // Count completed lessons for this skill and level
        const [counts] = await pool.query(
            `SELECT COUNT(*) as count FROM progress p
       JOIN lessons l ON p.lesson_id = l.id
       WHERE p.user_id = ? AND p.completed = TRUE AND l.skill = ? AND l.cefr_level = ?`,
            [userId, skill, cefrLevel]
        );
        const completedCount = counts[0].count;

        // Find eligible badges
        const [eligibleBadges] = await pool.query(
            `SELECT b.* FROM badges b
       WHERE b.skill = ? AND (b.cefr_level = ? OR b.cefr_level IS NULL)
         AND b.requirement_type = 'lessons_completed'
         AND b.requirement_value <= ?
         AND b.id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = ?)`,
            [skill, cefrLevel, completedCount, userId]
        );

        for (const badge of eligibleBadges) {
            await pool.query(
                'INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)',
                [userId, badge.id]
            );
            earnedBadges.push({ name: badge.name, icon: badge.icon, description: badge.description });
        }

        // Check for general "all skills complete" badges
        const [allSkillCounts] = await pool.query(
            `SELECT l.skill, COUNT(*) as completed
       FROM progress p JOIN lessons l ON p.lesson_id = l.id
       WHERE p.user_id = ? AND p.completed = TRUE AND l.cefr_level = ?
       GROUP BY l.skill`,
            [userId, cefrLevel]
        );

        if (allSkillCounts.length === 4) {
            // Check if all skills have at least some completion
            const [generalBadges] = await pool.query(
                `SELECT b.* FROM badges b
         WHERE b.skill = 'general' AND b.cefr_level = ?
           AND b.requirement_type = 'all_skills_complete'
           AND b.id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = ?)`,
                [cefrLevel, userId]
            );

            for (const badge of generalBadges) {
                await pool.query(
                    'INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)',
                    [userId, badge.id]
                );
                earnedBadges.push({ name: badge.name, icon: badge.icon, description: badge.description });
            }
        }
    } catch (err) {
        console.error('Badge check error:', err);
    }

    return earnedBadges;
}

module.exports = router;
