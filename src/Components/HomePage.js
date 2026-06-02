import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/monogram.png';
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
    <div className={`anime-hero-page ${loaded ? 'loaded' : ''}`}>
      {/* Top Navigation */}
      <nav className="anime-nav">
        <div className="anime-logo">
          <img src={logo} alt="Mentora" className="anime-logo-img" />
          <span>MENTORA.AI</span>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="anime-hero-content">
        <div className="anime-hero-left">
          <span className="anime-subtitle">AI MENTAL WELLNESS</span>
          <h1 className="anime-title">MENTORA</h1>
          <p className="anime-desc">
            Unleash your inner strength and find clarity with your 
            personal AI guardian. Step into your safe space today.
          </p>
          <div className="anime-actions">
            <button className="anime-btn-prime" onClick={() => navigate('/login')}>
              GET STARTED
            </button>
            <button className="anime-btn-ghost" onClick={handleGuestLogin}>
              TRY GUEST ACCESS
            </button>
          </div>
        </div>

        <div className="anime-hero-right">
          <div className="anime-character-circle"></div>
          <img src={require('../assets/hero-cinematic.png')} alt="Hero" className="anime-hero-img" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
