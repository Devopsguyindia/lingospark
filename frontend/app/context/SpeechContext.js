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

    const speak = useCallback((text) => {
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        let targetLang = accent.toLowerCase();
        // Basic voice filtering heuristic based on name
        let matchingVoices = voices.filter(v =>
            v.lang.toLowerCase().startsWith(targetLang) ||
            v.lang.replace('_', '-').toLowerCase().startsWith(targetLang)
        );

        if (matchingVoices.length === 0) {
            // fallback to just the language code (e.g., 'en')
            matchingVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
        }

        let selectedVoice = null;
        if (matchingVoices.length > 0) {
            // Try to guess gender based on voice name for some common TTS engines
            const isFemale = voiceGender === 'female';
            const femaleKeywords = ['female', 'girl', 'woman', 'zira', 'hazel', 'susan', 'heera', 'samantha', 'victoria', 'karen', 'moira', 'tessa'];
            const maleKeywords = ['male', 'boy', 'man', 'david', 'george', 'ravi', 'mark', 'daniel', 'oliver'];

            selectedVoice = matchingVoices.find(v => {
                const name = v.name.toLowerCase();
                if (isFemale) {
                    return femaleKeywords.some(keyword => name.includes(keyword)) && !maleKeywords.some(keyword => name.includes(keyword) && keyword !== 'female');
                } else {
                    return maleKeywords.some(keyword => name.includes(keyword)) && !femaleKeywords.some(keyword => name.includes(keyword) && keyword !== 'male');
                }
            });

            // If heuristic fails (like on Windows where names might just be "Microsoft David" or "Microsoft Zira"), 
            // fallback to picking by index if there are multiple voices for the language
            if (!selectedVoice) {
                if (matchingVoices.length > 1) {
                    // Usually in Windows TTS, the first voice is Female (Zira) and second is Male (David), but it varies
                    selectedVoice = isFemale ? matchingVoices[0] : matchingVoices[1];
                } else {
                    selectedVoice = matchingVoices[0];
                }
            }
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.lang = accent;
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
