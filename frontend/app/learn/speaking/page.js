'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { isLoggedIn, lessonsAPI, assessmentsAPI, progressAPI, getStoredUser } from '../../lib/api';
import { useSpeech } from '../../context/SpeechContext';
import SpeechSettingsMini from '../../components/SpeechSettingsMini';

export default function SpeakingPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [answerState, setAnswerState] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' | 'tutorial' | 'exercise' | 'results'
    const [activeLevel, setActiveLevel] = useState(useSearchParams()?.get('level') || 'A1');
    const [currentTutorialIndex, setCurrentTutorialIndex] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(true);
    const recognitionRef = useRef(null);
    const { speak: speakText, speaking: isSpeaking } = useSpeech() || {};

    useEffect(() => {
        if (!isLoggedIn()) { router.push('/login'); return; }
        // Check Web Speech API support
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) setSpeechSupported(false);
        }
        const u = getStoredUser();
        setUser(u);
        loadLessons(u);
    }, [activeLevel]);

    const loadLessons = async (u) => {
        try {
            const currentUser = u || user || getStoredUser();
            let currentLang = currentUser?.target_language || 'en';
            let fetchLevel = activeLevel;

            if (activeLevel === 'Grammar-A1') {
                currentLang = 'en_a1';
                fetchLevel = 'A1';
            } else if (currentLang === 'en_a1') {
                currentLang = 'en';
            }

            const data = await lessonsAPI.list({
                level: fetchLevel,
                skill: 'speaking',
                language: currentLang
            });
            setLessons(data.lessons || []);
        } catch (err) {
            console.error('Failed to load lessons:', err);
        } finally {
            setLoading(false);
        }
    };

    const startLesson = async (lessonId) => {
        try {
            const data = await lessonsAPI.get(lessonId);
            setCurrentLesson(data.lesson);
            setCurrentExerciseIndex(0);
            setCurrentTutorialIndex(0);
            setAnswers([]);
            setTranscript('');
            setAnswerState(null);
            setShowHint(false);
            
            if (data.lesson.content?.tutorial && data.lesson.content.tutorial.length > 0) {
                setView('tutorial');
            } else {
                setView('exercise');
            }
        } catch (err) { console.error(err); }
    };

    const startRecording = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = currentLesson.language_code === 'de' ? 'de-DE' : 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;
        recognition.continuous = false;

        recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            setTranscript(result[0].transcript);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.onerror = (event) => {
            console.error('Speech error:', event.error);
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
        setTranscript('');
        setAnswerState(null);
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
    };

    const exercises = currentLesson?.content?.exercises || [];
    const currentExercise = exercises[currentExerciseIndex];

    const checkSpeech = () => {
        if (!transcript || !currentExercise) return;

        const normalize = (t) => t.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
        const spoken = normalize(transcript);
        const expected = normalize(currentExercise.expected);

        const expectedWords = expected.split(/\s+/);
        const spokenWords = spoken.split(/\s+/);
        const matchCount = expectedWords.filter(w => spokenWords.includes(w)).length;
        const matchRatio = matchCount / expectedWords.length;

        const isCorrect = matchRatio >= 0.7;
        setAnswerState(isCorrect ? 'correct' : 'wrong');

        const newAnswers = [...answers, transcript];
        setAnswers(newAnswers);

        setTimeout(() => {
            if (currentExerciseIndex < exercises.length - 1) {
                setCurrentExerciseIndex(prev => prev + 1);
                setTranscript('');
                setAnswerState(null);
                setShowHint(false);
            } else {
                submitAnswers(newAnswers);
            }
        }, 2000);
    };

    const submitAnswers = async (finalAnswers) => {
        try {
            const checkResult = await assessmentsAPI.check({
                lesson_id: currentLesson.id,
                answers: finalAnswers
            });
            await progressAPI.save({
                lesson_id: currentLesson.id,
                score: checkResult.score,
                time_spent_seconds: 90
            });
            setResults(checkResult);
            setView('results');
        } catch (err) { console.error(err); }
    };

    const getStarsDisplay = (s) => '⭐'.repeat(s) + '☆'.repeat(3 - s);

    if (loading) {
        return <><Navbar /><div className="page-container"><div className="loading-screen"><div className="spinner"></div><p>Loading speaking lessons...</p></div></div></>;
    }

    // RESULTS
    if (view === 'results' && results) {
        return (
            <><Navbar />
                <div className="page-container">
                    <div className="results-screen animate-fade-in">
                        <div className="results-stars">{getStarsDisplay(results.stars)}</div>
                        <div className="results-score">{results.score}%</div>
                        <div className="results-feedback">{results.feedback}</div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
                            {results.total_correct} of {results.total_exercises} correct
                        </p>
                        <div className="results-actions">
                            <button className="btn btn-secondary" onClick={() => { setView('list'); setResults(null); loadLessons(); }}>
                                📋 Back to Lessons
                            </button>
                            <Link href="/dashboard" className="btn btn-outline">
                                🏠 Dashboard
                            </Link>
                            <button className="btn btn-primary" onClick={() => startLesson(currentLesson.id)}>
                                🔄 Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // TUTORIAL
    if (view === 'tutorial' && currentLesson?.content?.tutorial) {
        const tutorial = currentLesson.content.tutorial;
        const currentSlide = tutorial[currentTutorialIndex];

        return (
            <><Navbar />
                <div className="page-container">
                    <div className="exercise-container animate-fade-in">
                        <div className="exercise-header">
                            <h2 style={{ textAlign: 'center', color: 'var(--primary-light)' }}>🗣️ {currentLesson.title}: Speaking Tutorial</h2>
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Slide {currentTutorialIndex + 1} of {tutorial.length}</p>
                        </div>
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem',
                            padding: '3rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)', margin: '2rem 0',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                        }}>
                            <div style={{ fontSize: '8rem' }}>{currentSlide.visual}</div>
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{currentSlide.title}</h3>
                                <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', maxWidth: '600px' }}>{currentSlide.text}</p>
                            </div>
                            <button className={`speaker-btn ${isSpeaking ? 'playing' : ''}`} onClick={() => speakText(currentSlide.text, currentLesson.language_code)} style={{ fontSize: '2rem', padding: '1rem' }}>🔊</button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                            <button className="btn btn-secondary" onClick={() => currentTutorialIndex > 0 ? setCurrentTutorialIndex(currentTutorialIndex - 1) : setView('list')}>
                                {currentTutorialIndex > 0 ? '← Previous' : '✕ Cancel'}
                            </button>
                            <button className="btn btn-primary" onClick={() => currentTutorialIndex < tutorial.length - 1 ? setCurrentTutorialIndex(currentTutorialIndex + 1) : setView('exercise')}>
                                {currentTutorialIndex < tutorial.length - 1 ? 'Next →' : 'Start Speaking!'}
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // EXERCISE
    if (view === 'exercise' && currentExercise) {
        return (
            <><Navbar />
                <div className="page-container">
                    <div key={`exercise-${currentExerciseIndex}`} className="exercise-container animate-slide-next">
                        <div className="exercise-header">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                                <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                    🏠 Dashboard
                                </Link>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    Speaking Practice
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🗣️ {currentLesson.title}</h1>
                                {currentLesson.title_translation && (
                                    <div className="lesson-translation" style={{ marginTop: '2px' }}>
                                        {currentLesson.title_translation}
                                    </div>
                                )}
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>
                                    {currentLesson.description}
                                    {currentLesson.description_translation && (
                                        <div className="lesson-translation" style={{ display: 'inline', marginLeft: '8px', fontSize: '0.8rem' }}>
                                            ({currentLesson.description_translation})
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="instructions">{currentLesson.content.instructions}</p>
                        </div>

                        <div className="exercise-progress">
                            <div className="step-dots">
                                {exercises.map((_, i) => (
                                    <div key={i} className={`step-dot ${i === currentExerciseIndex ? 'active' : ''} ${i < currentExerciseIndex ? 'completed' : ''}`}></div>
                                ))}
                            </div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginLeft: 'auto' }}>
                                {currentExerciseIndex + 1} / {exercises.length}
                            </span>
                        </div>

                        {(() => {
                            const visualMap = {
                                '🔴': 'red', '🔵': 'blue', '🟢': 'green', '🟡': 'yellow', '🟠': 'orange', '🟣': 'purple', '⚫': 'black', '⚪': 'white', '🟤': 'brown'
                            };
                            const renderVisual = (text, isLarge = false) => {
                                if (typeof text !== 'string') return text;
                                const trimmed = text.trim();
                                if (visualMap[trimmed]) {
                                    return <div className={`color-block ${visualMap[trimmed]}`} style={isLarge ? { width: '120px', height: '120px' } : {}} />;
                                }

                                const emojiRegex = /(\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]|[\u2600-\u26ff]|[\u2700-\u27bf])/g;
                                const hasEmoji = emojiRegex.test(trimmed);
                                if (!hasEmoji) return text;

                                emojiRegex.lastIndex = 0;
                                const parts = trimmed.split(emojiRegex);

                                return (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                                        {parts.map((part, i) => {
                                            if (!part) return null;
                                            emojiRegex.lastIndex = 0;
                                            if (emojiRegex.test(part)) {
                                                return <span key={i} style={{ fontSize: isLarge ? '7rem' : '4.5rem', lineHeight: 1 }}>{part}</span>;
                                            }
                                            return <span key={i} style={{ fontSize: isLarge ? '1.5rem' : '1.2rem' }}>{part}</span>;
                                        })}
                                    </div>
                                );
                            };

                            return (
                                <div className="exercise-prompt">
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ fontSize: '1.4rem' }}>{renderVisual(currentExercise.prompt, true)}</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <button
                                                className={`speaker-btn ${isSpeaking ? 'playing' : ''}`}
                                                onClick={() => speakText(currentExercise.prompt, currentLesson.language_code)}
                                                title="Listen"
                                                style={{ position: 'relative', top: 0, right: 0 }}
                                            >
                                                🔊
                                            </button>
                                            <SpeechSettingsMini />
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {!speechSupported ? (
                            <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--warning)' }}>
                                <p style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>⚠️</p>
                                <p>Speech recognition is not supported in this browser.</p>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Please use Google Chrome for the best experience.</p>
                            </div>
                        ) : (
                            <div className="speech-recorder">
                                <button
                                    className={`record-btn ${isRecording ? 'recording' : ''}`}
                                    onClick={isRecording ? stopRecording : startRecording}
                                >
                                    {isRecording ? '⏹' : '🎤'}
                                </button>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {isRecording ? 'Listening... speak now!' : 'Tap the microphone and say the phrase'}
                                </p>

                                {transcript && (
                                    <div className="speech-result" style={{
                                        borderColor: answerState === 'correct' ? 'var(--success)' : answerState === 'wrong' ? 'var(--error)' : 'var(--border)',
                                        border: '2px solid',
                                        borderRadius: 'var(--radius-md)',
                                        padding: 'var(--space-lg)',
                                        width: '100%',
                                        maxWidth: '400px'
                                    }}>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>You said:</p>
                                        <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>&ldquo;{transcript}&rdquo;</p>
                                    </div>
                                )}

                                {transcript && !answerState && (
                                    <button className="btn btn-primary btn-large" onClick={checkSpeech}>
                                        ✅ Check My Speech
                                    </button>
                                )}

                                {answerState && (
                                    <div style={{ fontSize: '1.2rem', animation: 'fadeInUp 0.3s ease' }}>
                                        {answerState === 'correct' ? (
                                            <span style={{ color: 'var(--success)' }}>✅ Great pronunciation!</span>
                                        ) : (
                                            <span style={{ color: 'var(--error)' }}>🔄 Try saying: &ldquo;{currentExercise.expected}&rdquo;</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <button className="hint-toggle" onClick={() => {
                                    setShowHint(!showHint);
                                    if (!showHint) speakText(currentExercise.hint || '', currentLesson.language_code);
                                }}>
                                    {showHint ? '🙈 Hide Hint' : '💡 Show Hint'}
                                </button>

                                {showHint && (
                                    <>
                                        <p className="hint-text">{currentExercise.hint}</p>
                                        {currentLesson.language_code !== 'en' && currentExercise.hint_translation && (
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => speakText(currentExercise.hint_translation, 'en')}
                                                style={{ padding: '4px 12px', fontSize: '0.8rem', borderRadius: '12px' }}
                                            >
                                                🔊 Listen in English
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // LIST
    return (
        <><Navbar />
            <div className="page-container">
                <div className="page-header animate-fade-in">
                    <h1>🗣️ Speaking Lessons</h1>
                    <p>Practice your pronunciation with speech recognition</p>
                </div>
                <div className="level-tabs" style={{ marginBottom: 'var(--space-xl)' }}>
                    {(user?.target_language === 'en' || user?.target_language === 'en_a1') ? (
                        <button
                            className={`level-tab ${activeLevel === 'Grammar-A1' ? 'active' : ''}`}
                            onClick={() => setActiveLevel('Grammar-A1')}
                        >
                            📖 Grammar-A1
                        </button>
                    ) : (
                        <button
                            className={`level-tab ${activeLevel === 'A0' ? 'active' : ''}`}
                            onClick={() => setActiveLevel('A0')}
                        >
                            A0 — Pre-Elementary
                        </button>
                    )}
                    <button className={`level-tab ${activeLevel === 'A1' ? 'active' : ''}`} onClick={() => setActiveLevel('A1')}>A1 — Elementary</button>
                    <button className={`level-tab ${activeLevel === 'A2' ? 'active' : ''}`} onClick={() => setActiveLevel('A2')}>A2 — Intermediate</button>
                    <button className={`level-tab ${activeLevel === 'B1' ? 'active' : ''}`} onClick={() => setActiveLevel('B1')}>B1 — Advanced</button>
                </div>
                <div className="lesson-list stagger-children">
                    {lessons.map((lesson, i) => (
                        <div key={lesson.id} className="lesson-item animate-fade-in" onClick={() => startLesson(lesson.id)}>
                            <div className={`lesson-number ${lesson.progress?.completed ? 'completed' : ''}`}>
                                {lesson.progress?.completed ? '✓' : i + 1}
                            </div>
                            <div className="lesson-info">
                                <h3 className="lesson-title">{lesson.title}</h3>
                                {lesson.title_translation && (
                                    <div className="lesson-translation">{lesson.title_translation}</div>
                                )}
                                <p className="lesson-desc">
                                    {lesson.description}
                                    {lesson.description_translation && (
                                        <span className="lesson-translation" style={{ display: 'block', fontStyle: 'italic', fontSize: '0.8rem', marginTop: '2px' }}>
                                            {lesson.description_translation}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="lesson-stars">{lesson.progress ? getStarsDisplay(lesson.progress.stars) : '☆☆☆'}</div>
                        </div>
                    ))}
                    {lessons.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-secondary)' }}>
                            <p style={{ fontSize: '2rem' }}>📭</p><p>No {activeLevel} speaking lessons available yet.</p>
                        </div>
                    )}
                </div>
                <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
                    <Link href="/dashboard" className="btn btn-secondary">← Back to Dashboard</Link>
                </div>
            </div>
        </>
    );
}
