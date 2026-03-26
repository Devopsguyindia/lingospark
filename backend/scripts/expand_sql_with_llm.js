const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Create an async function to process all files
async function processFiles() {
    const dbPath = path.join(__dirname, '..', 'db');
    const sqlFiles = [
        'seed.sql',
        'seed_advanced_lessons.sql',
        'seed_advanced_lessons_all.sql',
        'seed_english_a1_plus.sql',
        'seed_english_a2_plus.sql',
        'seed_german_a1_plus.sql',
        'seed_german_a2_plus.sql',
        'seed_german_lessons.sql',
        'seed_new_lessons.sql'
    ];

    for (const file of sqlFiles) {
        const filePath = path.join(dbPath, file);
        if (!fs.existsSync(filePath)) continue;

        let content = fs.readFileSync(filePath, 'utf8');
        console.log(`Processing file: ${file}`);
        let fileModified = false;

        // Extract JSON using regex
        // We will process match by match to allow async await
        const regex = /'(\{.*?\})'/g;
        let match;
        const matches = [];
        
        while ((match = regex.exec(content)) !== null) {
            matches.push({
                fullMatch: match[0],
                jsonString: match[1],
                index: match.index
            });
        }

        for (const m of matches) {
            try {
                const unescaped = m.jsonString.replace(/''/g, "'");
                const parsed = JSON.parse(unescaped);
                
                if (parsed.exercises && Array.isArray(parsed.exercises)) {
                    const currentCount = parsed.exercises.length;
                    
                    if (currentCount > 0 && currentCount < 20) {
                        const needed = 20 - currentCount;
                        console.log(`Need ${needed} more exercises for lesson of type ${parsed.type}`);
                        
                        // Call OpenAI
                        const exampleStr = JSON.stringify(parsed.exercises.slice(0, 3), null, 2);
                        
                        const prompt = `You are an expert language teacher creating exercises.
Exercise Type: ${parsed.type}
Instructions: ${parsed.instructions}
Here are examples of existing exercises for this lesson:
${exampleStr}

Task: Generate exactly ${needed} NEW, unique exercises following the EXACT SAME JSON structure, difficulty, and theme.
Do NOT duplicate existing exercises. Ensure all keys (like 'prompt', 'question', 'options', 'correct', 'hint', 'expected', 'sentence') are present as needed.
Options arrays must typically have exactly the same length as the examples (usually 2-4 items).
Output a JSON object with a single key "new_exercises" containing an array of exactly ${needed} unique exercise objects.
Do not use markdown formatting around the JSON, just return raw JSON or a JSON block.`;

                        try {
                            const response = await axios.post(
                                'https://api.openai.com/v1/chat/completions',
                                {
                                    model: "gpt-4o-mini",
                                    messages: [{ role: "user", content: prompt }],
                                    temperature: 0.7,
                                    max_tokens: 3000,
                                    response_format: { type: "json_object" }
                                },
                                {
                                    headers: {
                                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                                        'Content-Type': 'application/json'
                                    }
                                }
                            );

                            const resultStr = response.data.choices[0].message.content;
                            const aiParsed = JSON.parse(resultStr);
                            const newExercises = aiParsed.new_exercises || [];
                            
                            if (newExercises.length > 0) {
                                // Add them
                                parsed.exercises.push(...newExercises);
                                
                                // Re-serialize
                                let stringified = JSON.stringify(parsed);
                                stringified = stringified.replace(/'/g, "''");
                                const replacement = "'" + stringified + "'";
                                
                                // Replace in content
                                content = content.replace(m.fullMatch, replacement);
                                fileModified = true;
                                console.log(`Successfully added exercises! Now has ${parsed.exercises.length}`);
                            }
                        } catch (err) {
                            console.error(`Error calling OpenAI or parsing:`, err.message);
                            // Sometimes JSON is cut off, we could try extracting array but for now just skip
                        }
                    }
                }
            } catch (e) {
                // Ignore parse errors for things that aren't the right JSON
            }
        }
        
        if (fileModified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Saved updates to ${file}`);
        }
    }
    
    console.log("All done!");
}

processFiles().catch(console.error);
