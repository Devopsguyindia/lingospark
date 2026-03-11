/**
 * Speech Provider Service
 * 
 * Abstraction layer for speech recognition and synthesis.
 * Supports three providers:
 *   1. 'web'    — Browser-native Web Speech API (handled client-side, this provides config)
 *   2. 'google' — Google Cloud Speech-to-Text (server-side processing)
 *   3. 'openai' — OpenAI Whisper Speech-to-Text (server-side processing)
 * 
 * Toggle via SPEECH_PROVIDER env variable.
 */

require('dotenv').config();
const { OpenAI } = require('openai');
const fs = require('fs');
const os = require('os');
const path = require('path');

class SpeechProvider {
    constructor() {
        this.provider = process.env.SPEECH_PROVIDER || 'web';
        this.googleApiKey = process.env.GOOGLE_CLOUD_API_KEY || null;
        this.openaiApiKey = process.env.OPENAI_API_KEY || null;

        if (this.provider === 'openai' && this.openaiApiKey) {
            this.openai = new OpenAI({ apiKey: this.openaiApiKey });
        }
    }

    /**
     * Get client-side configuration for the current speech provider
     */
    getConfig() {
        if (this.provider === 'google' || this.provider === 'openai') {
            return {
                provider: this.provider,
                // API keys are sent server-side only; client gets a proxy endpoint
                useProxy: true,
                proxyEndpoint: '/api/speech/recognize'
            };
        }

        // Default: Web Speech API (all client-side)
        return {
            provider: 'web',
            // Web Speech API is entirely browser-native, no server endpoint needed
            config: {
                continuous: false,
                interimResults: true,
                lang: 'en-US',
                maxAlternatives: 3
            }
        };
    }

    /**
     * Server-side speech recognition
     * Accepts base64-encoded audio data
     */
    async recognize(audioBase64, languageCode = 'en-US') {
        if (this.provider === 'openai') {
            return this.recognizeOpenAI(audioBase64, languageCode);
        }

        if (this.provider !== 'google') {
            throw new Error('Server-side recognition is only available with Google or OpenAI providers');
        }

        if (!this.googleApiKey) {
            throw new Error('GOOGLE_CLOUD_API_KEY is not configured');
        }

        try {
            const response = await fetch(
                `https://speech.googleapis.com/v1/speech:recognize?key=${this.googleApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        config: {
                            encoding: 'WEBM_OPUS',
                            sampleRateHertz: 48000,
                            languageCode: languageCode,
                            enableAutomaticPunctuation: true,
                            model: 'default'
                        },
                        audio: {
                            content: audioBase64
                        }
                    })
                }
            );

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                return {
                    transcript: data.results[0].alternatives[0].transcript,
                    confidence: data.results[0].alternatives[0].confidence,
                    alternatives: data.results[0].alternatives
                };
            }

            return { transcript: '', confidence: 0, alternatives: [] };
        } catch (err) {
            console.error('Google Speech API error:', err);
            throw new Error('Speech recognition failed');
        }
    }

    async recognizeOpenAI(audioBase64, languageCode = 'en-US') {
        if (!this.openaiApiKey) {
            throw new Error('OPENAI_API_KEY is not configured');
        }

        try {
            // Whisper API expects a file. Decode base64 and write to temp file
            const audioBuffer = Buffer.from(audioBase64, 'base64');
            const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
            fs.writeFileSync(tempFilePath, audioBuffer);

            const fileStream = fs.createReadStream(tempFilePath);

            // map en-US to en
            const langCode = (languageCode || 'en').split('-')[0];

            const response = await this.openai.audio.transcriptions.create({
                file: fileStream,
                model: 'whisper-1',
                language: langCode,
            });

            // Cleanup temp file
            fs.unlinkSync(tempFilePath);

            if (response && response.text) {
                return {
                    transcript: response.text,
                    confidence: 1.0, // Whisper doesn't return per-word confidence by default
                    alternatives: [{ transcript: response.text }]
                };
            }

            return { transcript: '', confidence: 0, alternatives: [] };
        } catch (err) {
            console.error('OpenAI Speech API error:', err);
            throw new Error('Speech recognition failed with OpenAI');
        }
    }

    /**
     * Compare spoken text with expected text
     * Returns a match score (0-100)
     */
    compareText(spoken, expected) {
        if (!spoken || !expected) return 0;

        const normalize = (text) => text.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
        const spokenNorm = normalize(spoken);
        const expectedNorm = normalize(expected);

        // Exact match
        if (spokenNorm === expectedNorm) return 100;

        // Word-level comparison
        const spokenWords = spokenNorm.split(/\s+/);
        const expectedWords = expectedNorm.split(/\s+/);

        let matchCount = 0;
        for (const word of expectedWords) {
            if (spokenWords.includes(word)) matchCount++;
        }

        return Math.round((matchCount / expectedWords.length) * 100);
    }
}

module.exports = new SpeechProvider();
