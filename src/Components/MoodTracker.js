import React, { useState } from "react";

const Home = () => {
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [mood, setMood] = useState("");
  const [showTips, setShowTips] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const [isMoodBoostModalOpen, setIsMoodBoostModalOpen] = useState(false);
  const [isTicTacToeOpen, setIsTicTacToeOpen] = useState(false);
  const [ticTacToeBoard, setTicTacToeBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);


  const moodTips = {
    Bad: [
      "Take a deep breath and try a short mindfulness exercise.",
      "Consider taking a walk outside to clear your mind.",
      "Talk to someone you trust about how you're feeling.",
    ],
    Neutral: [
      "Try some light stretching or yoga to relieve tension.",
      "Take a few minutes to focus on your breathing.",
    ],
    Good: ["You're doing amazing! Keep up the positive vibes!"],
  };

  const quizQuestions = [
    {
      question: "Over the last two weeks, have you been feeling down, depressed, irritable, or hopeless?",
      options: [
        { text: "Not at all", score: 3 },
        { text: "Sometimes", score: 2 },
        { text: "Frequently", score: 1 },
      ],
    },
    {
      question: "Over the last two weeks, have you had little interest or pleasure in doing things?",
      options: [
        { text: "Not at all", score: 3 },
        { text: "Sometimes", score: 2 },
        { text: "Frequently", score: 1 },
      ],
    },
    {
      question: "Have you had poor appetite, weight loss, or have you been overeating?",
      options: [
        { text: "Not at all", score: 3 },
        { text: "Sometimes", score: 2 },
        { text: "Frequently", score: 1 },
      ],
    },
    {
      question: "How have you been feeling recently?",
      options: [
        { text: "Great", score: 3 },
        { text: "Okay", score: 2 },
        { text: "Not great", score: 1 },
      ],
    },
    {
      question: "Are you feeling low in energy?",
      options: [
        { text: "Not at all", score: 3 },
        { text: "Sometimes", score: 2 },
        { text: "Frequently", score: 1 },
      ],
    },
    {
      question: "How well did you sleep last night?",
      options: [
        { text: "Great! I feel rested", score: 3 },
        { text: "It was alright", score: 2 },
        { text: "Not good at all", score: 1 },
      ],
    },
    {
      question: "Are you able to focus on tasks?",
      options: [
        { text: "Yes, I'm very focused", score: 3 },
        { text: "Sometimes, but I get distracted", score: 2 },
        { text: "No, I can't focus", score: 1 },
      ],
    },
  ];
// daily quote
const quotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Life is what happens when you're busy making other plans. - John Lennon",
  "Get busy living or get busy dying. - Stephen King",
  "You have within you right now, everything you need to deal with whatever the world can throw at you. - Brian Tracy",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "It does not matter how slowly you go as long as you do not stop. - Confucius",
  "Act as if what you do makes a difference. It does. - William James",
];
const openQuoteModal = () => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  setCurrentQuote(quotes[randomIndex]);
  setIsQuoteModalOpen(true);
};

const closeQuoteModal = () => {
  setIsQuoteModalOpen(false);
};
const openMoodBoostModal = () => {
  setIsMoodBoostModalOpen(true);
};

const closeMoodBoostModal = () => {
  setIsMoodBoostModalOpen(false);
  setTicTacToeBoard(Array(9).fill(null)); // Reset the board
  setWinner(null); // Reset the winner
  setIsXNext(true); // Reset to player X
};

