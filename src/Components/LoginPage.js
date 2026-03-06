import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/loginBackground.jpg';
import './LoginPage.css'; // Import the new CSS file

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    // Clear fields when toggling
    setEmail('');
    setPassword('');
    setUsername('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        if (email && password) {
          console.log('Login logic here');
          navigate('/chat');
        } else {
          setError('Please enter your credentials');
        }
      } else {
        if (username && email && password && confirmPassword) {
          if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
          }
          console.log('Signup logic here');
          navigate('/chat');
        } else {
          setError('Please fill in all fields');
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      {/* Background with overlay */}
      <img src={backgroundImage} className="login-bg-image" alt="Mentora" />
      <div className="login-overlay"></div>

      <main className="login-content">
        <div className="login-card">
          <h2 className="login-title">{isLogin ? 'Welcome Back' : 'Get Started'}</h2>
          <p className="login-subtitle">
            {isLogin ? 'Continue your wellness journey with Mentora.Ai' : 'Join Mentora for personalized mental well-being support.'}
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            {!isLogin && (
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="login-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}

            <div className="input-group">
              <input
                type="email"
                placeholder="Email Address"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {!isLogin && (
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="login-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            <button type="submit" className="login-submit-btn">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="login-separator">
            <span>OR</span>
          </div>

          <button className="google-btn">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <button onClick={toggleForm} className="toggle-form-btn">
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

