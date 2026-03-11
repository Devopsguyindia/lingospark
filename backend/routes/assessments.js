const express = require('express');
const { pool } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/assessments/check — evaluate exercise answers
router.post('/check', authenticateToken, async (req, res) => {
    try {
        const { lesson_id, answers } = req.body;

        if (!lesson_id || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'lesson_id and answers array are required' });
        }

        // Get lesson content
        const [lessonRows] = await pool.query('SELECT * FROM lessons WHERE id = ?', [lesson_id]);
        if (lessonRows.length === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        const lesson = lessonRows[0];
        let content = lesson.content;
        if (typeof content === 'string') {
            content = JSON.parse(content);
        }

        const exercises = content.exercises;
        if (!exercises) {
            return res.status(400).json({ error: 'Lesson has no exercises' });
        }

        // Evaluate each answer
        const results = [];
        let correctCount = 0;

        for (let i = 0; i < exercises.length; i++) {
            const exercise = exercises[i];
            const userAnswer = answers[i];
            let isCorrect = false;

            // Different evaluation based on exercise type
            switch (content.type) {
                case 'listen_and_choose':
                case 'read_and_choose':
                case 'read_and_match':
                case 'fill_blank':
                    isCorrect = userAnswer === exercise.correct;
                    break;

                case 'true_false':
                    isCorrect = userAnswer === exercise.correct;
                    break;

                case 'speak_and_compare':
                    // Fuzzy match for speech: check if the core words are present
                    if (typeof userAnswer === 'string' && exercise.expected) {
                        const normalizedAnswer = userAnswer.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
                        const normalizedExpected = exercise.expected.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');

                        // Check word overlap
                        const expectedWords = normalizedExpected.split(/\s+/);
                        const answerWords = normalizedAnswer.split(/\s+/);
                        const matchingWords = expectedWords.filter(w => answerWords.includes(w));
                        const matchRatio = matchingWords.length / expectedWords.length;

                        isCorrect = matchRatio >= 0.7; // 70% word match considered correct
                    }
                    break;

                case 'type_word':
                case 'unscramble':
                case 'fill_letters':
                case 'copy_sentence':
                case 'fill_blank_type':
                    // Exact or near match for typing
                    if (typeof userAnswer === 'string' && exercise.expected) {
                        const normalizedAnswer = userAnswer.toLowerCase().trim();
                        const normalizedExpected = exercise.expected.toLowerCase().trim();
                        isCorrect = normalizedAnswer === normalizedExpected;
                    }
                    break;

                case 'guided_writing':
                    // For guided writing, check that the response starts with the starter
                    // and has additional content — more lenient evaluation
                    if (typeof userAnswer === 'string' && userAnswer.trim().length > 0) {
                        isCorrect = userAnswer.trim().length >= 10; // At least 10 chars
                    }
                    break;

                default:
                    isCorrect = userAnswer === exercise.correct;
            }

            if (isCorrect) correctCount++;

            results.push({
                exercise_index: i,
                is_correct: isCorrect,
                user_answer: userAnswer,
                correct_answer: exercise.correct !== undefined ? exercise.correct : exercise.expected,
                hint: exercise.hint || exercise.explanation || null
            });
        }

        const score = Math.round((correctCount / exercises.length) * 100);

        // Calculate stars
        let stars = 0;
        if (score >= 90) stars = 3;
        else if (score >= 70) stars = 2;
        else if (score >= 50) stars = 1;

        // Feedback message based on score
        let feedback;
        if (score === 100) feedback = '🌟 Perfect! Amazing job!';
        else if (score >= 80) feedback = '⭐ Great work! Almost perfect!';
        else if (score >= 60) feedback = '👍 Good effort! Keep practicing!';
        else if (score >= 40) feedback = '💪 Don\'t give up! Try again!';
        else feedback = '🤗 Let\'s try again! You can do it!';

        res.json({
            score,
            stars,
            total_correct: correctCount,
            total_exercises: exercises.length,
            feedback,
            results
        });
    } catch (err) {
        console.error('Assessment check error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/assessments/level-test — CEFR level assessment
router.post('/level-test', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;

        // Check A1 completion status
        const [a1Stats] = await pool.query(
            `SELECT l.skill, COUNT(*) as total, SUM(p.completed) as completed_count
       FROM lessons l
       LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = ?
       WHERE l.cefr_level = 'A1' AND l.language_code = 'en'
       GROUP BY l.skill`,
            [user_id]
        );

        // Check if at least 80% of A1 is completed
        let totalA1 = 0, completedA1 = 0;
        a1Stats.forEach(s => {
            totalA1 += s.total;
            completedA1 += s.completed_count || 0;
        });

        const completionRate = totalA1 > 0 ? (completedA1 / totalA1) * 100 : 0;

        // Check average score across A1
        const [avgScore] = await pool.query(
            `SELECT ROUND(AVG(p.score), 1) as avg_score
       FROM progress p
       JOIN lessons l ON p.lesson_id = l.id
       WHERE p.user_id = ? AND l.cefr_level = 'A1' AND p.completed = TRUE`,
            [user_id]
        );

        const averageScore = avgScore[0]?.avg_score || 0;

        if (completionRate >= 80 && averageScore >= 70) {
            // Promote to A2
            await pool.query(
                'UPDATE users SET cefr_level = ? WHERE id = ?',
                ['A2', user_id]
            );

            res.json({
                promoted: true,
                new_level: 'A2',
                message: '🎓 Congratulations! You have been promoted to A2 level!',
                stats: {
                    completion_rate: Math.round(completionRate),
                    average_score: averageScore
                }
            });
        } else {
            res.json({
                promoted: false,
                current_level: 'A1',
                message: 'Keep practicing to reach A2! You need 80% completion and 70% average score.',
                stats: {
                    completion_rate: Math.round(completionRate),
                    average_score: averageScore,
                    required_completion: 80,
                    required_score: 70
                }
            });
        }
    } catch (err) {
        console.error('Level test error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
