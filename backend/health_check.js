const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAll() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lingospark',
        charset: 'utf8mb4'
    });

    try {
        const [rows] = await connection.query('SELECT id, title, content FROM lessons');
        console.log(`Checking ${rows.length} lessons...`);

        const mangled = [];
        const noEmoji = [];

        rows.forEach(r => {
            if (r.content.includes('?')) {
                // Check if it's a real question mark or a mangled one
                // Usually mangled ones are inside JSON strings where emojis should be
                if (r.content.includes('":"?')) mangled.push(r.title);
            }
            const hasEmoji = /(\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]|[\u2600-\u26ff]|[\u2700-\u27bf])/.test(r.content);
            if (!hasEmoji && (r.title.toLowerCase().includes('fruit') || r.title.toLowerCase().includes('animal') || r.title.toLowerCase().includes('color'))) {
                noEmoji.push(r.title);
            }
        });

        console.log('Mangled (possible):', mangled.length > 0 ? mangled.join(', ') : 'None');
        console.log('No Emojis in visual lessons:', noEmoji.length > 0 ? noEmoji.join(', ') : 'None');

    } finally {
        await connection.end();
    }
}

checkAll();
