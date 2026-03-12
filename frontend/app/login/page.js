'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { authAPI, saveAuth } from '../lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await authAPI.login(form);
            saveAuth(data.token, data.user);
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="auth-container">
                <div className="auth-card animate-fade-in">
                    <h1>👋 Welcome Back!</h1>
                    <p className="auth-subtitle">Continue your learning adventure</p>

                    {error && (
                        <div style={{
                            padding: '0.8rem',
                            background: 'rgba(255,107,107,0.1)',
                            border: '1px solid var(--error)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--error)',
                            marginBottom: '1rem',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Username or Email</label>
                            <input
                                className="form-input"
                                type="text"
                                name="username"
                                placeholder="Enter your username or email"
                                value={form.username}
                                onChange={handleChange}
                                required
                                id="login-username"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                className="form-input"
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                id="login-password"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-large btn-block" disabled={loading} id="login-submit">
                            {loading ? '⏳ Logging in...' : '🔓 Login'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don&apos;t have an account? <Link href="/register">Sign up for free</Link>
                    </div>
                </div>
            </div>
        </>
    );
}
