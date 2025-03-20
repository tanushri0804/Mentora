import React, { useState, useEffect } from "react";
import moodAvtar from '../assets/moodAvtar.png';
import dreamAvtar from '../assets/dreamAvtar.png';
import relationshipAvtar from '../assets/relationshipAvtar.png';
import stressAvtar from '../assets/stressAvtar.png';
import anxityAvtar from '../assets/anxityAvtar.png';

const mentors = [
  { name: "Mood Mentor", image: moodAvtar },
  { name: "Stress Buster", image: stressAvtar },
  { name: "Dream Weaver", image: dreamAvtar },
  { name: "Anxiety Ally", image: anxityAvtar },
  { name: "Relationship Rescuer", image: relationshipAvtar }
];

const Chat = () => {
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [mentorOptions, setMentorOptions] = useState([]);

  useEffect(() => {
    if (selectedMentor) {
      fetchMentorGreeting(selectedMentor);
    }
  }, [selectedMentor]);

  const fetchMentorGreeting = async (mentorName) => {
    try {
      const response = await fetch("/chatresponse.json");
      const data = await response.json();
      if (!data[mentorName]) return;

      const mentorData = data[mentorName];
      setChatHistory([
        { sender: "bot", text: mentorData.greeting },
        { sender: "bot", text: mentorData.question }
      ]);
      setMentorOptions(mentorData.options || []);
    } catch (error) {
      console.error("Error fetching mentor data:", error);
    }
  };

  const fetchChatbotData = async (mentorName, userMessage) => {
    try {
      const response = await fetch("/chatresponse.json");
      const data = await response.json();
      if (!data[mentorName]) return;

      const mentorData = data[mentorName];
      const userMessageLower = userMessage.trim().toLowerCase();

      const matchedOption = mentorData.options.find(
        (option) => option.toLowerCase() === userMessageLower
      );

      if (matchedOption) {
        const responseMessage = mentorData.responses?.[matchedOption];
        return responseMessage
          ? { reply: responseMessage.message, options: responseMessage.followUp || [] }
          : { reply: "I don't have an answer for that. Can you try something else?" };
      }

      return { reply: "I don't have an answer for that. Can you try something else?" };
    } catch (error) {
      console.error("Error fetching chatbot data:", error);
      return { reply: "Something went wrong. Please try again." };
    }
  };

  const handleOptionClick = async (option) => {
    if (!selectedMentor) return;
    setChatHistory((prev) => [...prev, { sender: "user", text: option }]);
    const response = await fetchChatbotData(selectedMentor, option);
    setChatHistory((prev) => [...prev, { sender: "bot", text: response.reply }]);
    setMentorOptions(response.options || []);
  };

  const handleUserInput = async () => {
    if (!userInput.trim() || !selectedMentor) return;
    setChatHistory((prev) => [...prev, { sender: "user", text: userInput }]);
    const response = await fetchChatbotData(selectedMentor, userInput);
    setChatHistory((prev) => [...prev, { sender: "bot", text: response.reply }]);
    setMentorOptions(response.options || []);
    setUserInput("");
  };

  return (
    <div className="chat-container">
      {/* Mentor Selection */}
      <div className="mentor-selection">
        {mentors.map((mentor) => (
          <button
            key={mentor.name}
            className={`mentor-button ${selectedMentor === mentor.name ? "selected" : ""}`}
            onClick={() => setSelectedMentor(mentor.name)}
          >
            <img src={mentor.image} alt={mentor.name} className="mentor-image" />
            <span>{mentor.name}</span>
          </button>
        ))}
      </div>

      {/* Chat Box */}
      <div className="chat-box">
        {chatHistory.map((msg, index) => (
          <div key={index} className={msg.sender === "bot" ? "bot-msg" : "user-msg"}>
            {msg.text}
          </div>
        ))}

        {/* Auto-Suggested Options */}
        {mentorOptions.length > 0 && (
          <div className="options">
            {mentorOptions.map((option, index) => (
              <button key={index} className="option-button" onClick={() => handleOptionClick(option)}>
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Input (Fixed at Bottom) */}
      <div className="input-area">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleUserInput}>Send</button>
      </div>

      {/* Styling */}
      <style jsx>{`
        .chat-container {
          width: 800px;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: #1e1e2e;
          color: white;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .mentor-selection {
          display: flex;
          justify-content: space-around;
          padding: 12px;
          background: #2a2a3a;
          border-bottom: 1px solid #444;
        }

        .mentor-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          transition: 0.3s;
        }

        .mentor-button:hover {
          transform: scale(1.1);
        }

        .mentor-image {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          margin-bottom: 5px;
        }

        .chat-box {
          padding: 12px;
          height: 350px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          background: #1e1e2e;
        }

        .bot-msg {
          color: #b0c7ff;
          background: #2a2a3a;
          padding: 8px;
          border-radius: 8px;
          margin: 5px 0;
          align-self: flex-start;
          max-width: 70%;
        }

        .user-msg {
          color: #e3e3e3;
          background: #4a4f6a;
          padding: 8px;
          border-radius: 8px;
          margin: 5px 0;
          align-self: flex-end;
          max-width: 70%;
        }

        .options {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 12px;
        }

        .option-button {
          padding: 6px;
          background: #3a3f54;
          color: white;
          border: 1px solid #555;
          cursor: pointer;
          border-radius: 6px;
          transition: 0.3s;
        }

        .option-button:hover {
          background: #50577a;
        }

        .input-area {
          display: flex;
          padding: 12px;
          background: #2a2a3a;
          border-top: 1px solid #444;
          position: sticky;
          bottom: 0;
        }

        .input-area input {
          flex: 1;
          padding: 10px;
          border: none;
          background: #3a3f54;
          color: white;
          border-radius: 6px;
          font-size: 14px;
        }

        .input-area button {
          padding: 10px 15px;
          background: #6b82f7;
          color: white;
          border: none;
          cursor: pointer;
          border-radius: 6px;
          margin-left: 10px;
          transition: 0.3s;
        }

        .input-area button:hover {
          background: #8499ff;
        }
      `}</style>
    </div>  );
};

export default Chat;
