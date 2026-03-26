const mysql = require('mysql2/promise');
const { OpenAI } = require('openai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fetch = require('node-fetch');

// Add fetch to global scope for OpenAI SDK
if (!globalThis.fetch) {
    globalThis.fetch = fetch;
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Create DB connection pool (config from init.js)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lingospark',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function generateExercises(lessonData, exercisesNeeded) {
    console.log(`Generating ${exercisesNeeded} exercises for "${lessonData.title}" (${lessonData.language_code} ${lessonData.cefr_level} ${lessonData.skill})`);

    let contentObj;
    try {
        contentObj = JSON.parse(lessonData.content);
    } catch (e) {
        console.error("Failed to parse content for lesson:", lessonData.id);
        return [];
    }

    const currentExercises = contentObj.exercises;
    if (!currentExercises || currentExercises.length === 0) return [];
    
    // Example exercise structure to provide to the LLM
    const exampleStr = JSON.stringify(currentExercises.slice(0, 3), null, 2);

    const prompt = `You are an expert ${lessonData.language_code === 'en' ? 'English' : 'German'} language teacher creating exercises for CEFR level ${lessonData.cefr_level}.
Skill: ${lessonData.skill}
Lesson Topic: ${lessonData.title}
Lesson Description: ${lessonData.description}
Exercise Type: ${contentObj.type}
Instructions: ${contentObj.instructions}

Here are examples of existing exercises for this lesson:
${exampleStr}

Task: Generate exactly ${exercisesNeeded} NEW, unique exercises following the EXACT SAME JSON structure, difficulty, and theme.
Do NOT duplicate existing exercises. Ensure all keys (like 'prompt', 'question', 'options', 'correct', 'hint', 'expected', 'sentence') are present as needed.
Options arrays must typically have 2-3 items.
Output a JSON object with a single key "new_exercises" containing an array of exactly ${exercisesNeeded} exercise objects.`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Cost-effective model
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const resultStr = response.choices[0].message.content;
        const parsed = JSON.parse(resultStr);
        return parsed.new_exercises || [];
    } catch (error) {
        console.error(`Error generating exercises for lesson ${lessonData.id}:`, error);
        return [];
    }
}

async function main() {
    console.log('Starting exercise expansion script...');
    
    const TARGET_EXERCISES = 20;
    
    try {
        // Fetch all lessons
        const [rows] = await pool.query('SELECT id, language_code, cefr_level, skill, title, description, content FROM lessons LIMIT 1');
        
        console.log(`Found ${rows.length} lessons in the database.`);
        
        for (const lesson of rows) {
            try {
                const contentObj = JSON.parse(lesson.content);
                const currentCount = contentObj.exercises ? contentObj.exercises.length : 0;
                
                if (currentCount >= TARGET_EXERCISES) {
                    console.log(`Lesson ${lesson.id} ("${lesson.title}") already has ${currentCount} exercises. Skipping.`);
                    continue;
                }
                
                const needed = TARGET_EXERCISES - currentCount;
                
                // Fetch new exercises
                const newExercises = await generateExercises(lesson, needed);
                
                if (newExercises.length !== needed) {
                    console.warn(`Warning: Expected ${needed} exercises but got ${newExercises.length} for lesson ${lesson.id}.`);
                    if (newExercises.length === 0) continue; // Skip if complete failure
                }
                
                // Append new exercises to the original array
                contentObj.exercises = [...contentObj.exercises, ...newExercises];
                
                // Update database
                const updatedContentStr = JSON.stringify(contentObj);
                await pool.query('UPDATE lessons SET content = ? WHERE id = ?', [updatedContentStr, lesson.id]);
                
                console.log(`Successfully expanded lesson ${lesson.id} to ${contentObj.exercises.length} exercises.`);
                
            } catch (err) {
                console.error(`Error processing lesson ${lesson.id}:`, err.message);
            }
        }
        
        console.log('Script completed successfully.');
        
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await pool.end();
    }
}

main();
