import Link from 'next/link';

export default function Home() {
  return (
    <main>
      {/* Navbar for landing */}
      <nav className="navbar">
        <Link href="/" className="navbar-brand">
          <span className="logo-icon">✨</span>
          LingoSpark
        </Link>
        <div className="navbar-links">
          <Link href="/login">Login</Link>
          <Link href="/register" className="btn btn-primary" style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem' }}>
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">🌟 CEFR-Aligned Learning</div>
        <h1>
          Learn Languages<br />
          <span className="highlight">The Spark Way!</span>
        </h1>
        <p className="hero-desc">
          Master English through Listening, Speaking, Reading, and Writing.
          Fun exercises, colorful lessons, and rewards — designed for learners aged 6 and up!
        </p>
        <div className="hero-actions">
          <Link href="/register" className="btn btn-primary btn-large">
            🚀 Start Learning Free
          </Link>
          <Link href="/login" className="btn btn-secondary btn-large">
            I Have an Account
          </Link>
        </div>

        <div className="hero-features">
          <div className="hero-feature">
            <span className="feature-icon">🎧</span>
            <div className="feature-title">Listening</div>
            <div className="feature-desc">Train your ears with audio exercises</div>
          </div>
          <div className="hero-feature">
            <span className="feature-icon">🗣️</span>
            <div className="feature-title">Speaking</div>
            <div className="feature-desc">Practice pronunciation with speech AI</div>
          </div>
          <div className="hero-feature">
            <span className="feature-icon">📖</span>
            <div className="feature-title">Reading</div>
            <div className="feature-desc">Understand words, sentences & stories</div>
          </div>
          <div className="hero-feature">
            <span className="feature-icon">✍️</span>
            <div className="feature-title">Writing</div>
            <div className="feature-desc">Type, spell, and compose with feedback</div>
          </div>
        </div>
      </section>

      {/* LSRW Section */}
      <section className="features-section">
        <h2>The LSRW Method ✨</h2>
        <div className="features-grid">
          <div className="card" style={{ borderLeft: '4px solid var(--listening)' }}>
            <h3>🎧 Listen First</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Just like babies learn by hearing, you start by listening to words, phrases, and conversations.
              Pick the right picture, fill in gaps, and train your ears!
            </p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--speaking)' }}>
            <h3>🗣️ Then Speak</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Repeat what you hear! Our speech recognition listens to your pronunciation
              and gives you instant feedback. No more shy speaking!
            </p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--reading)' }}>
            <h3>📖 Now Read</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Read words, sentences, and short stories. Answer questions, match meanings,
              and build your vocabulary step by step.
            </p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--writing)' }}>
            <h3>✍️ Finally Write</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Type words, complete sentences, and write short descriptions.
              Letter-by-letter feedback ensures you learn correct spelling!
            </p>
          </div>
        </div>
      </section>

      {/* CEFR Levels */}
      <section className="cefr-section">
        <h2>CEFR Proficiency Levels</h2>
        <p className="cefr-desc">
          Our curriculum follows the Common European Framework of Reference for Languages,
          the international standard for language proficiency.
        </p>
        <div className="cefr-levels">
          <div className="cefr-card" style={{ borderTop: '3px solid var(--primary)' }}>
            <span className="badge badge-a1" style={{ marginBottom: '0.8rem', display: 'inline-block' }}>A1 — Beginner</span>
            <h3>Breakthrough</h3>
            <p>
              Learn greetings, numbers, colors, family & animals.
              Understand simple sentences and introduce yourself.
              Start your language journey here!
            </p>
          </div>
          <div className="cefr-card" style={{ borderTop: '3px solid var(--success)' }}>
            <span className="badge badge-a2" style={{ marginBottom: '0.8rem', display: 'inline-block' }}>A2 — Elementary</span>
            <h3>Waystage</h3>
            <p>
              Talk about daily routines, weather, shopping & directions.
              Read short stories, menus & messages.
              Write descriptions and short messages.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to Spark Your Language Skills? ⚡</h2>
        <p>Join thousands of learners on their language adventure!</p>
        <Link href="/register" className="btn btn-primary btn-large">
          🎯 Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 LingoSpark. Made with ❤️ for language learners everywhere.</p>
      </footer>
    </main>
  );
}
