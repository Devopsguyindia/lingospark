'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SpeechContext = createContext();

export const useSpeech = () => useContext(SpeechContext);

export const SpeechProvider = ({ children }) => {
    const [voiceGender, setVoiceGender] = useState('female');
    const [accent, setAccent] = useState('en-US'); // 'en-US', 'en-GB', 'en-IN' (Neutral)
    const [voices, setVoices] = useState([]);
    const [speaking, setSpeaking] = useState(false);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
        };

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const speak = useCallback((text, lang = null) => {
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        // Normalize lang if provided (e.g. 'de' -> 'de-DE')
        let targetLang = (lang || accent).toLowerCase();
        
        // Short code mapping
        const langMap = {
            'de': 'de-DE',
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'it': 'it-IT'
        };
        
        if (langMap[targetLang]) {
            targetLang = langMap[targetLang];
        }

        // Basic voice filtering heuristic based on name
        let matchingVoices = voices.filter(v =>
            v.lang.toLowerCase().startsWith(targetLang) ||
            v.lang.replace('_', '-').toLowerCase().startsWith(targetLang)
        );

        if (matchingVoices.length === 0) {
            // fallback to just the language code part (e.g., first 2 chars 'de')
            const shortLang = targetLang.substring(0, 2);
            matchingVoices = voices.filter(v => v.lang.toLowerCase().startsWith(shortLang));
        }

        if (matchingVoices.length === 0) {
            // Ultimate fallback to 'en'
            matchingVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
        }

        let selectedVoice = null;
        if (matchingVoices.length > 0) {
            // Try to guess gender based on voice name for some common TTS engines
            const isFemale = voiceGender === 'female';
            const femaleKeywords = ['female', 'girl', 'woman', 'zira', 'hazel', 'susan', 'heera', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'katja', 'hedda'];
            const maleKeywords = ['male', 'boy', 'man', 'david', 'george', 'ravi', 'mark', 'daniel', 'oliver', 'stefan', 'hans'];

            selectedVoice = matchingVoices.find(v => {
                const name = v.name.toLowerCase();
                if (isFemale) {
                    return femaleKeywords.some(keyword => name.includes(keyword)) && !maleKeywords.some(keyword => name.includes(keyword) && keyword !== 'female');
                } else {
                    return maleKeywords.some(keyword => name.includes(keyword)) && !femaleKeywords.some(keyword => name.includes(keyword) && keyword !== 'male');
                }
            });

            if (!selectedVoice) {
                selectedVoice = matchingVoices.length > 1 ? (isFemale ? matchingVoices[0] : matchingVoices[1]) : matchingVoices[0];
            }
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.lang = targetLang;
        utterance.rate = 0.85;
        utterance.pitch = voiceGender === 'female' ? 1.1 : 0.9;

        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [voices, voiceGender, accent]);

    return (
        <SpeechContext.Provider value={{ voiceGender, setVoiceGender, accent, setAccent, speak, speaking }}>
            {children}
        </SpeechContext.Provider>
    );
};