const handlePlayTicTacToe = () => {
  setIsTicTacToeOpen(true); // Open the Tic Tac Toe modal
  closeMoodBoostModal(); // Close the mood boost modal
};


  const handleQuizOptionClick = (score) => {
    setQuizScore(quizScore + score);
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      const calculatedMood = calculateMood(quizScore + score);
      setMood(calculatedMood);
      setShowTips(true);
    }
  };

  const calculateMood = (score) => {
    if (score >= 13) return "Good";
    if (score >= 9) return "Neutral";
    return "Bad";
  };

  const restartQuiz = () => {
    setQuizScore(0);
    setQuizStep(0);
    setMood("");
    setShowTips(false);
  };

  const closeModal = () => {
    setShowQuizModal(false);
    restartQuiz();
  };
 
  const features = [
  {
    title: "Mood Tracker",
    onClick: () => setShowQuizModal(true),
    icon: "😊",
  },
  {
    title: "Mood Insights",
    onClick: () => alert("Navigate to Mood Insights"),
    icon: "📊",
  },
  {
    title: "Boost Your Mood",
    onClick: openMoodBoostModal,
    icon: "🌈",
  },
  {
    title: "Daily Quote",
    onClick: openQuoteModal,
    icon: "🌟",
  },
];

const handleSquareClick = (index) => {
  if (ticTacToeBoard[index] || winner) {
    return; // Exit if the square is filled or there's a winner
  }

  const newBoard = ticTacToeBoard.slice();
  newBoard[index] = isXNext ? "X" : "O"; // Set the current player's mark
  setTicTacToeBoard(newBoard); // Update the state
  const currentWinner = calculateWinner(newBoard);
  setWinner(currentWinner); // Set the winner
  setIsXNext(false); // Switch turns to CPU

  if (!currentWinner) {
    setTimeout(cPUPlay, 500); // Delay CPU move for better UX
  }
};

const cPUPlay = () => {
  const emptyIndexes = ticTacToeBoard.map((value, index) => (value === null ? index : null)).filter(index => index !== null);
  const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];

  const newBoard = ticTacToeBoard.slice();
  newBoard[randomIndex] = "O"; // CPU plays 'O'
  setTicTacToeBoard(newBoard);
  const currentWinner = calculateWinner(newBoard);
  setWinner(currentWinner); // Set the winner
  setIsXNext(true); // Switch turns back to player
};

const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]; // Return the winner
    }
  }
  return null; // No winner
};

