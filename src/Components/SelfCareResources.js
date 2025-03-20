import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import sleepImage from '../assets/sleep.jpg';
import playImage from '../assets/Play.jpg';
import creativeImage from '../assets/creative.jpg';
import meditationImage from '../assets/meditation.jpg';
import exerciseImage from '../assets/exercise.jpg';
import readingImage from '../assets/reading.jpg';

const SelfCareResources = () => {
  const [activeActivity, setActiveActivity] = useState(null); // Track which modal is open
  const [timeLeft, setTimeLeft] = useState(300); // Timer in seconds (5 minutes = 300 seconds)
  const [inputText, setInputText] = useState(''); // State for input fields
  const navigate = useNavigate(); // Hook for navigation

  const handleCardClick = (activity) => {
    setActiveActivity(activity);
    setTimeLeft(300); // Reset to 5 minutes whenever the modal opens
  };

  const closeModal = () => {
    setActiveActivity(null); // Close the modal
    setTimeLeft(300); // Reset timer when modal closes
    setInputText(''); // Clear input when modal closes
  };

  // Timer effect
  useEffect(() => {
    if (!activeActivity || activeActivity === 'Sleep Support Tools') return; // Stop timer for sleep modal or when modal is closed
    if (timeLeft <= 0) return; // Stop timer when countdown reaches 0

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId); // Cleanup timer on component unmount
  }, [activeActivity, timeLeft]);

  // Function to format time as MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Inline styling for cards
  const cardStyle = {
    backgroundColor: '#1c1c1e',
    color: '#fff',
    borderRadius: '8px',
    padding: '20px',
    margin: '10px',
    textAlign: 'center',
    flex: 1,
    cursor: 'pointer',
  };

  const inputStyle = {
    marginTop: '10px',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid transparent', // Make border transparent
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent background
    width: '80%',
    color: '#fff', // Text color
  };

  // Styles for free-time preference cards with image, heading, and quote
  const freeTimeCardStyle = {
    backgroundColor: '#2a2a2a', // Dim black background
    color: '#fff',
    borderRadius: '8px',
    width: '200px',
    height: '280px',
    margin: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    textAlign: 'center',
    padding: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', // Add subtle shadow
    cursor: 'pointer',
  };
  
  const imageStyle = {
    width: '80%',
    height: '120px',
    borderRadius: '8px',
    objectFit: 'cover', // Ensure image is not distorted
  };
  
  const quoteStyle = {
    fontStyle: 'italic',
    fontSize: '0.9em',
    color: '#ccc',
  };
  



  return (
    <div style={{ backgroundColor: '#000', padding: '20px', minHeight: '100vh' }}>
      <h1 style={{ color: '#fff' }}>Self-Care Resources</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Guided Meditation Card */}
        <div style={cardStyle} onClick={() => handleCardClick('Guided Meditation')}>
          <span role="img" aria-label="meditation" style={{ fontSize: '2em' }}>🧘</span>
          <h2>Guided Meditation</h2>
        </div>

        {/* Grounding Techniques Card */}
        <div style={cardStyle} onClick={() => handleCardClick('Grounding Techniques')}>
          <span role="img" aria-label="grounding" style={{ fontSize: '2em' }}>🌱</span>
          <h2>Grounding Techniques</h2>
        </div>

        {/* Sleep Support Tools Card */}
        <div style={cardStyle} onClick={() => handleCardClick('Sleep Support Tools')}>
          <span role="img" aria-label="sleep" style={{ fontSize: '2em' }}>💤</span>
          <h2>Sleep Support Tools</h2>
        </div>

        {/* Creative Expression Card */}
        <div style={cardStyle} onClick={() => handleCardClick('Creative Expression')}>
          <span role="img" aria-label="creativity" style={{ fontSize: '2em' }}>🎨</span>
          <h2>Creative Expression</h2>
        </div>
      </div>

      {/* Heading for free-time preference */}
      <h2 style={{ color: '#fff', textAlign: 'center', marginTop: '30px' }}>WHAT YOU PREFER TO DO IN FREE TIME</h2>

      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Free-time preference cards */}
        <div style={freeTimeCardStyle}>
          <img src={sleepImage} alt="Sleep" style={imageStyle} />
          <h3>SLEEP</h3>
          <p style={quoteStyle}>"Rest and recharge."</p>
        </div>
        <div style={freeTimeCardStyle}>
          <img src={playImage} alt="Play" style={imageStyle} />
          <h3>PLAY</h3>
          <p style={quoteStyle}>"Find joy in the little things."</p>
        </div>
        <div style={freeTimeCardStyle}>
          <img src={creativeImage} alt="Creative Activities" style={imageStyle} />
          <h3>Creative Activities</h3>
          <p style={quoteStyle}>"Express your inner artist."</p>
        </div>
        <div style={freeTimeCardStyle}>
          <img src={meditationImage} alt="Meditation" style={imageStyle} />
          <h3>Meditation</h3>
          <p style={quoteStyle}>"Find peace within."</p>
        </div>
        <div style={freeTimeCardStyle}>
          <img src={exerciseImage} alt="Exercise" style={imageStyle} />
          <h3>Exercise</h3>
          <p style={quoteStyle}>"Stay strong, stay healthy."</p>
        </div>
        <div style={freeTimeCardStyle}>
          <img src={readingImage} alt="Reading" style={imageStyle} />
          <h3>Reading</h3>
          <p style={quoteStyle}>"Explore new worlds in words."</p>
        </div>
      </div>


      {/* Modal for activities */}
      {activeActivity && (
        <div style={modalOverlayStyle} onClick={closeModal}>
          <div style={modalStyle} className="flip-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{activeActivity}</h2>
            {activeActivity === 'Guided Meditation' && (
              <p>Take a 5-minute break to meditate with soothing music.</p>
            )}
            {activeActivity === 'Grounding Techniques' && (
              <>
                <p>"Calmness is a superpower. The ability to not overreact or take things personally keeps your mind clear and your heart at peace."</p>
                <button onClick={() => navigate('/question-ans')} style={quizButtonStyle}>Start Quiz</button>
              </>
            )}
            {activeActivity === 'Sleep Support Tools' && (
              <>
                <h2>TRACK YOUR EVERYDAY SLEEP WITH US</h2>
                <p>Don’t give up on your dreams so soon, sleep longer</p>
                <button onClick={() => navigate('/sleeptool')} style={arrowButtonStyle}>→</button>
              </>
            )}
            {activeActivity === 'Creative Expression' && (
              <>
                <h2>LETS CREATE SOMETHING</h2>
                <p>lets see what you up too!!</p>
                <button onClick={() => navigate('/creative')} style={arrowButtonStyle}>Lets Go</button>
              </>
            )}
            {activeActivity !== 'Creative Expression' && activeActivity !== 'Grounding Techniques' && activeActivity !== 'Sleep Support Tools' && (
              <div style={timerCircleStyle}>
                <span style={timerTextStyle}>{formatTime(timeLeft)}</span>
              </div>
            )}
            {activeActivity !== 'Creative Expression' && activeActivity !== 'Grounding Techniques' && activeActivity !== 'Sleep Support Tools' && (
              <div style={musicIconStyle}>🎶</div> // Music icon placeholder
            )}
            {activeActivity !== 'Creative Expression' && activeActivity !== 'Grounding Techniques' && activeActivity !== 'Sleep Support Tools' && (
              <input
                type="text"
                placeholder={`Share your thoughts on ${activeActivity}`}
                style={inputStyle}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            )}
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>
        {`
          .flip-modal {
            animation: flip 1s ease-out;
          }

          @keyframes flip {
            0% {
              transform: perspective(600px) rotateY(90deg);
              opacity: 0;
            }
            100% {
              transform: perspective(600px) rotateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

// Styles for modal and icons
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: '#1c1c1e',
  color: '#fff',
  padding: '30px',
  borderRadius: '8px',
  maxWidth: '300px',
  textAlign: 'center',
};

const timerCircleStyle = {
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  backgroundColor: '#333',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '20px auto',
};

const timerTextStyle = {
  fontSize: '1.5em',
  color: '#fff',
};

const musicIconStyle = {
  fontSize: '2em',
  cursor: 'pointer',
};

const quizButtonStyle = {
  backgroundColor: '#4caf50',
  color: '#fff',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '15px',
};

const arrowButtonStyle = {
  backgroundColor: '#4caf50',
  color: '#fff',
  padding: '20px',
  borderRadius: '50%',
  fontSize: '1.5em',
  cursor: 'pointer',
  border: 'none',
  marginTop: '20px',
};

export default SelfCareResources;
