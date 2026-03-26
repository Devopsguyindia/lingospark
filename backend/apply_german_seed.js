const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applySeed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lingospark',
        multipleStatements: true,
        charset: 'utf8mb4'
    });

    try {
        console.log('--- Applying German Comprehensive Seed ---');
        const seedPath = path.join(__dirname, 'db', 'seed_german_comprehensive.sql');
        const sql = fs.readFileSync(seedPath, 'utf8');
        
        await connection.query('SET NAMES utf8mb4');
        await connection.query(sql);
        
        console.log('Seed applied successfully.');
        
        const [rows] = await connection.query('SELECT COUNT(*) as total FROM lessons WHERE language_code = "de"');
        console.log(`Total German lessons in database: ${rows[0].total}`);
    } catch (err) {
        console.error('Failed to apply seed:', err);
    } finally {
        await connection.end();
    }
}

applySeed();
