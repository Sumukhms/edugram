import React from 'react';
import { Link } from 'react-router-dom';
import '../css/LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-background"></div>

      <nav className="landing-nav">
        <div className="landing-logo">Edugram</div>
        <div className="landing-nav-links">
          <Link to="/signin" className="landing-login-btn">Sign In</Link>
          <Link to="/signup" className="landing-signup-btn">Create Account</Link>
        </div>
      </nav>

      <main className="landing-hero">
        <div className="landing-hero-badge">Social Learning Platform</div>
        <h1>
          Elevate Your Academic <span className="gradient-text">Network</span>
        </h1>
        <p>
          Edugram is a prestigious community for students and educators. Connect with your peers, share knowledge, and cultivate your academic journey in a focused environment.
        </p>
        <div className="landing-hero-cta">
          <Link to="/signup" className="cta-primary">Join the Community</Link>
          <Link to="/signin" className="cta-secondary">Sign in to Account</Link>
        </div>
      </main>

      <section className="landing-features">
        <div className="feature-card">
          <span className="material-symbols-outlined feature-icon">account_balance</span>
          <h3>Campus Connectivity</h3>
          <p>Build a robust professional network with fellow students and distinguished educators from your institution.</p>
        </div>
        <div className="feature-card">
          <span className="material-symbols-outlined feature-icon">auto_stories</span>
          <h3>Scholarly Discussions</h3>
          <p>Engage in profound intellectual discourse. Share insights, debate ideas, and expand your perspective seamlessly.</p>
        </div>
        <div className="feature-card">
          <span className="material-symbols-outlined feature-icon">workspace_premium</span>
          <h3>Focused Excellence</h3>
          <p>Experience a sophisticated, distraction-free environment designed to enhance concentration and academic productivity.</p>
        </div>
      </section>
    </div>
  );
}
