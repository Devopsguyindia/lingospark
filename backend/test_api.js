const http = require('http');

http.get('http://localhost:3001/api/lessons/3', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('Lesson Title:', json.lesson.title);
            console.log('Content Exercises Sample:', JSON.stringify(json.lesson.content.exercises[0]));
            const hasEmoji = /(\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]|[\u2600-\u26ff]|[\u2700-\u27bf])/.test(data);
            console.log('Has Emoji in raw data:', hasEmoji);
        } catch (e) {
            console.error('Error:', e.message);
            console.log('Raw data start:', data.substring(0, 100));
        }
    });
});
