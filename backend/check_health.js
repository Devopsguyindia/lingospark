const axios = require('axios');

async function checkHealth() {
    try {
        const res = await axios.get('http://localhost:5001/api/health');
        console.log('Backend Health:', res.data);
    } catch (err) {
        console.error('Backend Health Check Failed:', err.message);
        if (err.response) {
            console.error('Response:', err.response.data);
        }
    }
}

checkHealth();
