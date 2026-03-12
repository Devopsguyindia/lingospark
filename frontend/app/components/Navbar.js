'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getStoredUser, clearAuth, isLoggedIn, authAPI, saveAuth } from '../lib/api';
import { useSpeech } from '../context/SpeechContext';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // We safely destructure useSpeech in case context is unavailable
    const speechContext = useSpeech() || {};
    const { voiceGender = 'female', setVoiceGender = () => { }, accent = 'en-US', setAccent = () => { } } = speechContext;

    useEffect(() => {
        setLoggedIn(isLoggedIn());
        setUser(getStoredUser());
    }, [pathname]);

    const handleLogout = () => {
        clearAuth();
        setLoggedIn(false);
        setUser(null);
        router.push('/');
    };

    const handleCourseSwitch = async (langCode) => {
        try {
            const data = await authAPI.updateProfile({ target_language: langCode });
            saveAuth(localStorage.getItem('lingospark_token'), data.user);
            setUser(data.user);
            window.location.reload(); // Refresh to update all data
        } catch (err) {
            console.error('Failed to switch course:', err);
            const errMsg = err.message?.toLowerCase() || '';
            if (errMsg.includes('user no longer exists') ||
                errMsg.includes('not found') ||
                errMsg.includes('invalid') ||
                errMsg.includes('unauthorized')) {
                handleLogout(); // Force logout if session is dead
            } else {
                alert('Failed to switch course. Please try again.');
            }
        }
    };

    // Don't show navbar on landing page
    if (pathname === '/') return null;

    return (
        <>
            <nav className="navbar">
                <Link href="/dashboard" className="navbar-brand">
                    <span className="logo-icon">✨</span>
                    LingoSpark
                </Link>

                {loggedIn && (
                    <div className="course-switcher">
                        <button
                            className={`course-btn ${user?.target_language === 'en' ? 'active' : ''}`}
                            onClick={() => handleCourseSwitch('en')}
                        >
                            🇬🇧 English
                        </button>
                        <button
                            className={`course-btn ${user?.target_language === 'de' ? 'active' : ''}`}
                            onClick={() => handleCourseSwitch('de')}
                        >
                            🇩🇪 German
                        </button>
                    </div>
                )}

                <div className="navbar-links">
                    {loggedIn ? (
                        <>
                            <Link href="/dashboard" style={{ color: pathname === '/dashboard' ? 'var(--primary-light)' : undefined }}>
                                Dashboard
                            </Link>
                            <Link href="/learn/listening" style={{ color: pathname.includes('/learn') ? 'var(--primary-light)' : undefined }}>
                                Learn
                            </Link>
                            <button onClick={() => setShowSettings(true)} className="btn btn-secondary" style={{ padding: '0.4rem', fontSize: '1.2rem', background: 'transparent', border: 'none' }} title="Speech Settings">
                                ⚙️
                            </button>
                            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                                Logout
                            </button>
                            {user && (
                                <div className="navbar-user">
                                    <div className="avatar">
                                        {user.display_name?.[0]?.toUpperCase() || '👤'}
                                    </div>
                                    <div className="user-info">
                                        <span className="user-name">{user.display_name}</span>
                                        <span className="user-level">{user.cefr_level || 'A1'}</span>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <Link href="/login">Login</Link>
                            <Link href="/register" className="btn btn-primary" style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem' }}>
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {showSettings && (
                <div className="modal-overlay" onClick={() => setShowSettings(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: 'var(--space-xl)' }}>⚙️ Speech Settings</h2>

                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-sm)', fontWeight: 'bold' }}>Voice Gender</label>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                <button className={`btn ${voiceGender === 'female' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setVoiceGender('female')} style={{ flex: 1 }}>Female</button>
                                <button className={`btn ${voiceGender === 'male' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setVoiceGender('male')} style={{ flex: 1 }}>Male</button>
                            </div>
                        </div>

                        <div style={{ marginBottom: 'var(--space-2xl)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-sm)', fontWeight: 'bold' }}>Accent</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                <button className={`btn ${accent === 'en-US' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAccent('en-US')}>🇺🇸 US English</button>
                                <button className={`btn ${accent === 'en-GB' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAccent('en-GB')}>🇬🇧 UK English</button>
                                <button className={`btn ${accent === 'en-IN' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAccent('en-IN')}>🇮🇳 Neutral English</button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <button className="btn btn-primary" onClick={() => setShowSettings(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
