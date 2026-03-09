import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, loading, loginAsGuest, logout } = useAuth();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    
    // If user is already logged in, redirect to chat
    if (user && !loading) {
      navigate('/chat/discover');
    }
  }, [user, loading, navigate]);

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/chat/discover');
  };

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="hero-page">
        <div className="loading-screen">
          <div className="loader"></div>
          <p>Loading Mentora...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`hero-page ${loaded ? 'loaded' : ''}`}>
      {/* Animated background elements */}
      <div className="hero-orb orb-1"></div>
      <div className="hero-orb orb-2"></div>
      <div className="hero-orb orb-3"></div>

      {/* Subtle grid overlay */}
      <div className="hero-grid-overlay"></div>

      {/* Top nav bar */}
      <nav className="hero-nav">
        <div className="hero-logo">
          <span className="logo-icon">✦</span> Mentora
        </div>
      </nav>

      {/* Main hero content - centered */}
      <div className="hero-center">
        <div className="hero-badge">
          <span className="badge-dot"></span> AI-Powered Mental Wellness
        </div>

        <h1 className="hero-heading">
          Your mind deserves<br />
          <span className="hero-heading-accent">a safe space.</span>
        </h1>

        <p className="hero-description">
          Talk, reflect, and heal with Mentora — your personal AI companion
          built for emotional well-being, self-care, and growth.
        </p>

        <div className="hero-actions">
          <button className="hero-btn hero-btn-login" onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="hero-btn hero-btn-guest" onClick={handleGuestLogin}>
            Continue as Guest
            <span className="btn-arrow">→</span>
          </button>
        </div>

        <div className="hero-trust">
          <div className="trust-avatars">
            <div className="trust-avatar" style={{ background: '#2a9d8f' }}>M</div>
            <div className="trust-avatar" style={{ background: '#e07a5f' }}>K</div>
            <div className="trust-avatar" style={{ background: '#457b9d' }}>R</div>
            <div className="trust-avatar" style={{ background: '#ffd166' }}>A</div>
          </div>
          <span className="trust-text">Trusted by <strong>2,000+</strong> users finding clarity</span>
        </div>
      </div>

      {/* Bottom feature pills */}
      <div className="hero-features">
        <div className="feature-pill">
          <span className="feature-icon">💬</span> AI Chat
        </div>
        <div className="feature-pill">
          <span className="feature-icon">📊</span> Mood Tracking
        </div>
        <div className="feature-pill">
          <span className="feature-icon">📖</span> Story Sharing
        </div>
        <div className="feature-pill">
          <span className="feature-icon">🧘</span> Self-Care
        </div>
      </div>
    </div>
  );
};

export default HomePage;
