'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { isLoggedIn, lessonsAPI, assessmentsAPI, progressAPI, getStoredUser } from '../../lib/api';
import { useSpeech } from '../../context/SpeechContext';
import SpeechSettingsMini from '../../components/SpeechSettingsMini';

export default function ListeningPage() {
    const router = useRouter();
    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [answerState, setAnswerState] = useState(null); // null | 'correct' | 'wrong'
    const [results, setResults] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' | 'exercise' | 'results'
    const [activeLevel, setActiveLevel] = useState('A1');
    const { speak: speakText, speaking: isSpeaking } = useSpeech() || {};

    useEffect(() => {
        if (!isLoggedIn()) { router.push('/login'); return; }
        loadLessons();
    }, [activeLevel]);

    const loadLessons = async () => {
        try {
            const user = getStoredUser();
            const data = await lessonsAPI.list({
                level: activeLevel,
                skill: 'listening',
                language: user?.target_language || 'en'
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
            setAnswers([]);
            setSelectedAnswer(null);
            setAnswerState(null);
            setShowHint(false);
            setResults(null);
            setView('exercise');
        } catch (err) {
            console.error('Failed to load lesson:', err);
        }
    };

    const exercises = currentLesson?.content?.exercises || [];
    const currentExercise = exercises[currentExerciseIndex];

    const handleOptionSelect = (index) => {
        if (answerState) return; // Already answered
        setSelectedAnswer(index);
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return;

        const isCorrect = selectedAnswer === currentExercise.correct;
        setAnswerState(isCorrect ? 'correct' : 'wrong');
        const newAnswers = [...answers, selectedAnswer];
        setAnswers(newAnswers);

        setTimeout(() => {
            if (currentExerciseIndex < exercises.length - 1) {
                setCurrentExerciseIndex(currentExerciseIndex + 1);
                setSelectedAnswer(null);
                setAnswerState(null);
                setShowHint(false);
            } else {
                submitAnswers(newAnswers);
            }
        }, 1500);
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
                time_spent_seconds: 60
            });

            setResults(checkResult);
            setView('results');
        } catch (err) {
            console.error('Submit error:', err);
        }
    };

    const getStarsDisplay = (stars) => {
        return '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    };

    const renderOption = (text) => {
        // If it's a short text/emoji (like '🔴' or '🐱'), it can naturally inherit the 2.5rem from parent
        // We use Array.from to safely measure length counting complex emojis as 1 character
        const chars = Array.from(text);

        if (chars.length <= 4 && !/[A-Za-z]/.test(text)) {
            return <span style={{ fontSize: '3rem' }}>{text}</span>;
        }

        // Check if string starts with an emoji followed by text (e.g., '👩 Mother')
        // We check if the very first grapheme (or pair) is not a normal letter/number, and there's a space after it
        if (chars.length > 2) {
            // Some emojis are actually compound (e.g. skin tones, professions)
            // But typically they are separated by a space from the text in our DB
            const firstSpaceIndex = text.indexOf(' ');
            if (firstSpaceIndex > 0 && firstSpaceIndex < 10) {
                const firstPart = text.substring(0, firstSpaceIndex).trim();
                const rest = text.substring(firstSpaceIndex + 1).trim();

                // If the first part before the space doesn't contain any letters/numbers, it's our emoji
                if (firstPart && !/[a-zA-Z0-9]/.test(firstPart)) {
                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                            <span style={{ fontSize: '3.5rem' }}>{firstPart}</span>
                            <span style={{ fontSize: '1.3rem', marginTop: '8px' }}>{rest}</span>
                        </div>
                    );
                }
            }
        }

        // Fallback for standard long text options
        return <span style={{ fontSize: '1.3rem' }}>{text}</span>;
    };

    if (loading) {
        return (
            <><Navbar />
                <div className="page-container">
                    <div className="loading-screen"><div className="spinner"></div><p>Loading listening lessons...</p></div>
                </div>
            </>
        );
    }

    // RESULTS VIEW
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

    // EXERCISE VIEW
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
                                <div style={{ flex: 1, textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        Listening Practice
                                    </div>
                                    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{currentLesson.title}</h1>
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
                            </div>
                            <p className="instructions">{currentLesson.content.instructions}</p>
                        </div>

                        <div className="exercise-progress">
                            <div className="step-dots">
                                {exercises.map((_, i) => (
                                    <div key={i} className={`step-dot ${i === currentExerciseIndex ? 'active' : ''} ${i < currentExerciseIndex ? (answers[i] === exercises[i].correct ? 'completed' : 'wrong') : ''}`}></div>
                                ))}
                            </div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginLeft: 'auto' }}>
                                {currentExerciseIndex + 1} / {exercises.length}
                            </span>
                        </div>

                        {/* Helper to render emojis or colors nicely */}
                        {(() => {
                            const visualMap = {
                                '🔴': 'red', '🔵': 'blue', '🟢': 'green', '🟡': 'yellow', '🟠': 'orange', '🟣': 'purple', '⚫': 'black', '⚪': 'white', '🟤': 'brown'
                            };
                            const renderVisual = (text, isLarge = false) => {
                                if (typeof text !== 'string') return text;
                                const trimmed = text.trim();
                                if (visualMap[trimmed]) {
                                    return <div className={`color-block ${visualMap[trimmed]}`} style={isLarge ? { width: '100px', height: '100px' } : {}} />;
                                }

                                // Enhanced emoji detection & splitting
                                const emojiRegex = /(\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]|[\u2600-\u26ff]|[\u2700-\u27bf])/g;
                                const hasEmoji = emojiRegex.test(trimmed);

                                if (!hasEmoji) return text;

                                // Reset regex index for splitting
                                emojiRegex.lastIndex = 0;
                                const parts = trimmed.split(emojiRegex);

                                return (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                        {parts.map((part, i) => {
                                            if (!part) return null;
                                            emojiRegex.lastIndex = 0;
                                            if (emojiRegex.test(part)) {
                                                return <span key={i} style={{ fontSize: isLarge ? '6rem' : '4rem', lineHeight: 1, display: 'inline-block' }}>{part}</span>;
                                            }
                                            return <span key={i} style={{ fontSize: isLarge ? '1.4rem' : '1.1rem' }}>{part}</span>;
                                        })}
                                    </div>
                                );
                            };

                            return (
                                <>
                                    <div className="exercise-prompt">
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ fontSize: '1.4rem' }}>{renderVisual(currentExercise.prompt, true)}</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <button
                                                    className={`speaker-btn ${isSpeaking ? 'playing' : ''}`}
                                                    onClick={() => speakText(currentExercise.prompt)}
                                                    title="Listen"
                                                    style={{ position: 'relative', top: 0, right: 0 }}
                                                >
                                                    🔊
                                                </button>
                                                <SpeechSettingsMini />
                                            </div>
                                        </div>
                                    </div>

                                    {currentExercise.question && (
                                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', fontSize: '1.05rem' }}>
                                            {currentExercise.question}
                                        </p>
                                    )}

                                    <div className="options-grid">
                                        {currentExercise.options?.map((option, i) => (
                                            <button
                                                key={i}
                                                className={`option-btn ${selectedAnswer === i ? 'selected' : ''} ${answerState && i === currentExercise.correct ? 'correct' : ''} ${answerState === 'wrong' && selectedAnswer === i ? 'wrong' : ''} ${option?.length <= 2 ? 'visual-only' : ''}`}
                                                onClick={() => handleOptionSelect(i)}
                                                disabled={answerState !== null}
                                            >
                                                {renderVisual(option)}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            );
                        })()}

                        {selectedAnswer !== null && !answerState && (
                            <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
                                <button className="btn btn-primary btn-large" onClick={handleSubmitAnswer}>
                                    ✅ Check Answer
                                </button>
                            </div>
                        )}

                        {answerState && (
                            <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)', fontSize: '1.2rem', animation: 'fadeInUp 0.3s ease' }}>
                                {answerState === 'correct' ? (
                                    <span style={{ color: 'var(--success)' }}>✅ Correct! Great job!</span>
                                ) : (
                                    <span style={{ color: 'var(--error)' }}>❌ Not quite. The answer was: {currentExercise.options[currentExercise.correct]}</span>
                                )}
                            </div>
                        )}

                        <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <button className="hint-toggle" onClick={() => {
                                    setShowHint(!showHint);
                                    if (!showHint) speakText(currentExercise.hint || '');
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

    // LIST VIEW
    return (
        <><Navbar />
            <div className="page-container">
                <div className="page-header animate-fade-in">
                    <h1>🎧 Listening Lessons</h1>
                    <p>Train your ears with fun audio exercises</p>
                </div>

                <div className="level-tabs" style={{ marginBottom: 'var(--space-xl)' }}>
                    <button className={`level-tab ${activeLevel === 'A1' ? 'active' : ''}`} onClick={() => setActiveLevel('A1')}>A1 — Beginner</button>
                    <button className={`level-tab ${activeLevel === 'A2' ? 'active' : ''}`} onClick={() => setActiveLevel('A2')}>A2 — Elementary</button>
                    <button className={`level-tab ${activeLevel === 'B1' ? 'active' : ''}`} onClick={() => setActiveLevel('B1')}>B1 — Intermediate</button>
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
                            <div className="lesson-stars">
                                {lesson.progress ? getStarsDisplay(lesson.progress.stars) : '☆☆☆'}
                            </div>
                        </div>
                    ))}
                    {lessons.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-secondary)' }}>
                            <p style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>📭</p>
                            <p>No {activeLevel} listening lessons available yet.</p>
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
