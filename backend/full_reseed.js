const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function fullReseed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lingospark',
        multipleStatements: true,
        charset: 'utf8mb4'
    });

    try {
        console.log('--- Cleaning database and fixing charset ---');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // FORCE DATABASE CHARSET TO UTF8MB4
        console.log('--- Migrating database charset to utf8mb4 ---');
        await connection.query('ALTER DATABASE lingospark CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');

        // List of all tables to convert
        const tables = ['languages', 'users', 'lessons', 'progress', 'badges', 'user_badges'];
        for (const table of tables) {
            try {
                await connection.query(`ALTER TABLE ${table} CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
                console.log(`Converted table ${table} to utf8mb4.`);
            } catch (err) {
                console.log(`Skipping conversion for ${table} (might not exist yet).`);
            }
        }

        await connection.query('TRUNCATE TABLE user_badges');
        await connection.query('TRUNCATE TABLE badges');
        await connection.query('TRUNCATE TABLE progress');
        await connection.query('TRUNCATE TABLE lessons');
        await connection.query('TRUNCATE TABLE languages');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Database cleaned and charset fixed.');

        const seedFiles = [
            { name: 'Original Seed', path: path.join(__dirname, 'db', 'seed.sql') },
            { name: 'New High Quality Lessons', path: path.join(__dirname, 'db', 'seed_new_lessons.sql') },
            { name: 'German Lessons', path: path.join(__dirname, 'db', 'seed_german_lessons.sql') }
        ];

        for (const file of seedFiles) {
            console.log(`--- Importing ${file.name} ---`);
            const sql = fs.readFileSync(file.path, 'utf8');
            // Force session charset before import
            await connection.query('SET NAMES utf8mb4');
            await connection.query(sql);
            console.log(`${file.name} imported.`);
        }

        // Final Verification
        const [rows] = await connection.query('SELECT COUNT(*) as total FROM lessons');
        console.log(`Total lessons in database: ${rows[0].total}`);

    } catch (err) {
        console.error('Reseed failed:', err);
    } finally {
        await connection.end();
    }
}

fullReseed();
