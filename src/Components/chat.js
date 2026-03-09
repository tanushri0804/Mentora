import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaEllipsisH, FaVolumeUp, FaPlus, FaHistory, FaUserCog, FaThumbtack, FaUserCircle, FaFillDrip, FaThumbsUp, FaThumbsDown, FaShareAlt, FaFlag, FaCompass, FaArrowLeft } from 'react-icons/fa';
import moodAvtar from '../assets/moodAvtar.png';
import dreamAvtar from '../assets/dreamAvtar.png';
import relationshipAvtar from '../assets/relationshipAvtar.png';
import stressAvtar from '../assets/stressAvtar.png';
import anxityAvtar from '../assets/anxityAvtar.png';
import './Chat.css';

const mentors = [
  { id: "mood-mentor", name: "Mood Mentor", author: "@mentora_official", interactions: "128k", desc: "Your steady companion for emotional balance.", image: moodAvtar },
  { id: "stress-buster", name: "Stress Buster", author: "@zen_master", interactions: "95k", desc: "Immediate stress relief and talk therapy.", image: stressAvtar },
  { id: "dream-weaver", name: "Dream Weaver", author: "@sleepy_hollow", interactions: "42k", desc: "Interpret dreams and improve sleep hygiene.", image: dreamAvtar },
  { id: "anxiety-ally", name: "Anxiety Ally", author: "@support_team", interactions: "156k", desc: "Guidance through anxious thoughts.", image: anxityAvtar },
  { id: "relationship-rescuer", name: "Relationship Rescuer", author: "@social_expert", interactions: "83k", desc: "Advice for healthy boundaries.", image: relationshipAvtar }
];

const Chat = () => {
  const { aiId } = useParams();
  const navigate = useNavigate();

  // Find mentor name from ID or default to first one
  const initialMentor = mentors.find(m => m.id === aiId)?.name || mentors[0].name;

  const [selectedMentor, setSelectedMentor] = useState(initialMentor);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [mentorOptions, setMentorOptions] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Update selected mentor if URL param changes
  useEffect(() => {
    if (aiId) {
      const found = mentors.find(m => m.id === aiId);
      if (found) setSelectedMentor(found.name);
    }
  }, [aiId]);


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
    const currentChat = [...chatHistory, { sender: "user", text: option }];
    setChatHistory(currentChat);
    const response = await fetchChatbotData(selectedMentor, option);
    setChatHistory([...currentChat, { sender: "bot", text: response.reply }]);
    setMentorOptions(response.options || []);
  };

  const handleUserInput = async () => {
    if (!userInput.trim() || !selectedMentor) return;
    const currentChat = [...chatHistory, { sender: "user", text: userInput }];
    setChatHistory(currentChat);
    setUserInput("");
    const response = await fetchChatbotData(selectedMentor, userInput);
    setChatHistory([...currentChat, { sender: "bot", text: response.reply }]);
    setMentorOptions(response.options || []);
  };

  return (
    <div className="chat-room-container">
      {/* Current Mentor Identity Header */}
      <div className="active-mentor-header">
        <div className="header-left">
          <button className="back-arrow-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <img
            src={mentors.find(m => m.name === selectedMentor)?.image}
            alt={selectedMentor}
            className="active-mentor-avatar"
          />
          <div className="active-mentor-info">
            <h3>{selectedMentor}</h3>
            <span className="online-badge">Online</span>
          </div>
        </div>
        <div className="header-right">
          <button className="header-icon-btn"><FaVolumeUp /></button>
          <button className="header-icon-btn" onClick={() => setShowSidebar(!showSidebar)}><FaEllipsisH /></button>
        </div>
      </div>

      {/* Main Chat Display */}
      <div className="chat-messages-area">

        {chatHistory.map((msg, index) => (
          <div key={index} className={`message-bubble ${msg.sender === "bot" ? "bot-bubble" : "user-bubble"}`}>
            {msg.text}
          </div>
        ))}

        {mentorOptions.length > 0 && (
          <div className="suggested-options-grid">
            {mentorOptions.map((option, index) => (
              <button key={index} className="option-pill" onClick={() => handleOptionClick(option)}>
                {option}
              </button>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Modern Input Region */}
      <div className="chat-input-wrapper">
        <input
          type="text"
          className="chat-input-field"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleUserInput()}
          placeholder={`Talk to ${selectedMentor}...`}
        />
        <button className="send-btn-icon" onClick={handleUserInput}>
          <FaPaperPlane />
        </button>
      </div>

      {/* Options Sidebar */}
      <div className={`options-sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="sidebar-content">
          <div className="sidebar-profile">
            <img src={mentors.find(m => m.name === selectedMentor)?.image} alt="" className="sidebar-avatar-large" />
            <h2>{selectedMentor}</h2>
            <p className="sidebar-author">By {mentors.find(m => m.name === selectedMentor)?.author}</p>
            <p className="sidebar-stats">{mentors.find(m => m.name === selectedMentor)?.interactions} interactions</p>
          </div>

          <div className="sidebar-actions">
            <button className="action-btn-circle"><FaShareAlt /></button>
            <div className="feedback-group">
              <button className="action-btn-circle"><FaThumbsUp /></button>
              <button className="action-btn-circle"><FaThumbsDown /></button>
            </div>
            <button className="action-btn-circle"><FaFlag /></button>
          </div>

          <p className="sidebar-tagline">{mentors.find(m => m.name === selectedMentor)?.desc}</p>

          <div className="sidebar-menu">
            <button className="menu-item"><FaPlus /> New chat</button>
            <button className="menu-item"><FaVolumeUp /> Voice <span className="menu-meta">Default <FaCompass style={{ transform: 'rotate(90deg)', fontSize: '0.8rem' }} /></span></button>
            <button className="menu-item"><FaHistory /> History</button>
            <button className="menu-item"><FaUserCog /> Customize</button>
            <button className="menu-item"><FaThumbtack /> Pinned</button>
            <button className="menu-item"><FaUserCircle /> Persona</button>
            <button className="menu-item"><FaFillDrip /> Style <span className="menu-meta">PipSqueak <FaCompass style={{ transform: 'rotate(90deg)', fontSize: '0.8rem' }} /></span></button>
          </div>
        </div>
        <div className="sidebar-overlay" onClick={() => setShowSidebar(false)}></div>
      </div>
    </div>
  );
};

export default Chat;

