const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function importLessons() {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: 'root',
            password: '',
            database: 'lingospark',
            multipleStatements: true
        });

        console.log('Cleaning up old placeholder lessons...');
        const lessonTitles = [
            'Family Pets', 'Transport', 'Weather Today', 'Fruit and Vegetables', 'School Days',
            'Fun Weekends', 'Travel Destinations', 'At the Market', 'Party Decorations', 'Keeping Healthy',
            'I Like Food', 'My Day', 'The Weather', 'Introduce Family', 'Colors Everywhere',
            'My Next Trip', 'Shopping List', 'Healthy Living', 'Birthday Party', 'Weekend Fun',
            'Name the Animals', 'Color Reading', 'Short Stories 1', 'Food Words', 'Class Objects',
            'Travel Story', 'Shopping Day', 'A Birthday Note', 'Health Guide', 'Weekend Life',
            'Spell the Colors', 'Animal Names', 'Copy Short Sentences', 'Fill the Gaps', 'Type the Numbers',
            'Travel Diary', 'Hobby Description', 'Write a Letter', 'Food Review', 'Plans for Future'
        ];

        const deleteQuery = 'DELETE FROM lessons WHERE title IN (' + lessonTitles.map(t => "'" + t.replace(/'/g, "''") + "'").join(',') + ')';
        await conn.query(deleteQuery);
        console.log('Placeholder lessons removed.');

        console.log('Importing high-quality lessons from seed_new_lessons.sql...');
        const sql = fs.readFileSync('db/seed_new_lessons.sql', 'utf8');
        await conn.query(sql);
        console.log('High-quality lessons imported successfully.');

    } catch (err) {
        console.error('Import Error:', err.message);
    } finally {
        if (conn) await conn.end();
        process.exit(0);
    }
}

importLessons();
