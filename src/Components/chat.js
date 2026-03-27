import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FaPaperPlane, FaEllipsisH, FaVolumeUp, FaPlus, FaHistory, FaUserCog, FaThumbtack, FaUserCircle, FaThumbsUp, FaThumbsDown, FaShareAlt, FaFlag, FaCompass, FaArrowLeft, FaRobot, FaComment, FaTrash } from 'react-icons/fa';
import moodAvtar from '../assets/moodAvtar.png';
import dreamAvtar from '../assets/dreamAvtar.png';
import relationshipAvtar from '../assets/relationshipAvtar.png';
import stressAvtar from '../assets/stressAvtar.png';
import anxietyAvtar from '../assets/anxityAvtar.png';
import { chatbotService } from '../services/chatbotService';
import ChatHistory from './ChatHistory';
import DeleteChatModal from './DeleteChatModal';
import './Chat.css';

const defaultMentors = [
  { id: "mood-mentor", name: "Mood Mentor", author: "@mentora_official", interactions: "128k", desc: "Your steady companion for emotional balance.", image: moodAvtar },
  { id: "stress-buster", name: "Stress Buster", author: "@zen_master", interactions: "95k", desc: "Immediate stress relief and talk therapy.", image: stressAvtar },
  { id: "dream-weaver", name: "Dream Weaver", author: "@sleepy_hollow", interactions: "42k", desc: "Interpret dreams and improve sleep hygiene.", image: dreamAvtar },
  { id: "anxiety-ally", name: "Anxiety Ally", author: "@support_team", interactions: "156k", desc: "Guidance through anxious thoughts.", image: anxietyAvtar },
  { id: "relationship-rescuer", name: "Relationship Rescuer", author: "@social_expert", interactions: "83k", desc: "Advice for healthy boundaries.", image: relationshipAvtar }
];

