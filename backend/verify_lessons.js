const mysql = require('mysql2/promise');
require('dotenv').config();

async function verify() {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: 'root',
            password: '',
            database: 'lingospark'
        });

        const [rows] = await conn.query('SELECT title, content FROM lessons WHERE title IN ("Family Pets", "Transport", "Weather Today")');

        rows.forEach(row => {
            const content = JSON.parse(row.content);
            console.log(`Lesson: ${row.title}, Exercises: ${content.exercises.length}`);
        });

        await conn.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

verify();
