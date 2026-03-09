import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaUser, FaGoogle, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register, loading, error: authError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const validateForm = () => {
    if (isSignUp) {
      if (!username || !email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }
    } else {
      if (!email || !password) {
        setError('Please fill in all fields');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setError('');
      
      if (isSignUp) {
        // Register new user
        await register({
          email,
          password,
          username,
          name: username
        });
      } else {
        // Login existing user
        await login({
          email,
          password
        });
      }
      
      // Navigate to chat on successful auth
      navigate('/chat/discover');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  // Display auth error from context or local error
  const displayError = error || authError;

  return (
    <div className="auth-fullscreen">
      {/* Immersive Background */}
      <div className="mesh-gradient"></div>
      <div className="floating-particles">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>

      <div className={`auth-card-wrapper ${isSignUp ? 'sign-up-mode' : ''}`}>
        <div className="forms-container">
          <div className="signin-signup">
            {/* SIGN IN FORM */}
            <form className="sign-in-form" onSubmit={handleSubmit}>
              <h2 className="form-title">Welcome Back</h2>
              <p className="form-subtitle">Enter your details to resume your journey.</p>

              <div className="input-row">
                <FaEnvelope className="input-icon" />
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="input-row">
                <FaLock className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="eye-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {displayError && !isSignUp && <div className="auth-mini-error">{displayError}</div>}

              <button type="submit" className="prime-btn" disabled={loading}>
                {loading ? <span className="loader"></span> : <>Sign In <FaArrowRight /></>}
              </button>

              <div className="social-login">
                <p>Or continue with</p>
                <button type="button" className="social-btn" disabled={loading}><FaGoogle /> Google</button>
              </div>
            </form>

            {/* SIGN UP FORM */}
            <form className="sign-up-form" onSubmit={handleSubmit}>
              <h2 className="form-title">Create Account</h2>
              <p className="form-subtitle">Start your path to mental clarity today.</p>

              <div className="input-row">
                <FaUser className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="input-row">
                <FaEnvelope className="input-icon" />
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="input-row">
                <FaLock className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="eye-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="input-row">
                <FaLock className="input-icon" />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Confirm Password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="eye-toggle" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {displayError && isSignUp && <div className="auth-mini-error">{displayError}</div>}

              <button type="submit" className="prime-btn" disabled={loading}>
                {loading ? <span className="loader"></span> : <>Get Started <FaArrowRight /></>}
              </button>
            </form>
          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="panel-content">
              <h3>New to Mentora?</h3>
              <p>Discover a space where your mental health comes first. Join us and start growing.</p>
              <button className="ghost-btn" onClick={toggleMode} disabled={loading}>Sign Up</button>
            </div>
          </div>
          <div className="panel right-panel">
            <div className="panel-content">
              <h3>Already with us?</h3>
              <p>Welcome back! Your safe space is waiting for you. Log in to continue your progress.</p>
              <button className="ghost-btn" onClick={toggleMode} disabled={loading}>Sign In</button>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-footer-minimal">
        &copy; 2026 Mentora.Ai • Your Safe Space
      </div>
    </div>
  );
};

export default LoginPage;
