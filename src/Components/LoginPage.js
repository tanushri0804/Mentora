import React, { useState } from 'react';
import { auth } from '../firebase/firebase'; // Adjust the path as needed
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import backgroundImage from '../assets/loginBackground.jpg'; // Ensure the correct path for your image

const LoginPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate for navigation
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [email, setEmail] = useState(''); // State for email
  const [password, setPassword] = useState(''); // State for password
  const [username, setUsername] = useState(''); // State for username
  const [error, setError] = useState(''); // State for error messages

  const toggleForm = () => {
    setIsLogin(!isLogin); // Switch between login and signup forms
    setError(''); // Clear error message when toggling forms
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission

    try {
      if (isLogin) {
        // Handle login
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/chat'); // Redirect to ChatInterface.js after successful login
      } else {
        // Handle signup
        await createUserWithEmailAndPassword(auth, email, password);
        navigate('/chat'); // Redirect to ChatInterface.js after successful signup
      }
    } catch (error) {
      setError(error.message); // Set error message to state
    }
  };

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'flex-end', // Align to the right
      height: '100vh',
      width: '100%',
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    rightSide: {
      width: '40%', // Adjust width as needed
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dialogBox: {
      width: '400px',
      padding: '30px',
      backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent background for the box
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)', // Glass effect
    },
    toggleButton: {
      display: 'block',
      margin: '20px auto 0',
      padding: '10px 20px',
      backgroundColor: 'transparent',
      color: '#ffff',
      textDecoration: 'underline', // Make it look like a link
      border: 'none',
      cursor: 'pointer',
    },
    formTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      textAlign: 'center',
    },
    input: {
      width: '100%',
      padding: '10px',
      margin: '10px 0',
      borderRadius: '5px',
      border: '1px solid #ccc',
    },
    submitButton: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#264653',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '20px',
    },
    googleButton: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#DB4437', // Google red color
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '10px',
    },
    orText: {
      textAlign: 'center',
      margin: '10px 0',
      color: '#ffff',
    },
    errorText: {
      color: 'red',
      textAlign: 'center',
      margin: '10px 0',
    },
  };

  return (
    <div style={styles.container}>
      {/* Right side with login/signup dialog */}
      <div style={styles.rightSide}>
        <div style={styles.dialogBox}>
          <h2 style={styles.formTitle}>{isLogin ? 'Login' : 'Sign Up'}</h2>

          {/* Display error message if any */}
          {error && <div style={styles.errorText}>{error}</div>}

          {/* Form inputs */}
          <input
            type="text"
            placeholder={isLogin ? 'Enter your email' : 'Create a username'}
            style={styles.input}
            value={isLogin ? email : username}
            onChange={(e) => isLogin ? setEmail(e.target.value) : setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter your password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {!isLogin && (
            <input
              type="email" // Change type to email for signup
              placeholder="Enter your email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update email state
            />
          )}
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm your password"
              style={styles.input}
            />
          )}
          <button style={styles.submitButton} onClick={handleSubmit}>
            {isLogin ? 'Login' : 'Sign Up'}
          </button>

          {/* OR separator */}
          <div style={styles.orText}>OR</div>

          {/* Google login button */}
          <button style={styles.googleButton}>Login with Google</button>

          {/* Toggle between login and sign up */}
          <button onClick={toggleForm} style={styles.toggleButton}>
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
