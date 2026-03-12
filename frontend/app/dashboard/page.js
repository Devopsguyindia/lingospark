'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { getStoredUser, isLoggedIn, progressAPI, lessonsAPI } from '../lib/api';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [summary, setSummary] = useState(null);
    const [activeLevel, setActiveLevel] = useState('A1');
    const [loading, setLoading] = useState(true);
    const [lessons, setLessons] = useState({});

    useEffect(() => {
        if (!isLoggedIn()) {
            router.push('/login');
            return;
        }
        setUser(getStoredUser());
        loadData();
    }, [activeLevel]);

    const loadData = async () => {
        try {
            const currentLang = user?.target_language || 'en';
            const [summaryData, listeningData, speakingData, readingData, writingData] = await Promise.all([
                progressAPI.summary().catch(() => null),
                lessonsAPI.list({ level: activeLevel, skill: 'listening', language: currentLang }).catch(() => ({ lessons: [] })),
                lessonsAPI.list({ level: activeLevel, skill: 'speaking', language: currentLang }).catch(() => ({ lessons: [] })),
                lessonsAPI.list({ level: activeLevel, skill: 'reading', language: currentLang }).catch(() => ({ lessons: [] })),
                lessonsAPI.list({ level: activeLevel, skill: 'writing', language: currentLang }).catch(() => ({ lessons: [] })),
            ]);

            setSummary(summaryData);
            setLessons({
                listening: listeningData.lessons || [],
                speaking: speakingData.lessons || [],
                reading: readingData.lessons || [],
                writing: writingData.lessons || [],
            });
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getSkillProgress = (skill) => {
        if (!summary?.skill_stats) return { completed: 0, total: 0, avgScore: 0 };
        const stat = summary.skill_stats.find(s => s.skill === skill);
        return {
            completed: stat?.total_completed || 0,
            total: lessons[skill]?.length || 0,
            avgScore: stat?.avg_score || 0,
        };
    };

    const skillData = [
        { key: 'listening', icon: '🎧', name: 'Listening', color: 'var(--listening)', desc: 'Train your ears' },
        { key: 'speaking', icon: '🗣️', name: 'Speaking', color: 'var(--speaking)', desc: 'Practice pronunciation' },
        { key: 'reading', icon: '📖', name: 'Reading', color: 'var(--reading)', desc: 'Understand text' },
        { key: 'writing', icon: '✍️', name: 'Writing', color: 'var(--writing)', desc: 'Spell & compose' },
    ];

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="page-container">
                    <div className="loading-screen">
                        <div className="spinner"></div>
                        <p>Loading your dashboard...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="page-container">
                {/* Welcome */}
                <div className="dashboard-welcome animate-fade-in">
                    <h1>Hey {user?.display_name || 'Learner'}! 👋</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                        <p className="welcome-sub">
                            Level: <strong style={{ color: 'var(--primary-light)' }}>{user?.cefr_level || 'A1'}</strong>
                        </p>
                        <div className="badge badge-course" style={{ background: 'var(--primary)', color: 'white', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                            {user?.target_language === 'de' ? '🇩🇪 Speak German' : '🇬🇧 Speak English'}
                        </div>
                        <p className="welcome-sub" style={{ opacity: 0.7 }}>Keep up the great work!</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-grid stagger-children">
                    <div className="stat-card animate-fade-in">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-value">{summary?.user?.total_stars || 0}</div>
                        <div className="stat-label">Total Stars</div>
                    </div>
                    <div className="stat-card animate-fade-in">
                        <div className="stat-icon">⚡</div>
                        <div className="stat-value">{summary?.user?.total_xp || 0}</div>
                        <div className="stat-label">Total XP</div>
                    </div>
                    <div className="stat-card animate-fade-in">
                        <div className="stat-icon">🏅</div>
                        <div className="stat-value">{summary?.total_badges || 0}</div>
                        <div className="stat-label">Badges</div>
                    </div>
                    <div className="stat-card animate-fade-in">
                        <div className="stat-icon">📚</div>
                        <div className="stat-value">
                            {summary?.skill_stats?.reduce((sum, s) => sum + (s.total_completed || 0), 0) || 0}
                        </div>
                        <div className="stat-label">Lessons Done</div>
                    </div>
                </div>

                {/* Badges */}
                {summary?.badges && summary.badges.length > 0 && (
                    <div style={{ marginBottom: 'var(--space-2xl)' }}>
                        <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--space-md)' }}>🏆 Your Badges</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                            {summary.badges.map((badge, i) => (
                                <div key={i} className="badge badge-a1" style={{ padding: '0.5rem 0.8rem', fontSize: '0.9rem' }}>
                                    {badge.icon} {badge.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* LSRW Skills */}
                <div className="skills-section">
                    <h2>Your LSRW Skills</h2>

                    <div className="level-tabs">
                        <button
                            className={`level-tab ${activeLevel === 'A1' ? 'active' : ''}`}
                            onClick={() => setActiveLevel('A1')}
                        >
                            A1 — Beginner
                        </button>
                        <button
                            className={`level-tab ${activeLevel === 'A2' ? 'active' : ''}`}
                            onClick={() => setActiveLevel('A2')}
                        >
                            A2 — Elementary
                        </button>
                        <button
                            className={`level-tab ${activeLevel === 'B1' ? 'active' : ''}`}
                            onClick={() => setActiveLevel('B1')}
                        >
                            B1 — Intermediate
                        </button>
                    </div>

                    <div className="skills-grid stagger-children">
                        {skillData.map((skill) => {
                            const progress = getSkillProgress(skill.key);
                            const percentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

                            return (
                                <Link href={`/learn/${skill.key}`} key={skill.key} style={{ textDecoration: 'none' }}>
                                    <div className={`skill-card ${skill.key} animate-fade-in`}>
                                        <div className="skill-icon">{skill.icon}</div>
                                        <div className="skill-name">{skill.name}</div>
                                        <div className="skill-desc">{skill.desc}</div>

                                        <div style={{ marginTop: 'var(--space-sm)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                <span>{progress.completed}/{progress.total} lessons</span>
                                                <span>{percentage}%</span>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar-fill" style={{ width: `${percentage}%`, background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
