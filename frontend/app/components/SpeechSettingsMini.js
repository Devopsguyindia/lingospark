'use client';
import { useSpeech } from '../context/SpeechContext';

export default function SpeechSettingsMini() {
    const speechContext = useSpeech() || {};
    const { voiceGender, setVoiceGender, accent, setAccent } = speechContext;

    if (!setVoiceGender || !setAccent) return null;

    return (
        <div className="speech-settings-mini" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '15px', justifyContent: 'center', background: 'var(--surface-hover)', padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>
            <div className="accent-selectors" style={{ display: 'flex', gap: '8px' }}>
                <button
                    className={`btn-icon ${accent === 'en-US' ? 'active' : ''}`}
                    onClick={() => setAccent('en-US')}
                    title="US English"
                    style={{ color: 'inherit', opacity: accent === 'en-US' ? 1 : 0.4, border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', transition: 'opacity 0.2s', filter: accent === 'en-US' ? 'none' : 'grayscale(80%)' }}
                >
                    🇺🇸
                </button>
                <button
                    className={`btn-icon ${accent === 'en-GB' ? 'active' : ''}`}
                    onClick={() => setAccent('en-GB')}
                    title="UK English"
                    style={{ color: 'inherit', opacity: accent === 'en-GB' ? 1 : 0.4, border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', transition: 'opacity 0.2s', filter: accent === 'en-GB' ? 'none' : 'grayscale(80%)' }}
                >
                    🇬🇧
                </button>
                <button
                    className={`btn-icon ${accent === 'en-IN' ? 'active' : ''}`}
                    onClick={() => setAccent('en-IN')}
                    title="Indian English"
                    style={{ color: 'inherit', opacity: accent === 'en-IN' ? 1 : 0.4, border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', transition: 'opacity 0.2s', filter: accent === 'en-IN' ? 'none' : 'grayscale(80%)' }}
                >
                    🇮🇳
                </button>
            </div>
            <div style={{ width: '2px', height: '24px', background: 'var(--border)' }}></div>
            <div className="gender-selectors" style={{ display: 'flex', gap: '8px' }}>
                <button
                    className={`btn-icon ${voiceGender === 'female' ? 'active' : ''}`}
                    onClick={() => setVoiceGender('female')}
                    title="Female Voice"
                    style={{ color: 'inherit', opacity: voiceGender === 'female' ? 1 : 0.4, border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', transition: 'opacity 0.2s', filter: voiceGender === 'female' ? 'none' : 'grayscale(80%)' }}
                >
                    👩
                </button>
                <button
                    className={`btn-icon ${voiceGender === 'male' ? 'active' : ''}`}
                    onClick={() => setVoiceGender('male')}
                    title="Male Voice"
                    style={{ color: 'inherit', opacity: voiceGender === 'male' ? 1 : 0.4, border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', transition: 'opacity 0.2s', filter: voiceGender === 'male' ? 'none' : 'grayscale(80%)' }}
                >
                    👨
                </button>
            </div>
        </div>
    );
}
