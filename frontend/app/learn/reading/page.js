'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { isLoggedIn, lessonsAPI, assessmentsAPI, progressAPI, getStoredUser } from '../../lib/api';
import { useSpeech } from '../../context/SpeechContext';

export default function ReadingPage() {
    const router = useRouter();
    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [answerState, setAnswerState] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list');
    const [activeLevel, setActiveLevel] = useState('A1');
    const [showHint, setShowHint] = useState(false);
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
                skill: 'reading',
                language: user?.target_language || 'en'
            });
            setLessons(data.lessons || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
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
            setView('exercise');
        } catch (err) { console.error(err); }
    };

    const exercises = currentLesson?.content?.exercises || [];
    const currentExercise = exercises[currentExerciseIndex];
    const lessonType = currentLesson?.content?.type;

    const handleOptionSelect = (index) => {
        if (answerState) return;
        setSelectedAnswer(index);
    };

    const handleTrueFalse = (value) => {
        if (answerState) return;
        setSelectedAnswer(value);
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return;

        const correctValue = currentExercise.correct;
        const isCorrect = selectedAnswer === correctValue;
        setAnswerState(isCorrect ? 'correct' : 'wrong');

        const newAnswers = [...answers, selectedAnswer];
        setAnswers(newAnswers);

        setTimeout(() => {
            if (currentExerciseIndex < exercises.length - 1) {
                setCurrentExerciseIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setAnswerState(null);
                setShowHint(false);
            } else {
                submitAnswers(newAnswers);
            }
        }, 1800);
    };

    const submitAnswers = async (finalAnswers) => {
        try {
            const checkResult = await assessmentsAPI.check({ lesson_id: currentLesson.id, answers: finalAnswers });
            await progressAPI.save({ lesson_id: currentLesson.id, score: checkResult.score, time_spent_seconds: 120 });
            setResults(checkResult);
            setView('results');
        } catch (err) { console.error(err); }
    };

    const getStarsDisplay = (s) => '⭐'.repeat(s) + '☆'.repeat(3 - s);

    if (loading) {
        return <><Navbar /><div className="page-container"><div className="loading-screen"><div className="spinner"></div><p>Loading reading lessons...</p></div></div></>;
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
                            <Link href="/dashboard" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏠 Dashboard</Link>
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
                    <div className="exercise-container animate-fade-in">
                        <div className="exercise-header">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                                <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                    🏠 Dashboard
                                </Link>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    Reading Practice
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ margin: 0 }}>📖 {currentLesson.title}</h2>
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
                                    <div key={i} className={`step-dot ${i === currentExerciseIndex ? 'active' : ''} ${i < currentExerciseIndex ? (answers[i] === exercises[i].correct ? 'completed' : 'wrong') : ''}`}></div>
                                ))}
                            </div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginLeft: 'auto' }}>
                                {currentExerciseIndex + 1} / {exercises.length}
                            </span>
                        </div>

                        {/* Passage (for story-type lessons) */}
                        {currentLesson.content.passage && currentExerciseIndex === 0 && (
                            <div style={{
                                background: 'var(--bg-secondary)',
                                padding: 'var(--space-xl)',
                                borderRadius: 'var(--radius-lg)',
                                marginBottom: 'var(--space-xl)',
                                lineHeight: 1.8,
                                fontSize: '1.1rem',
                                border: '1px solid var(--border)'
                            }}>
                                📜 {currentLesson.content.passage}
                            </div>
                        )}

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

                                const emojiRegex = /(\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]|[\u2600-\u26ff]|[\u2700-\u27bf])/g;
                                const hasEmoji = emojiRegex.test(trimmed);
                                if (!hasEmoji) return text;

                                emojiRegex.lastIndex = 0;
                                const parts = trimmed.split(emojiRegex);

                                return (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
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
                                <>
                                    {/* Exercise prompt based on type */}
                                    <div className="exercise-prompt">
                                        {lessonType === 'true_false' && currentExercise.statement}
                                        {lessonType === 'read_and_match' && (
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                {renderVisual(currentExercise.word, true)}
                                            </div>
                                        )}
                                        {lessonType === 'fill_blank' && currentExercise.sentence}
                                        {(lessonType === 'read_and_choose') && (
                                            <>
                                                {currentExercise.sentence && <div style={{ marginBottom: '0.8rem', fontSize: '1.1rem' }}>{currentExercise.sentence}</div>}
                                                <div style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{currentExercise.question}</div>
                                            </>
                                        )}
                                    </div>

                                    {/* True/False buttons */}
                                    {lessonType === 'true_false' ? (
                                        <div className="options-grid">
                                            <button
                                                className={`option-btn ${selectedAnswer === true ? 'selected' : ''} ${answerState && currentExercise.correct === true ? 'correct' : ''} ${answerState === 'wrong' && selectedAnswer === true ? 'wrong' : ''}`}
                                                onClick={() => handleTrueFalse(true)}
                                            >
                                                ✅ TRUE
                                            </button>
                                            <button
                                                className={`option-btn ${selectedAnswer === false ? 'selected' : ''} ${answerState && currentExercise.correct === false ? 'correct' : ''} ${answerState === 'wrong' && selectedAnswer === false ? 'wrong' : ''}`}
                                                onClick={() => handleTrueFalse(false)}
                                            >
                                                ❌ FALSE
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="options-grid">
                                            {currentExercise.options?.map((option, i) => (
                                                <button
                                                    key={i}
                                                    className={`option-btn ${selectedAnswer === i ? 'selected' : ''} ${answerState && i === currentExercise.correct ? 'correct' : ''} ${answerState === 'wrong' && selectedAnswer === i ? 'wrong' : ''} ${option?.length <= 2 ? 'visual-only' : ''}`}
                                                    onClick={() => handleOptionSelect(i)}
                                                >
                                                    {renderVisual(option)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        {selectedAnswer !== null && !answerState && (
                            <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
                                <button className="btn btn-primary btn-large" onClick={handleSubmitAnswer}>✅ Check Answer</button>
                            </div>
                        )}
                        {answerState && (
                            <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)', fontSize: '1.1rem', animation: 'fadeInUp 0.3s ease' }}>
                                {answerState === 'correct' ? (
                                    <span style={{ color: 'var(--success)' }}>✅ Correct! {currentExercise.explanation || ''}</span>
                                ) : (
                                    <span style={{ color: 'var(--error)' }}>❌ {currentExercise.explanation || 'Not quite right.'}</span>
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
                    <h1>📖 Reading Lessons</h1>
                    <p>Build vocabulary and comprehension skills</p>
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
                        <div style={{ textAlign: 'center', padding: 'var(--space-3xl)' }} className="text-secondary">
                            <p style={{ fontSize: '2rem' }}>📭</p><p>No {activeLevel} reading lessons available yet.</p>
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
