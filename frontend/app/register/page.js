'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { authAPI, saveAuth } from '../lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        display_name: '',
        age: '',
    });
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
            const data = await authAPI.register({
                ...form,
                age: parseInt(form.age)
            });
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
                    <h1>🚀 Join LingoSpark!</h1>
                    <p className="auth-subtitle">Start your language adventure today</p>

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
                            <label className="form-label">Display Name</label>
                            <input
                                className="form-input"
                                type="text"
                                name="display_name"
                                placeholder="What should we call you?"
                                value={form.display_name}
                                onChange={handleChange}
                                required
                                id="register-display-name"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                className="form-input"
                                type="text"
                                name="username"
                                placeholder="Choose a cool username"
                                value={form.username}
                                onChange={handleChange}
                                required
                                id="register-username"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                className="form-input"
                                type="email"
                                name="email"
                                placeholder="your@email.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                                id="register-email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Age</label>
                            <input
                                className="form-input"
                                type="number"
                                name="age"
                                placeholder="Your age (6+)"
                                value={form.age}
                                onChange={handleChange}
                                min="6"
                                required
                                id="register-age"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                className="form-input"
                                type="password"
                                name="password"
                                placeholder="Choose a password (4+ characters)"
                                value={form.password}
                                onChange={handleChange}
                                minLength="4"
                                required
                                id="register-password"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-large btn-block" disabled={loading} id="register-submit">
                            {loading ? '⏳ Creating Account...' : '✨ Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account? <Link href="/login">Login here</Link>
                    </div>
                </div>
            </div>
        </>
    );
}
