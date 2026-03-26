const express = require('express');
const cors = require('cors');
const { testConnection } = require('./utils/db');
const speechProvider = require('./services/speechProvider');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Middleware ───────────────────────────────────────────
app.use(cors({
    origin: ['http://localhost:5000', 'http://127.0.0.1:5000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // larger limit for audio data

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/assessments', require('./routes/assessments'));

// ─── Speech Provider Config Endpoint ─────────────────────
app.get('/api/speech/config', (req, res) => {
    res.json(speechProvider.getConfig());
});

// Speech recognition proxy (for Google Cloud provider)
app.post('/api/speech/recognize', async (req, res) => {
    try {
        const { audio, language } = req.body;
        const result = await speechProvider.recognize(audio, language);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Health Check ────────────────────────────────────────
app.get('/api/health', async (req, res) => {
    const dbOk = await testConnection();
    res.json({
        status: dbOk ? 'healthy' : 'degraded',
        database: dbOk ? 'connected' : 'disconnected',
        speech_provider: speechProvider.getConfig().provider,
        timestamp: new Date().toISOString()
    });
});

// ─── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// ─── Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ────────────────────────────────────────
app.listen(PORT, async () => {
    console.log(`
  ╔════════════════════════════════════════════╗
  ║   🌟 LingoSpark Backend API               ║
  ║   Running on http://localhost:${PORT}        ║
  ╚════════════════════════════════════════════╝
  `);

    await testConnection();
    console.log(`  📡 Speech provider: ${speechProvider.getConfig().provider}`);
    console.log(`  🔗 API base: http://localhost:${PORT}/api\n`);
});

module.exports = app;
