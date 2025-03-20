import React, { useState } from 'react';
import Chat from "../Components/chat";

const ChatInterface = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleProfileAction = (action) => {
    console.log(action);
    setShowProfileMenu(false);
  };

  const styles = {
    chatContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100vw',  // Ensures full width
      height: '100vh',
      backgroundColor: '#141414',
      color: '#fff',
      overflow: 'hidden',
      textAlign: 'center',
      boxSizing: 'border-box',
    },
    headerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: '10px 20px',
      position: 'absolute',
      top: 0,
      left: '50%',  // Center the header
      transform: 'translateX(-50%)',
      backgroundColor: 'transparent',
      boxSizing: 'border-box',
    },
    heading: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '10px',
      opacity: 0,
      animation: 'slideIn 1s ease-in-out forwards',
    },
    subheading: {
      fontSize: '40px',
      fontWeight: 'bold',
      color: '#00AEEF',
      opacity: 0,
      animation: 'slideIn 1.5s ease-in-out forwards',
    },
    profileIcon: {
      cursor: 'pointer',
      position: 'relative',
      fontSize: '18px',
      fontWeight: 'bold',
      backgroundColor: '#00AEEF',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: '50%',
    },
    profileMenu: {
      position: 'absolute',
      right: 0,
      top: '30px',
      backgroundColor: '#222',
      color: '#fff',
      borderRadius: '5px',
      boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
      zIndex: 10,
    },
    profileMenuItem: {
      padding: '10px 15px',
      cursor: 'pointer',
      borderBottom: '1px solid #444',
    },
  };

  return (
    <div style={styles.chatContainer}>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateY(-20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>

      <div style={styles.headerContainer}>
        <div style={styles.profileIcon} onClick={toggleProfileMenu}>
          P
          {showProfileMenu && (
            <div style={styles.profileMenu}>
              <div style={styles.profileMenuItem} onClick={() => handleProfileAction('Profile')}>Profile</div>
              <div style={styles.profileMenuItem} onClick={() => handleProfileAction('Settings')}>Settings</div>
              <div style={styles.profileMenuItem} onClick={() => handleProfileAction('Logout')}>Logout</div>
            </div>
          )}
        </div>
      </div>

      <div style={styles.heading}>Here is your perfect Chat partner</div>
      <div style={styles.subheading}>Mentora</div>

      <Chat />
    </div>
  );
};

export default ChatInterface;
