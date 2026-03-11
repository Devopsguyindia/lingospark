const { pool } = require('./utils/db');

async function verify() {
    try {
        const [rows] = await pool.query('SELECT language_code, cefr_level, skill, COUNT(*) as count FROM lessons WHERE cefr_level IN ("A1", "A2") GROUP BY language_code, cefr_level, skill ORDER BY language_code, cefr_level, skill');
        console.log('--- A1/A2 Lesson Counts ---');
        rows.forEach(row => {
            console.log(`${row.language_code}-${row.cefr_level}-${row.skill}: ${row.count}`);
        });
        
        const [total] = await pool.query('SELECT COUNT(*) as total FROM lessons WHERE cefr_level IN ("A1", "A2")');
        console.log('\nTotal A1/A2 Lessons:', total[0].total);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
