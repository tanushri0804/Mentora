import React from 'react';
import { useNavigate } from 'react-router-dom'; // Updated from useHistory
import backgroundImage from '../assets/Background.jpg';

const HomePage = () => {
  const navigate = useNavigate(); // Updated from useHistory

  const handleStartChat = () => {
    navigate('/chat'); // Updated from history.push
  };

  const handleLogin = () => {
    navigate('/login'); // Navigate to the login page
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f7fa',
      textAlign: 'center',
      backgroundImage: `url(${backgroundImage})`, // Use backticks for template string
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: '#ffffff', // Text color to stand out against the background
    },
    title: {
      fontSize: '3rem', // Increased font size
      marginBottom: '20px',
    },
    subtitle: {
      fontSize: '1.5rem', // Increased font size
      marginBottom: '40px',
    },
    buttonContainer: {
      display: 'flex',
      gap: '20px',
      flexDirection: 'column', // Stacked buttons
    },
    button: {
      padding: '15px 30px',
      fontSize: '1.2rem', // Increased font size
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    startChatBtn: {
      backgroundColor: '#2a9d8f',
    },
    startChatBtnHover: {
      backgroundColor: '#264653',
    },
    loginBtn: {
      backgroundColor: '#f4a261',
    },
    loginBtnHover: {
      backgroundColor: '#e76f51',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mentora.Ai</h1>
      <p style={styles.subtitle}>
        Your personal support for mental well-being. Let’s talk, or explore self-care resources!
      </p>

      <div style={styles.buttonContainer}>
        <button
          style={{ ...styles.button, ...styles.startChatBtn }}
          onMouseOver={(e) => (e.target.style.backgroundColor = styles.startChatBtnHover.backgroundColor)}
          onMouseOut={(e) => (e.target.style.backgroundColor = styles.startChatBtn.backgroundColor)}
          onClick={handleStartChat}
        >
          Start Chat as Guest
        </button>

        <button
          style={{ ...styles.button, ...styles.loginBtn }}
          onMouseOver={(e) => (e.target.style.backgroundColor = styles.loginBtnHover.backgroundColor)}
          onMouseOut={(e) => (e.target.style.backgroundColor = styles.loginBtn.backgroundColor)}
          onClick={handleLogin} // Updated to navigate to login page
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default HomePage;
