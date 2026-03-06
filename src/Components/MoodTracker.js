import React, { useState } from "react";
import './MoodTracker.css';

const MoodTracker = () => {
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
  ];

  const quotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Life is what happens when you're busy making other plans. - John Lennon",
    "Get busy living or get busy dying. - Stephen King",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  ];

  const openQuoteModal = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
    setIsQuoteModalOpen(true);
  };

  const handleQuizOptionClick = (score) => {
    const newScore = quizScore + score;
    setQuizScore(newScore);
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      setMood(calculateMood(newScore));
      setShowTips(true);
    }
  };

  const calculateMood = (score) => {
    if (score >= 7) return "Good";
    if (score >= 5) return "Neutral";
    return "Bad";
  };

  const closeModal = () => {
    setShowQuizModal(false);
    setQuizStep(0);
    setQuizScore(0);
    setMood("");
    setShowTips(false);
  };

  const closeMoodBoostModal = () => {
    setIsMoodBoostModalOpen(false);
    setIsTicTacToeOpen(false);
    setTicTacToeBoard(Array(9).fill(null));
    setWinner(null);
  };

  const handleSquareClick = (index) => {
    if (ticTacToeBoard[index] || winner) return;
    const newBoard = ticTacToeBoard.slice();
    newBoard[index] = "X";
    setTicTacToeBoard(newBoard);
    const win = calculateWinner(newBoard);
    if (win) setWinner(win);
    else if (!newBoard.includes(null)) setWinner("Draw");
    else setTimeout(() => cpuMove(newBoard), 500);
  };

  const cpuMove = (board) => {
    const empties = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
    if (empties.length === 0) return;
    const move = empties[Math.floor(Math.random() * empties.length)];
    const newBoard = board.slice();
    newBoard[move] = "O";
    setTicTacToeBoard(newBoard);
    setWinner(calculateWinner(newBoard));
  };

  const calculateWinner = (sq) => {
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (let l of lines) {
      if (sq[l[0]] && sq[l[0]] === sq[l[1]] && sq[l[0]] === sq[l[2]]) return sq[l[0]];
    }
    return null;
  };

  const features = [
    { title: "Mood Tracker", onClick: () => setShowQuizModal(true), icon: "😊" },
    { title: "Daily Quote", onClick: openQuoteModal, icon: "🌟" },
    { title: "Boost Mood", onClick: () => setIsMoodBoostModalOpen(true), icon: "🌈" },
    { title: "Tic Tac Toe", onClick: () => setIsTicTacToeOpen(true), icon: "🎮" },
  ];

  return (
    <div className="mood-tracker-container">
      <h1 className="mood-title">Your Mental Pulse</h1>

      <div className="mood-grid">
        {features.map((f, i) => (
          <div key={i} className="mood-card" onClick={f.onClick}>
            <span className="mood-card-icon">{f.icon}</span>
            <h3 className="mood-card-title">{f.title}</h3>
          </div>
        ))}
      </div>

      {isQuoteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsQuoteModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Daily Inspiration</h2>
            <p className="quote-text">"{currentQuote}"</p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => setIsQuoteModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showQuizModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {showTips ? (
              <div className="results-container">
                <h2 className="modal-title">Your Mood: {mood}</h2>
                <div className="tip-box">
                  <h3 className="quiz-question">{mood === "Good" ? "You're doing great!" : "Some tips for you:"}</h3>
                  {mood !== "Good" && (
                    <ul style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
                      {moodTips[mood].map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  )}
                </div>
                <div className="modal-actions">
                  <button className="btn-primary" onClick={closeModal} style={{ width: '100%' }}>Close</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="modal-title">Checking In</h2>
                <p className="quiz-question">{quizQuestions[quizStep].question}</p>
                <div className="quiz-options">
                  {quizQuestions[quizStep].options.map((o, i) => (
                    <button key={i} className="quiz-option-btn" onClick={() => handleQuizOptionClick(o.score)}>
                      {o.text}
                    </button>
                  ))}
                </div>
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={closeModal}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {isMoodBoostModalOpen && (
        <div className="modal-overlay" onClick={closeMoodBoostModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Boost Your Energy</h2>
            <p className="quiz-question">Small actions lead to big changes.</p>
            <div className="quiz-options">
              <button className="quiz-option-btn" onClick={() => { setIsMoodBoostModalOpen(false); setIsTicTacToeOpen(true); }}>Play Tic Tac Toe</button>
              <button className="quiz-option-btn" onClick={() => alert("Coming soon!")}>Deep Breathing Exercise</button>
              <button className="quiz-option-btn" onClick={() => alert("Coming soon!")}>Flash Meditation</button>
            </div>
          </div>
        </div>
      )}

      {isTicTacToeOpen && (
        <div className="modal-overlay" onClick={closeMoodBoostModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Tic Tac Toe</h2>
            {winner && <h3 style={{ textAlign: 'center', color: winner === 'X' ? '#f4a261' : '#2a9d8f' }}>{winner === 'Draw' ? "It's a Draw!" : `${winner} Won!`}</h3>}
            <div className="tictactoe-grid">
              {ticTacToeBoard.map((s, i) => (
                <button
                  key={i}
                  className={`tictactoe-square ${s?.toLowerCase() || ''}`}
                  onClick={() => handleSquareClick(i)}
                  disabled={!!s || !!winner}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => { setTicTacToeBoard(Array(9).fill(null)); setWinner(null); }}>Restart</button>
              <button className="btn-primary" onClick={closeMoodBoostModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodTracker;

