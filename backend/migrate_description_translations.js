const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lingospark'
    });

    console.log('Migrating: Adding description_translation to lessons table...');

    try {
        await connection.query('ALTER TABLE lessons ADD COLUMN description_translation TEXT AFTER description');
        console.log('Success: Column added.');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAMES') {
            console.log('Skipping: Column already exists.');
        } else {
            console.error('Error:', err.message);
        }
    }

    await connection.end();
}

migrate();