const Chat = () => {
  const { aiId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentSessionId = searchParams.get('sessionId');

  // State for chatbot data
  const [currentChatbot, setCurrentChatbot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCustomChatbot, setIsCustomChatbot] = useState(false);

  // Check if this is a custom chatbot (chatbot/ID) or default mentor (mentor/ID)
  const isChatbotRoute = window.location.pathname.includes('/chatbot/');
  const chatbotId = isChatbotRoute ? aiId : null;
  const mentorName = !isChatbotRoute ? defaultMentors.find(m => m.id === aiId)?.name : null;

  const [selectedMentor, setSelectedMentor] = useState(mentorName || defaultMentors[0].name);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionId, setSessionId] = useState(currentSessionId);
  const messagesEndRef = useRef(null);

  // Define functions before using them
  const loadChatbotData = useCallback(async () => {
    try {
      setLoading(true);
      const chatbotData = await chatbotService.getChatbot(chatbotId);
      setCurrentChatbot(chatbotData.data);
      setIsCustomChatbot(true);
      setError('');
    } catch (error) {
      console.error('Failed to load chatbot:', error);
      setError('Failed to load chatbot. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [chatbotId]);

  const loadOfficialChatbotData = useCallback(async (mentorName) => {
    try {
      setLoading(true);
      console.log('Loading official chatbot data for:', mentorName);
      const response = await fetch(`http://localhost:5000/api/chatbots/name/${mentorName}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('mentora_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          console.log('Loaded official chatbot:', data.data);
          setCurrentChatbot(data.data);
          setIsCustomChatbot(false);
          setError('');
          return;
        }
      }
      
      console.log('API failed, using fallback data');
      // Fallback to hardcoded data if API fails
      const mentor = defaultMentors.find(m => m.name === mentorName);
      if (mentor) {
        setCurrentChatbot({
          id: mentor.id,
          name: mentor.name,
          description: mentor.desc,
          avatar: mentor.image,
          isOfficial: true,
          interactions: mentor.interactions
        });
      }
    } catch (error) {
      console.error('Failed to load official chatbot:', error);
      // Fallback to hardcoded data
      const mentor = defaultMentors.find(m => m.name === mentorName);
      if (mentor) {
        setCurrentChatbot({
          id: mentor.id,
          name: mentor.name,
          description: mentor.desc,
          avatar: mentor.image,
          isOfficial: true,
          interactions: mentor.interactions
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load chatbot data if it's a custom chatbot
  useEffect(() => {
    if (chatbotId) {
      loadChatbotData();
    } else {
      // For official chatbots, also load from database to get intro message
      const mentor = defaultMentors.find(m => m.id === aiId);
      if (mentor) {
        setSelectedMentor(mentor.name);
        loadOfficialChatbotData(mentor.name);
      }
    }
  }, [aiId, chatbotId, isChatbotRoute, loadChatbotData, loadOfficialChatbotData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    if (aiId && !isChatbotRoute) {
      const found = defaultMentors.find(m => m.id === aiId);
      if (found) setSelectedMentor(found.name);
    }
  }, [aiId, isChatbotRoute]);

  useEffect(() => {
    // Only initialize chat when we have the chatbot data AND no history
    if (chatHistory.length === 0 && currentChatbot && !loading) {
      console.log('Initializing chat with:', currentChatbot.name, 'Intro:', currentChatbot.intro);
      
      const initializeChat = async () => {
        try {
          // First, try to load conversation history from session if sessionId is provided
          if (sessionId && chatbotId) {
            try {
              const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}/messages`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('mentora_token')}`
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data.success && data.data && data.data.length > 0) {
                  console.log('Loaded session messages:', data.data.length, 'messages');
                  // Messages are already in chronological order from database
                  const formattedHistory = data.data.map(msg => ({
                    sender: msg.isFromUser ? "user" : "bot",
                    text: msg.content
                  }));
                  setChatHistory(formattedHistory);
                  return;
                }
              }
            } catch (error) {
              console.log('Could not load session messages, trying to load recent history');
            }
          }

          // If no specific session, try to load most recent session for this chatbot
          if (!sessionId && chatbotId) {
            try {
              const response = await fetch(`http://localhost:5000/api/sessions/ai/${chatbotId}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('mentora_token')}`
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data.success && data.data && data.data.length > 0) {
                  // Get the most recent session
                  const mostRecentSession = data.data[0];
                  console.log('Found recent session:', mostRecentSession.id);
                  
                  // Load messages from the most recent session
                  const messagesResponse = await fetch(`http://localhost:5000/api/sessions/${mostRecentSession.id}/messages`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('mentora_token')}`
                    }
                  });
                  
                  if (messagesResponse.ok) {
                    const messagesData = await messagesResponse.json();
                    if (messagesData.success && messagesData.data && messagesData.data.length > 0) {
                      console.log('Loaded recent session messages:', messagesData.data.length, 'messages');
                      const formattedHistory = messagesData.data.map(msg => ({
                        sender: msg.isFromUser ? "user" : "bot",
                        text: msg.content
                      }));
                      setChatHistory(formattedHistory);
                      setSessionId(mostRecentSession.id);
                      return;
                    }
                  }
                } else {
                  console.log('No existing sessions found for this chatbot, using intro message');
                }
              } else {
                console.log(`Failed to fetch sessions (HTTP ${response.status}), using intro message`);
              }
            } catch (error) {
              console.log('Error loading recent history:', error.message);
            }
          }

          // Use intro message from database if available
          if (currentChatbot.intro) {
            console.log('Using intro from database:', currentChatbot.intro);
            setChatHistory([{ 
              sender: "bot", 
              text: currentChatbot.intro 
            }]);
            return;
          }

          console.log('No intro found, using fallback API call');
          // Fallback: Make API call to get greeting
          const response = await fetch('http://localhost:5000/api/chat/message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('mentora_token')}`
            },
            body: JSON.stringify({
              message: 'Hello! I\'m ready to start our session.',
              mentorName: isCustomChatbot ? null : selectedMentor,
              chatbotId: isCustomChatbot ? chatbotId : null,
              sessionId: sessionId
            })
          });

          const data = await response.json();
          
          if (data.success) {
            setChatHistory([{ sender: "bot", text: data.reply }]);
            // Update session ID if returned from API
            if (data.sessionId && !sessionId) {
              setSessionId(data.sessionId);
            }
          } else {
            const greeting = isCustomChatbot 
              ? `Hello! I'm ${currentChatbot.name}. How can I help you today?`
              : `Hello! I'm ${selectedMentor}. How can I help you today?`;
            setChatHistory([{ 
              sender: "bot", 
              text: greeting
            }]);
          }
        } catch (error) {
          console.error('Chat initialization error:', error);
          const greeting = isCustomChatbot 
            ? `Hello! I'm ${currentChatbot.name}. How can I help you today?`
            : `Hello! I'm ${selectedMentor}. How can I help you today?`;
          setChatHistory([{ 
            sender: "bot", 
            text: greeting
          }]);
        }
      };

      initializeChat();
    }
  }, [currentChatbot, loading, chatHistory.length, isCustomChatbot, selectedMentor, chatbotId, sessionId]);

  const handleUserInput = useCallback(async () => {
    if (!userInput.trim() || (!selectedMentor && !currentChatbot)) return;
    
    const currentChat = [...chatHistory, { sender: "user", text: userInput }];
    setChatHistory(currentChat);
    const message = userInput;
    setUserInput("");
    
    try {
      const response = await fetch('http://localhost:5000/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('mentora_token')}`
        },
        body: JSON.stringify({
          message: message,
          mentorName: isCustomChatbot ? null : selectedMentor,
          chatbotId: isCustomChatbot ? chatbotId : null,
          sessionId: sessionId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setChatHistory([...currentChat, { sender: "bot", text: data.reply }]);
        
        // Update session ID if returned from API
        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId);
        }
        
        // Refresh chatbot data to get updated interaction count
        if (isCustomChatbot && chatbotId) {
          loadChatbotData();
        } else if (!isCustomChatbot && selectedMentor) {
          loadOfficialChatbotData(selectedMentor);
        }
      } else {
        setChatHistory([...currentChat, { 
          sender: "bot", 
          text: data.reply || "I'm having trouble responding right now. Please try again." 
        }]);
      }
    } catch (error) {
      console.error('Chat API Error:', error);
      setChatHistory([...currentChat, { 
        sender: "bot", 
        text: "I'm having trouble connecting right now. Please check your connection and try again." 
      }]);
    }
  }, [userInput, chatHistory, selectedMentor, currentChatbot, isCustomChatbot, chatbotId, sessionId, loadChatbotData, loadOfficialChatbotData]);

  const handleNewChat = useCallback(() => {
    // Clear current chat history
    setChatHistory([]);
    setSessionId(null);
    // Navigate to new chat without session ID
    if (isCustomChatbot) {
      navigate(`/chatbot/${chatbotId}`);
    } else {
      navigate(`/chat/${aiId}`);
    }
  }, [isCustomChatbot, chatbotId, aiId, navigate]);

  const handleHistoryClick = useCallback(() => {
    setShowChatHistory(true);
  }, []);

  const handleSelectSession = useCallback((newSessionId) => {
    setSessionId(newSessionId);
    // Navigate to the chat with the session ID
    if (isCustomChatbot) {
      navigate(`/chatbot/${chatbotId}?sessionId=${newSessionId}`);
    } else {
      navigate(`/chat/${aiId}?sessionId=${newSessionId}`);
    }
  }, [isCustomChatbot, chatbotId, aiId, navigate]);

  const handleDeleteChat = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    const mentorName = currentChatbot?.name || selectedMentor;
    
    try {
      const chatbotIdToDelete = isCustomChatbot ? chatbotId : aiId;
      await chatbotService.clearChatHistory(chatbotIdToDelete);
      
      // Clear current chat history
      setChatHistory([]);
      setSessionId(null);
      setShowDeleteModal(false);
      
      // Show success message
      alert(`Chat history with ${mentorName} has been deleted successfully.`);
      
    } catch (error) {
      console.error('Delete chat error:', error);
      alert('Failed to delete chat history. Please try again.');
    }
  }, [currentChatbot, selectedMentor, isCustomChatbot, chatbotId, aiId]);

  return (
    <div className="chat-room-container">
      {/* Error Display */}
      {error && (
        <div className="error-message" style={{
          backgroundColor: '#ff4757',
          color: 'white',
          padding: '10px',
          margin: '10px',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          {error}
          <button 
            onClick={() => setError('')}
            style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'white' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Loading Display */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading chatbot...
        </div>
      )}

      {/* Current Mentor Identity Header */}
      <div className="active-mentor-header">
        <div className="header-left">
          <button className="back-arrow-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <img
            src={currentChatbot?.avatar || defaultMentors.find(m => m.name === selectedMentor)?.image}
            alt={currentChatbot?.name || selectedMentor}
            className="active-mentor-avatar"
            onError={(e) => { e.target.src = '/assets/default-avatar.png'; }}
          />
          <div className="active-mentor-info">
            <h3>{currentChatbot?.name || selectedMentor}</h3>
            {currentChatbot?.isOfficial && (
              <span className="official-badge" style={{ marginTop: '4px', fontSize: '12px', color: '#4CAF50', display: 'inline-block' }}>
                <FaRobot size={10} /> Official
              </span>
            )}
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
            <img 
              src={currentChatbot?.avatar || defaultMentors.find(m => m.name === selectedMentor)?.image} 
              alt="" 
              className="sidebar-avatar-large"
              onError={(e) => { e.target.src = '/assets/default-avatar.png'; }}
            />
            <h2>{currentChatbot?.name || selectedMentor}</h2>
            <p className="sidebar-author">
              By {currentChatbot?.isOfficial ? '@mentora_official' : 'Custom Creator'}
            </p>
            <div className="sidebar-interactions">
              <FaComment className="interactions-icon" />
              <span>{currentChatbot?.interactions || '0'} interactions</span>
            </div>
          </div>

          <div className="sidebar-actions">
            <button className="action-btn-circle"><FaShareAlt /></button>
            <div className="feedback-group">
              <button className="action-btn-circle"><FaThumbsUp /></button>
              <button className="action-btn-circle"><FaThumbsDown /></button>
            </div>
            <button className="action-btn-circle"><FaFlag /></button>
          </div>

          <p className="sidebar-tagline">{currentChatbot?.description || defaultMentors.find(m => m.name === selectedMentor)?.desc}</p>

          <div className="sidebar-menu">
            <button className="menu-item" onClick={handleNewChat}><FaPlus /> New chat</button>
            <button className="menu-item" onClick={handleHistoryClick}><FaHistory /> History</button>
            <button className="menu-item delete-chat" onClick={handleDeleteChat}><FaTrash /> Delete chat</button>
            <button className="menu-item"><FaVolumeUp /> Voice <span className="menu-meta">Default <FaCompass style={{ transform: 'rotate(90deg)', fontSize: '0.8rem' }} /></span></button>
            <button className="menu-item"><FaUserCog /> Customize</button>
            <button className="menu-item"><FaThumbtack /> Pinned</button>
            <button className="menu-item"><FaUserCircle /> Persona</button>
          </div>
        </div>
        <div className="sidebar-overlay" onClick={() => setShowSidebar(false)}></div>
      </div>

      {/* Chat History Modal */}
      <ChatHistory
        aiId={chatbotId || currentChatbot?.id}
        mentorName={selectedMentor}
        isOpen={showChatHistory}
        onClose={() => setShowChatHistory(false)}
        onSelectSession={handleSelectSession}
      />

      {/* Delete Chat Confirmation Modal */}
      <DeleteChatModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        mentorName={currentChatbot?.name || selectedMentor}
      />
    </div>
  );
};

export default Chat;