const renderSquare = (index) => {
  return (
    <button
      style={styles.square}
      onClick={() => handleSquareClick(index)}
    >
      {ticTacToeBoard[index]}
    </button>
  );
};


  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mood Tracker</h1>
      <div style={styles.cardContainer}>
        {features.map((feature, index) => (
          <div
            key={index}
            style={styles.card}
            onClick={feature.onClick}
            className="card"
          >
            <div style={styles.icon}>{feature.icon}</div>
            <h2 style={styles.cardTitle}>{feature.title}</h2>
          </div>
        ))}
      </div>
         {/* Daily Quote Modal */}
    {isQuoteModalOpen && (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <h2>Daily Quote</h2>
          <p>{currentQuote}</p>
          <button onClick={closeQuoteModal} style={styles.quizButton}>
            Close
          </button>
        </div>
      </div>
    )}
     {/* Daily Quote Modal */}
     {isQuoteModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>Daily Quote</h2>
            <p>{currentQuote}</p>
            <button onClick={closeQuoteModal} style={styles.quizButton}>
              Close
            </button>
          </div>
        </div>
      )}
      {/* Quiz Modal */}
      {showQuizModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            {showTips ? (
              <div style={styles.resultsContainer}>
                <h2 style={styles.moodResult}>Your Mood: {mood}</h2>
                {mood === "Good" ? (
                  <h3 style={styles.tipHeader}>Keep it up! You're doing great!</h3>
                ) : (
                  <>
                    <h3 style={styles.tipHeader}>Tips to Improve Your Mood:</h3>
                    <ul style={styles.tipList}>
                      {moodTips[mood].map((tip, index) => (
                        <li key={index} style={styles.tipItem}>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <button style={styles.quizButton} onClick={closeModal}>
                  Close
                </button>
              </div>
            ) : (
              <>
            
                <h2 style={styles.quizQuestion}>
                  {quizQuestions[quizStep].question}
                </h2>
                <div style={styles.quizOptions}>
                  {quizQuestions[quizStep].options.map((option, index) => (
                    <button
                      key={index}
                      style={styles.quizButton}
                      onClick={() => handleQuizOptionClick(option.score)}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>

                <div style={styles.navigationButtons}>
                  {quizStep > 0 && (
                    <button
                      style={styles.navigationButton}
                      onClick={() => setQuizStep(quizStep - 1)}
                    >
                      Previous
                    </button>
                  )}
                  <button
                    style={styles.navigationButton}
                    onClick={() => setQuizStep(quizStep + 1)}
                    disabled={quizStep === quizQuestions.length - 1}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Mood Boost Modal */}
      {isMoodBoostModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>How do you want to boost your mood?</h2>
            <div style={styles.moodBoostOptions}>
              <button 
                onClick={handlePlayTicTacToe} 
                style={styles.moodBoostButton}
              >
                <span style={styles.icon}>🎮</span> Play Tic Tac Toe
              </button>
              <button 
                onClick={() => alert("Rock Paper Scissors coming soon!")} 
                style={styles.moodBoostButton}
              >
                <span style={styles.icon}>🎵</span> Play Rock Paper Scissors
              </button>
              <button 
                onClick={() => alert("Jumbled Words coming soon!")} 
                style={styles.moodBoostButton}
              >
                <span style={styles.icon}>🚶‍♂️</span> Play Jumbled Words
              </button>
            </div>
            <button onClick={closeMoodBoostModal} style={styles.closeButton}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Tic Tac Toe Modal */}
      {isTicTacToeOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>Tic Tac Toe</h2>
            <div style={styles.ticTacToeBoard}>
              {ticTacToeBoard.map((square, index) => renderSquare(index))}
            </div>
            {winner && <h3>Winner: {winner}</h3>}
            <button onClick={closeMoodBoostModal} style={styles.closeButton}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

      <style>
        {`
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
    

const styles = {
  container: {
    backgroundColor: "#121212",
    color: "#ffffff",
    minHeight: "100vh",
    padding: "20px",
    textAlign: "center",
    fontFamily: "'Poppins', sans-serif",
  },
  title: {
    marginBottom: "20px",
    fontSize: "2rem",
    letterSpacing: "2px",
  },
  cardContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap",
  },
  card: {
    flex: "1 1 calc(15% - 10px)",
    backgroundColor: "#333333",
    borderRadius: "10px",
    padding: "20px",
    cursor: "pointer",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  icon: {
    fontSize: "2.5rem",
    marginBottom: "10px",
  },
  cardTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    perspective: "1000px", /* Enabling 3D space */
  },
  modalContent: {
    backgroundColor: "#222222",
    color: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "500px",
    textAlign: "center",
    animation: "flip 0.6s ease-out",
    transformStyle: "preserve-3d",
  },
  quizButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "12px 20px",
    border: "none",
    borderRadius: "5px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  quizQuestion: {
    fontSize: "1.5rem",
    marginBottom: "20px",
  },
  quizOptions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  navigationButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  navigationButton: {
    backgroundColor: "#888888",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  resultsContainer: {
    textAlign: "center",
  },
  moodBoostOptions: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "15px",
    marginBottom: "20px",
  },
  moodBoostButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "15px",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.3s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  closeButton: {
    backgroundColor: "#f44336",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  ticTacToeBoard: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginTop: "20px",
  },
  moodResult: {
    fontSize: "2rem",
    fontWeight: "bold",
  },
  tipHeader: {
    fontSize: "1.2rem",
    marginTop: "20px",
  },
  tipList: {
    listStyle: "none",
    padding: 0,
  },
  tipItem: {
    marginBottom: "10px",
  },
  square: {
    width: "60px",
    height: "60px",
    fontSize: "2rem",
    backgroundColor: "#fff",
    color: "#000",
    border: "2px solid #4CAF50",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.2s",
    ":hover": {
      backgroundColor: "#e0e0e0",
      transform: "scale(1.05)",
    },
  },
  
};

export default Home;
