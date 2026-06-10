import React from 'react';
import { Link } from 'react-router-dom';
import '../css/LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-background">
        <div className="landing-circle-1"></div>
        <div className="landing-circle-2"></div>
      </div>

      <nav className="landing-nav">
        <div className="landing-logo">Edugram</div>
        <div className="landing-nav-links">
          <Link to="/signin" className="landing-login-btn">Log In</Link>
          <Link to="/signup" className="landing-signup-btn">Sign Up</Link>
        </div>
      </nav>

      <main className="landing-hero">
        <div className="landing-hero-badge">Social Learning Platform</div>
        <h1>
          Learn, Share, and <span className="gradient-text">Grow Together</span>
        </h1>
        <p>
          Edugram is the ultimate campus-first social network. Connect with students and teachers, share knowledge, and elevate your learning experience in a beautifully designed space.
        </p>
        <div className="landing-hero-cta">
          <Link to="/signup" className="cta-primary">Get Started Now</Link>
          <Link to="/signin" className="cta-secondary">I already have an account</Link>
        </div>
      </main>

      <section className="landing-features">
        <div className="feature-card">
          <span className="material-symbols-outlined feature-icon">groups</span>
          <h3>Campus Community</h3>
          <p>Build your professional learning network. Connect with peers, mentors, and educators from your institution.</p>
        </div>
        <div className="feature-card">
          <span className="material-symbols-outlined feature-icon">forum</span>
          <h3>Engaging Discussions</h3>
          <p>Participate in meaningful conversations. Share your thoughts, ask questions, and collaborate seamlessly.</p>
        </div>
        <div className="feature-card">
          <span className="material-symbols-outlined feature-icon">palette</span>
          <h3>Premium Experience</h3>
          <p>Enjoy a stunning, dark-mode first interface designed to reduce eye strain and keep you focused on what matters.</p>
        </div>
      </section>
    </div>
  );
}
