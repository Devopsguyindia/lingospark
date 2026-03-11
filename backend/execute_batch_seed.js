const fs = require('fs');
const path = require('path');
const { pool } = require('./utils/db');

const seedFiles = [
    'seed_english_a1_plus.sql',
    'seed_english_a2_plus.sql',
    'seed_german_a1_plus.sql',
    'seed_german_a2_plus.sql'
];

async function executeSeed() {
    for (const file of seedFiles) {
        console.log(`Executing ${file}...`);
        const filePath = path.join(__dirname, 'db', file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Split by semicolon but ignore ones inside JSON/strings
        // For simplicity, we'll use a regex that handles basic multi-line SQL
        const statements = sql
            .split(/;\s*$/m)
            .filter(s => s.trim().length > 0);

        for (let statement of statements) {
            try {
                await pool.query(statement);
            } catch (err) {
                console.error(`Error in ${file}:`, err.message);
                console.error('Statement:', statement.substring(0, 100) + '...');
            }
        }
    }
    console.log('Batch seeding completed.');
    process.exit(0);
}

executeSeed();
