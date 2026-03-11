const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const emojiRegex = /(\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]|[\u2600-\u26ff]|[\u2700-\u27bf])/g;

async function diagnose() {
    console.log('--- File vs DB Diagnosis ---');

    // Check files
    const seedFiles = ['db/seed.sql', 'db/seed_new_lessons.sql', 'db/seed_german_lessons.sql'];
    for (const f of seedFiles) {
        const content = fs.readFileSync(f, 'utf8');
        const matches = content.match(emojiRegex);
        console.log(`File: ${f} | Emojis found: ${matches ? matches.length : 0}`);
        if (matches && matches.length > 0) {
            console.log(`  First emoji: ${matches[0]}`);
        }
    }

    // Check DB
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'lingospark',
            charset: 'utf8mb4'
        });

        const [rows] = await connection.query('SELECT title, content FROM lessons');
        let dbEmojiCount = 0;
        rows.forEach(r => {
            const m = r.content.match(emojiRegex);
            if (m) dbEmojiCount += m.length;
        });
        console.log(`DB Total Lessons: ${rows.length} | DB Total Emojis: ${dbEmojiCount}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

diagnose();
