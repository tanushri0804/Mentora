import React, { useState } from 'react';

const QuestionAns = () => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState(Array(5).fill(''));

  const questions = [
    { question: 'What are 5 things you can see around you?', options: [] },
    { question: 'What are 4 things you can hear right now?', options: ['Birds', 'Traffic', 'Music', 'Silence'] },
    { question: 'What are 3 things you can feel?', options: [] },
    { question: 'What are 2 things you can smell?', options: ['Coffee', 'Perfume', 'Flowers', 'Food'] },
    { question: 'What is 1 thing you can taste?', options: [] },
  ];

  const handleNext = () => {
    if (currentQuestion < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleAnswerChange = (e) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion - 1] = e.target.value;
    setAnswers(newAnswers);
  };

  const handleOptionSelect = (option) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion - 1] = option;
    setAnswers(newAnswers);
  };

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={modalStyle}>
        
        {/* Timeline at the top */}
        <div style={timelineContainerStyle}>
          {questions.map((_, index) => (
            <React.Fragment key={index}>
              <div
                style={{
                  ...timelineDotStyle,
                  backgroundColor: currentQuestion > index ? '#4caf50' : '#ccc',
                }}
              />
              {index < questions.length - 1 && <div style={timelineLineStyle} />}
            </React.Fragment>
          ))}
        </div>

        <h2 style={{ color: '#fff', marginTop: '20px' }}>Question {currentQuestion} of 5</h2>
        <p style={{ color: '#ccc' }}>{questions[currentQuestion - 1].question}</p>

        {/* Answer input or options */}
        {questions[currentQuestion - 1].options.length > 0 ? (
          <div style={{ marginTop: '15px', marginBottom: '20px' }}>
            {questions[currentQuestion - 1].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                style={{
                  ...optionButtonStyle,
                  backgroundColor: answers[currentQuestion - 1] === option ? '#4caf50' : '#333',
                }}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <input
            type="text"
            value={answers[currentQuestion - 1]}
            onChange={handleAnswerChange}
            placeholder="Type your answer here..."
            style={inputStyle}
          />
        )}

        {/* Display saved answer */}
        {answers[currentQuestion - 1] && (
          <p style={{ color: '#4caf50', marginTop: '10px' }}>
            Your Answer: {answers[currentQuestion - 1]}
          </p>
        )}

        {/* Navigation buttons */}
        <div style={{ marginTop: '30px' }}>
          <button
            onClick={handlePrevious}
            style={{ ...buttonStyle, visibility: currentQuestion === 1 ? 'hidden' : 'visible' }}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            style={{ ...buttonStyle, marginLeft: '10px', visibility: currentQuestion === 5 ? 'hidden' : 'visible' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// Styles for modal, timeline, input, and buttons
const modalStyle = {
  backgroundColor: '#1c1c1e',
  color: '#fff',
  padding: '30px',
  borderRadius: '8px',
  width: '400px',
  height: '500px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

const timelineContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '20px',
  width: '80%',
  justifyContent: 'space-between',
};

const timelineDotStyle = {
  width: '12px',
  height: '12px',
  borderRadius: '50%',
};

const timelineLineStyle = {
  flex: 1,
  height: '2px',
  backgroundColor: '#ccc',
  margin: '0 5px',
};

const inputStyle = {
  marginTop: '15px',
  padding: '10px',
  width: '100%',
  borderRadius: '5px',
  border: '1px solid #ccc',
  backgroundColor: '#333',
  color: '#fff',
};

const buttonStyle = {
  backgroundColor: '#4caf50',
  color: '#fff',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const optionButtonStyle = {
  padding: '10px 15px',
  borderRadius: '5px',
  margin: '5px',
  border: 'none',
  cursor: 'pointer',
  color: '#fff',
};

export default QuestionAns;
