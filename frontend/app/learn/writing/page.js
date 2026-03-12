'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { isLoggedIn, lessonsAPI, assessmentsAPI, progressAPI, getStoredUser } from '../../lib/api';
import { useSpeech } from '../../context/SpeechContext';
import SpeechSettingsMini from '../../components/SpeechSettingsMini';

export default function WritingPage() {
    const router = useRouter();
    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [answers, setAnswers] = useState([]);
    const [answerState, setAnswerState] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list');
    const [activeLevel, setActiveLevel] = useState('A1');
    const [showHint, setShowHint] = useState(false);
    const inputRef = useRef(null);
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
                skill: 'writing',
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
            setTypedText('');
            setAnswerState(null);
            setShowHint(false);
            setView('exercise');
            setTimeout(() => inputRef.current?.focus(), 100);
        } catch (err) { console.error(err); }
    };

    const exercises = currentLesson?.content?.exercises || [];
    const currentExercise = exercises[currentExerciseIndex];
    const lessonType = currentLesson?.content?.type;

    const getExpected = () => {
        if (!currentExercise) return '';
        return currentExercise.expected || currentExercise.sentence || '';
    };

    const getPrompt = () => {
        if (!currentExercise) return '';
        switch (lessonType) {
            case 'type_word': return currentExercise.prompt;
            case 'unscramble': return `Unscramble: ${currentExercise.scrambled}`;
            case 'fill_letters': return `Complete: ${currentExercise.partial}`;
            case 'copy_sentence': return `Type: "${currentExercise.sentence}"`;
            case 'fill_blank_type': return currentExercise.sentence;
            case 'guided_writing': return currentExercise.question;
            default: return currentExercise.prompt || '';
        }
    };

    const getPlaceholder = () => {
        switch (lessonType) {
            case 'type_word': return 'Type the word here...';
            case 'unscramble': return 'Type the correct word...';
            case 'fill_letters': return 'Type the complete word...';
            case 'copy_sentence': return 'Type the sentence here...';
            case 'fill_blank_type': return 'Type the missing word...';
            case 'guided_writing': return currentExercise?.starter ? `${currentExercise.starter}...` : 'Write your answer...';
            default: return 'Type here...';
        }
    };

    const handleSubmitTyping = () => {
        if (!typedText.trim()) return;

        const expected = getExpected();
        const normalize = (t) => t.toLowerCase().trim();
        const isCorrect = normalize(typedText) === normalize(expected);

        setAnswerState(isCorrect ? 'correct' : 'wrong');
        const newAnswers = [...answers, typedText.trim()];
        setAnswers(newAnswers);

        setTimeout(() => {
            if (currentExerciseIndex < exercises.length - 1) {
                setCurrentExerciseIndex(prev => prev + 1);
                setTypedText('');
                setAnswerState(null);
                setShowHint(false);
                setTimeout(() => inputRef.current?.focus(), 100);
            } else {
                submitAnswers(newAnswers);
            }
        }, 1800);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !answerState) {
            handleSubmitTyping();
        }
    };

    const submitAnswers = async (finalAnswers) => {
        try {
            const checkResult = await assessmentsAPI.check({ lesson_id: currentLesson.id, answers: finalAnswers });
            await progressAPI.save({ lesson_id: currentLesson.id, score: checkResult.score, time_spent_seconds: 180 });
            setResults(checkResult);
            setView('results');
        } catch (err) { console.error(err); }
    };

    // Letter-by-letter coloring for feedback
    const renderLetterFeedback = () => {
        if (!typedText || !currentExercise) return null;
        const expected = getExpected();

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '2px',
                marginTop: 'var(--space-md)',
                fontSize: '1.3rem',
                fontFamily: "'Fredoka', sans-serif",
                letterSpacing: '3px'
            }}>
                {typedText.split('').map((char, i) => {
                    const isMatch = expected[i] && char.toLowerCase() === expected[i].toLowerCase();
                    return (
                        <span key={i} style={{
                            color: isMatch ? 'var(--success)' : 'var(--error)',
                            fontWeight: 600
                        }}>
                            {char}
                        </span>
                    );
                })}
            </div>
        );
    };

    const getStarsDisplay = (s) => '⭐'.repeat(s) + '☆'.repeat(3 - s);

    if (loading) {
        return <><Navbar /><div className="page-container"><div className="loading-screen"><div className="spinner"></div><p>Loading writing lessons...</p></div></div></>;
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
                            <button className="btn btn-secondary" onClick={() => { setView('list'); setResults(null); loadLessons(); }}>📋 Back to Lessons</button>
                            <Link href="/dashboard" className="btn btn-outline">🏠 Dashboard</Link>
                            <button className="btn btn-primary" onClick={() => startLesson(currentLesson.id)}>🔄 Try Again</button>
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
                                    Writing Practice
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
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
                                    return <div className={`color-block ${visualMap[trimmed]}`} style={isLarge ? { width: '90px', height: '90px' } : {}} />;
                                }

                                const emojiRegex = /(\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]|[\u2600-\u26ff]|[\u2700-\u27bf])/g;
                                const hasEmoji = emojiRegex.test(trimmed);
                                if (!hasEmoji) return text;

                                emojiRegex.lastIndex = 0;
                                const parts = trimmed.split(emojiRegex);

                                return (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                        {parts.map((part, i) => {
                                            if (!part) return null;
                                            emojiRegex.lastIndex = 0;
                                            if (emojiRegex.test(part)) {
                                                return <span key={i} style={{ fontSize: isLarge ? '6rem' : '4rem', lineHeight: 1 }}>{part}</span>;
                                            }
                                            return <span key={i} style={{ fontSize: isLarge ? '1.4rem' : '1.1rem' }}>{part}</span>;
                                        })}
                                    </div>
                                );
                            };

                            return (
                                <div className="exercise-prompt">
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                                        {renderVisual(getPrompt(), true)}
                                    </div>
                                    {(lessonType === 'type_word' || lessonType === 'fill_letters') && (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
                                            <button
                                                className={`speaker-btn ${isSpeaking ? 'playing' : ''}`}
                                                onClick={() => speakText(getExpected())}
                                                title="Listen"
                                                style={{ position: 'relative', top: 0, right: 0 }}
                                            >
                                                🔊
                                            </button>
                                            <SpeechSettingsMini />
                                        </div>
                                    )}
                                    {!(lessonType === 'type_word' || lessonType === 'fill_letters') && (
                                        <div style={{ marginTop: '10px' }}>
                                            <SpeechSettingsMini />
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {lessonType === 'guided_writing' && currentExercise.example && (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 'var(--space-md)' }}>
                                Example: <em>{currentExercise.example}</em>
                            </p>
                        )}

                        <input
                            ref={inputRef}
                            type="text"
                            className={`typing-input ${answerState === 'correct' ? 'correct' : ''} ${answerState === 'wrong' ? 'wrong' : ''}`}
                            placeholder={getPlaceholder()}
                            value={typedText}
                            onChange={(e) => setTypedText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={!!answerState}
                            autoFocus
                            id="writing-input"
                        />

                        {typedText && !answerState && renderLetterFeedback()}

                        {typedText && !answerState && (
                            <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
                                <button className="btn btn-primary btn-large" onClick={handleSubmitTyping}>
                                    ✅ Check Answer
                                </button>
                            </div>
                        )}

                        {answerState && (
                            <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)', fontSize: '1.1rem', animation: 'fadeInUp 0.3s ease' }}>
                                {answerState === 'correct' ? (
                                    <span style={{ color: 'var(--success)' }}>✅ Perfect spelling!</span>
                                ) : (
                                    <span style={{ color: 'var(--error)' }}>❌ The correct answer is: <strong>{getExpected()}</strong></span>
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

    // LIST
    return (
        <><Navbar />
            <div className="page-container">
                <div className="page-header animate-fade-in">
                    <h1>✍️ Writing Lessons</h1>
                    <p>Practice spelling, typing, and composing</p>
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
                            <div className="lesson-stars">{lesson.progress ? getStarsDisplay(lesson.progress.stars) : '☆☆☆'}</div>
                        </div>
                    ))}
                    {lessons.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-secondary)' }}>
                            <p style={{ fontSize: '2rem' }}>📭</p><p>No {activeLevel} writing lessons available yet.</p>
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
