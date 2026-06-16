import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { FaEnvelope, FaLock, FaUser, FaArrowRight, FaEye, FaEyeSlash, FaHome, FaShieldAlt } from 'react-icons/fa';
import logo from '../../assets/monogram.png';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, sendRegisterOTP, verifyRegisterOTP, loginWithGoogle, loading, error: authError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [otpPending, setOtpPending] = useState(false); // show OTP screen
  const [pendingEmail, setPendingEmail] = useState(''); // email waiting for verification
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

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
        // Send OTP — don't create account yet
        await sendRegisterOTP({
          email,
          password,
          username,
          name: username
        });
        setPendingEmail(email);
        setOtpPending(true);
      } else {
        await login({ email, password });
        navigate('/chat/discover');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  // Handle OTP digit input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1); // one char max
    setOtpDigits(newDigits);
    // Auto-focus next box
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''));
      otpRefs[5].current?.focus();
    }
    e.preventDefault();
  };

  const handleVerifyOTP = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) { setError('Please enter all 6 digits'); return; }
    try {
      setError('');
      await verifyRegisterOTP(pendingEmail, code);
      navigate('/chat/discover');
    } catch (err) {
      setError(err.message || 'Invalid code');
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs[0].current?.focus();
    }
  };

  const handleResendOTP = async () => {
    try {
      setError('');
      await sendRegisterOTP({ email, password, username, name: username });
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs[0].current?.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    }
  };

  // Display auth error from context or local error
  const displayError = error || authError;

  // ── OTP Verification Screen ───────────────────────────────────────────
  if (otpPending) {
    return (
      <div className="auth-fullscreen">
        <div className="mesh-gradient"></div>
        <button className="auth-home-button" onClick={() => { setOtpPending(false); setOtpDigits(['','','','','','']); }} aria-label="Go back">
          ← Back
        </button>

        <div className="otp-card">
          <div className="otp-card-header">
            <div className="otp-shield-icon"><FaShieldAlt /></div>
            <h2>Check your email</h2>
            <p>We sent a 6-digit code to</p>
            <strong className="otp-email">{pendingEmail}</strong>
          </div>

          <div className="otp-digits-row" onPaste={handleOtpPaste}>
            {otpDigits.map((digit, i) => (
              <input
                key={i}
                ref={otpRefs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                className={`otp-digit-input ${digit ? 'filled' : ''}`}
                disabled={loading}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {displayError && <div className="auth-mini-error" style={{ maxWidth: '320px', margin: '0 auto' }}>{displayError}</div>}

          <button className="prime-btn otp-verify-btn" onClick={handleVerifyOTP} disabled={loading || otpDigits.join('').length < 6}>
            {loading ? <span className="loader"></span> : <>Verify & Create Account <FaArrowRight /></>}
          </button>

          <div className="otp-resend-row">
            <span>Didn't receive it?</span>
            <button type="button" className="otp-resend-btn" onClick={handleResendOTP} disabled={loading}>
              Resend code
            </button>
          </div>

          <p className="otp-expiry-note">Code expires in 10 minutes</p>
        </div>

        <div className="auth-footer-minimal">&copy; 2026 Mentora.Ai • Your Safe Space</div>
      </div>
    );
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError('');
      await loginWithGoogle(credentialResponse.credential);
      navigate('/chat/discover');
    } catch (err) {
      setError(err.message || 'Google login failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in failed. Please try again or use email/password.');
  };

  return (
    <div className="auth-fullscreen">
      {/* Immersive Background */}
      <div className="mesh-gradient"></div>
      <div className="floating-particles">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>

      <button className="auth-home-button" type="button" onClick={() => navigate('/')}
        aria-label="Go to home">
        <FaHome />
      </button>
      <div className={`auth-card-wrapper ${isSignUp ? 'sign-up-mode' : ''}`}>
        <div className="forms-container">
          <div className="signin-signup">
            {/* SIGN IN FORM */}
            <form className="sign-in-form" onSubmit={handleSubmit}>
              <div className="auth-logo-header">
                <img src={logo} alt="Mentora" className="auth-logo-img" />
                <span className="auth-logo-text">Mentora</span>
              </div>
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
                <div className="google-btn-wrapper">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    theme="filled_black"
                    shape="pill"
                    size="large"
                    text="continue_with"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mobile-toggle">
                <span>Don't have an account?</span>
                <button type="button" onClick={toggleMode} disabled={loading}>Sign Up</button>
              </div>
            </form>

            {/* SIGN UP FORM */}
            <form className="sign-up-form" onSubmit={handleSubmit}>
              <div className="auth-logo-header">
                <img src={logo} alt="Mentora" className="auth-logo-img" />
                <span className="auth-logo-text">Mentora</span>
              </div>
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

              <div className="social-login">
                <p>Or sign up with</p>
                <div className="google-btn-wrapper">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    theme="filled_black"
                    shape="pill"
                    size="large"
                    text="signup_with"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mobile-toggle">
                <span>Already have an account?</span>
                <button type="button" onClick={toggleMode} disabled={loading}>Sign In</button>
              </div>
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
