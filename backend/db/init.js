/**
 * Database Initialization Script
 * Reads and executes schema.sql and seed.sql against the MySQL database.
 * 
 * Usage: node db/init.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function initDatabase() {
    console.log('🚀 Initializing LingoSpark database...\n');

    // Connect without database first (to create it)
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true,
        charset: 'utf8mb4'
    });

    try {
        // Read and execute schema
        console.log('📋 Creating schema...');
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await connection.query(schema);
        console.log('✅ Schema created successfully\n');

        // Read and execute seed data
        console.log('🌱 Seeding data...');
        const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
        await connection.query(seed);
        console.log('✅ Seed data inserted successfully\n');

        // Verify
        await connection.query('USE lingospark');
        const [languages] = await connection.query('SELECT * FROM languages');
        console.log(`📚 Languages: ${languages.map(l => `${l.name} (${l.code}${l.enabled ? '' : ' — disabled'})`).join(', ')}`);

        const [lessonCount] = await connection.query('SELECT COUNT(*) as count FROM lessons');
        console.log(`📖 Total lessons: ${lessonCount[0].count}`);

        const [badgeCount] = await connection.query('SELECT COUNT(*) as count FROM badges');
        console.log(`🏆 Total badges: ${badgeCount[0].count}`);

        const [skillBreakdown] = await connection.query(
            `SELECT cefr_level, skill, COUNT(*) as count FROM lessons 
       GROUP BY cefr_level, skill ORDER BY cefr_level, skill`
        );
        console.log('\n📊 Lesson breakdown:');
        skillBreakdown.forEach(row => {
            console.log(`   ${row.cefr_level} | ${row.skill.padEnd(10)} | ${row.count} lessons`);
        });

        console.log('\n🎉 Database initialization complete!');
    } catch (err) {
        console.error('❌ Database initialization failed:', err.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

initDatabase();
