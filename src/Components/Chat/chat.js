import React, { useState, useEffect, useRef, useCallback } from "react";
import './Toast.css';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FaPaperPlane, FaEllipsisH, FaPlus, FaHistory, FaUserCog, FaThumbsUp, FaThumbsDown, FaShareAlt, FaFlag, FaArrowLeft, FaRobot, FaComment, FaTrash, FaTimes } from 'react-icons/fa';
import moodAvtar from '../../assets/moodAvtar.png';
import dreamAvtar from '../../assets/dreamAvtar.png';
import relationshipAvtar from '../../assets/relationshipAvtar.png';
import stressAvtar from '../../assets/stressAvtar.png';
import anxietyAvtar from '../../assets/anxityAvtar.png';
import { chatbotService } from '../../services/chatbotService';
import ChatHistory from '../ChatHistory/ChatHistory';
import DeleteChatModal from '../DeleteChatModal/DeleteChatModal';
import ChatCustomizer from '../ChatCustomizer/ChatCustomizer';
import { useTheme } from '../../context/ThemeContext';
import './Chat.css';
import { useAuth } from '../../context/AuthContext';
import LoginRequiredModal from '../LoginRequiredModal/LoginRequiredModal';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Replace {{user}} token with the actual user's display name
const resolveTokens = (text, userName) => {
  if (!text) return text;
  const name = userName || 'there';
  return text.replace(/\{\{user\}\}/gi, name);
};

// ── Keyword → Wellness activity suggestions ──────────────────────────────
const ACTIVITY_SUGGESTIONS = [
  {
    id: "breathing",
    emoji: "🌬️",
    label: "Try Breathing Exercise",
    color: "#2a9d8f",
    keywords: [
      "stressed", "stress", "anxious", "anxiety", "panic", "panicking",
      "overwhelmed", "overwhelm", "tense", "nervous", "cant breathe",
      "chest tight", "freaking out", "on edge", "wound up"
    ],
  },
  {
    id: "affirmation",
    emoji: "✨",
    label: "Get a Daily Affirmation",
    color: "#f4a261",
    keywords: [
      "sad", "depressed", "depression", "worthless", "useless", "hate myself",
      "low self", "no confidence", "insecure", "not good enough", "ugly",
      "failure", "loser", "hopeless", "empty", "broken"
    ],
  },
  {
    id: "gratitude",
    emoji: "🙏",
    label: "Gratitude Prompt",
    color: "#4caf7d",
    keywords: [
      "grateful", "gratitude", "thankful", "appreciate", "blessed",
      "good things", "positive things", "counting blessings"
    ],
  },
  {
    id: "reframe",
    emoji: "🔄",
    label: "Reframe Your Thoughts",
    color: "#9b59b6",
    keywords: [
      "negative thoughts", "overthinking", "can't stop thinking", "stuck in my head",
      "spiraling", "bad thoughts", "worst case", "everything is wrong",
      "nothing works", "giving up", "can't do anything right"
    ],
  },
  {
    id: "memorymatch",
    emoji: "🃏",
    label: "Play Memory Match",
    color: "#9b59b6",
    keywords: [
      "bored", "boring", "nothing to do", "so bored", "kill time",
      "unfocused", "can't focus", "distracted", "procrastinating"
    ],
  },
  {
    id: "bubblepop",
    emoji: "🫧",
    label: "Pop Some Bubbles",
    color: "#4ecdc4",
    keywords: [
      "angry", "anger", "furious", "so angry", "pissed", "irritated",
      "annoyed", "rage", "mad at", "want to scream", "agitated"
    ],
  },
  {
    id: "quote",
    emoji: "💬",
    label: "Get Inspired",
    color: "#457b9d",
    keywords: [
      "unmotivated", "no motivation", "lost", "no purpose", "no direction",
      "what's the point", "don't know what to do", "feel stuck",
      "need inspiration", "need motivation"
    ],
  },
  {
    id: "reaction",
    emoji: "⚡",
    label: "Energy Boost Game",
    color: "#4caf7d",
    keywords: [
      "tired", "exhausted", "sleepy", "no energy", "drained", "sluggish",
      "lethargic", "can't get up", "so tired", "burnout", "burned out"
    ],
  },
  {
    id: "self-care",
    emoji: "🧘",
    label: "Guided Meditation",
    color: "#a8dadc",
    keywords: [
      "meditate", "meditation", "mindful", "mindfulness", "need peace",
      "need quiet", "clear my head", "ground myself", "inner peace",
      "relaxation", "cant sleep", "can't sleep", "insomnia", "sleep"
    ],
    route: "/chat/self-care",
  },
];

/**
 * Scans the USER's message for emotional keywords and returns matching suggestions.
 * Only triggers on explicit emotional signals, not on every message.
 */
function detectSuggestions(userText) {
  if (!userText || userText.trim().length < 4) return [];
  const lower = userText.toLowerCase();

  const matched = ACTIVITY_SUGGESTIONS.filter(a =>
    a.keywords.some(kw => lower.includes(kw))
  );

  // Deduplicate and cap at 3
  const seen = new Set();
  return matched.filter(a => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  }).slice(0, 3);
}

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
  const { theme } = useTheme();

  // State for chatbot data
  const [currentChatbot, setCurrentChatbot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
  const [toast, setToast] = useState(null);

  const { isGuest, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [sessionId, setSessionId] = useState(currentSessionId);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
      const response = await fetch(`${API_BASE}/chatbots/name/${mentorName}`, {
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
    scrollToBottom();
  }, [isTyping]);

  useEffect(() => {
    if (!isTyping) {
      inputRef.current?.focus();
    }
  }, [isTyping]);

  useEffect(() => {
    if (aiId && !isChatbotRoute) {
      const found = defaultMentors.find(m => m.id === aiId);
      if (found) setSelectedMentor(found.name);
    }
  }, [aiId, isChatbotRoute]);

  // Sync sessionId and reset chat history when URL session ID or companion changes
  useEffect(() => {
    console.log("URL/Route changed. Syncing session:", currentSessionId, "aiId:", aiId);
    setSessionId(currentSessionId);
    setChatHistory([]);
  }, [currentSessionId, aiId]);

  useEffect(() => {
    // Only initialize chat when we have the chatbot data AND no history
    if (chatHistory.length === 0 && currentChatbot && !loading) {
      console.log('Initializing chat with:', currentChatbot.name, 'Intro:', currentChatbot.intro);
      
      const initializeChat = async () => {
        try {
          // First, try to load conversation history from session if sessionId is provided
          if (sessionId) {
            try {
              const response = await fetch(`${API_BASE}/sessions/${sessionId}/messages`, {
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
          const targetCompanionId = chatbotId || currentChatbot?.id;
          if (!sessionId && targetCompanionId) {
            try {
              const response = await fetch(`${API_BASE}/sessions/ai/${targetCompanionId}`, {
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
                  const messagesResponse = await fetch(`${API_BASE}/sessions/${mostRecentSession.id}/messages`, {
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
                      
                      // Sync URL search params
                      if (isCustomChatbot) {
                        navigate(`/chat/chatbot/${chatbotId}?sessionId=${mostRecentSession.id}`, { replace: true });
                      } else {
                        navigate(`/chat/${aiId}?sessionId=${mostRecentSession.id}`, { replace: true });
                      }
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
              text: resolveTokens(currentChatbot.intro, user?.name || user?.username)
            }]);
            return;
          }

          console.log('No intro found, using fallback API call');
          // Fallback: Make API call to get greeting
          const response = await fetch(`${API_BASE}/chat/message`, {
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
              if (isCustomChatbot) {
                navigate(`/chat/chatbot/${chatbotId}?sessionId=${data.sessionId}`, { replace: true });
              } else {
                navigate(`/chat/${aiId}?sessionId=${data.sessionId}`, { replace: true });
              }
            }
          } else {
            const greeting = isCustomChatbot 
              ? `Hello! I'm ${currentChatbot.name}. How can I help you today?`
              : `Hello! I'm ${selectedMentor}. How can I help you today?`;
            setChatHistory([{ 
              sender: "bot", 
              text: resolveTokens(greeting, user?.name || user?.username)
            }]);
          }
        } catch (error) {
          console.error('Chat initialization error:', error);
          const greeting = isCustomChatbot 
            ? `Hello! I'm ${currentChatbot.name}. How can I help you today?`
            : `Hello! I'm ${selectedMentor}. How can I help you today?`;
          setChatHistory([{ 
            sender: "bot", 
            text: resolveTokens(greeting, user?.name || user?.username)
          }]);
        }
      };

      initializeChat();
    }
  }, [currentChatbot, loading, chatHistory.length, isCustomChatbot, selectedMentor, chatbotId, sessionId, navigate, aiId, user]);

  const handleUserInput = useCallback(async () => {
    if (isGuest) {
      setShowAuthModal(true);
      return;
    }
    if (!userInput.trim() || (!selectedMentor && !currentChatbot)) return;
    
    const currentChat = [...chatHistory, { sender: "user", text: userInput }];
    setChatHistory(currentChat);
    const message = userInput;
    setUserInput("");
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      const response = await fetch(`${API_BASE}/chat/message`, {
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
      
      // Hide typing indicator
      setIsTyping(false);
      
      if (data.success) {
        setChatHistory([...currentChat, { sender: "bot", text: data.reply, suggestions: detectSuggestions(message) }]);
        
        // Update session ID if returned from API
        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId);
          if (isCustomChatbot) {
            navigate(`/chat/chatbot/${chatbotId}?sessionId=${data.sessionId}`, { replace: true });
          } else {
            navigate(`/chat/${aiId}?sessionId=${data.sessionId}`, { replace: true });
          }
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
          text: data.reply || "I'm having trouble responding right now. Please try again.",
          suggestions: detectSuggestions(message)
        }]);
      }
    } catch (error) {
      console.error('Chat API Error:', error);
      setIsTyping(false);
      setChatHistory([...currentChat, { 
        sender: "bot", 
        text: "I'm having trouble connecting right now. Please check your connection and try again.",
        suggestions: detectSuggestions(message)
      }]);
    }
  }, [userInput, chatHistory, selectedMentor, currentChatbot, isCustomChatbot, chatbotId, sessionId, loadChatbotData, loadOfficialChatbotData, aiId, navigate, isGuest]);

  const handleNewChat = useCallback(async () => {
    if (isGuest) {
      setShowAuthModal(true);
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('mentora_token');
      const targetCompanionId = chatbotId || currentChatbot?.id;
      
      if (!targetCompanionId) {
        setLoading(false);
        return;
      }
      
      console.log('Creating new session for companion:', targetCompanionId);
      const response = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          aiId: targetCompanionId,
          title: 'New Chat'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('Successfully created new session:', data.data.id);
          setChatHistory([]);
          setSessionId(data.data.id);
          setShowSidebar(false);
          
          if (isCustomChatbot) {
            navigate(`/chat/chatbot/${chatbotId}?sessionId=${data.data.id}`);
          } else {
            navigate(`/chat/${aiId}?sessionId=${data.data.id}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to create new chat session from sidebar:', error);
    } finally {
      setLoading(false);
    }
  }, [isCustomChatbot, chatbotId, aiId, currentChatbot, navigate, isGuest]);

  const handleHistoryClick = useCallback(() => {
    setShowChatHistory(true);
  }, []);

  const handleSelectSession = useCallback((newSessionId) => {
    setSessionId(newSessionId);
    // Navigate to the chat with the session ID
    if (isCustomChatbot && chatbotId) {
      navigate(`/chat/chatbot/${chatbotId}?sessionId=${newSessionId}`);
    } else if (!isCustomChatbot && aiId) {
      navigate(`/chat/${aiId}?sessionId=${newSessionId}`);
    }
  }, [isCustomChatbot, chatbotId, aiId, navigate]);

  const handleDeleteChat = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    const mentorName = currentChatbot?.name || selectedMentor;
    
    try {
      if (sessionId) {
        // Delete the specific active session
        const token = localStorage.getItem('mentora_token');
        const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete session');
        }
      } else {
        // If there's no sessionId, clear all history with this companion
        const chatbotIdToDelete = isCustomChatbot ? chatbotId : aiId;
        await chatbotService.clearChatHistory(chatbotIdToDelete);
      }
      
      // Clear current chat history and reset session ID
      setChatHistory([]);
      setSessionId(null);
      setShowDeleteModal(false);
      setShowSidebar(false);

      // Navigate to base chatbot route to start a clean slate
      if (isCustomChatbot) {
        navigate(`/chat/chatbot/${chatbotId}`);
      } else {
        navigate(`/chat/${aiId}`);
      }

      // Show success toast
      setToast({ msg: `Chat session with ${mentorName} has been deleted successfully.`, type: 'success' });

    } catch (error) {
      console.error('Delete chat error:', error);
      setToast({ msg: 'Failed to delete chat session. Please try again.', type: 'error' });
    }
  }, [currentChatbot, selectedMentor, isCustomChatbot, chatbotId, aiId, sessionId, navigate]);

  const fontSizeMap = {
    small: '13px',
    medium: '15px',
    large: '18px'
  };

  const bubbleStyle = {
    fontSize: fontSizeMap[theme.fontSize] || '15px',
    borderRadius: theme.messageStyle === 'square' ? '8px' : '20px',
    padding: theme.isCompact ? '8px 12px' : '14px 20px'
  };

  return (
    <>
      {toast && (
        <div className={`toast ${toast.type}`}> {toast.msg} </div>
      )}
    <div className="chat-room-container" style={{ backgroundColor: theme.chatBackground }}>
      {/* Dynamic Background Image Layer */}
      {theme.backgroundImage && (
        <div 
          className="chat-bg-image-overlay" 
          style={{ 
            backgroundImage: `url(${theme.backgroundImage})`,
            opacity: theme.backgroundOpacity,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
      )}

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
          <button className="header-icon-btn" onClick={() => setShowSidebar(!showSidebar)}><FaEllipsisH /></button>
        </div>
      </div>

      {/* Main Chat Display */}
      <div className="chat-messages-area">

        {chatHistory.map((msg, index) => {
          return (
            <React.Fragment key={index}>
              <div
                className={`message-bubble ${msg.sender === "bot" ? "bot-bubble" : "user-bubble"}`}
                style={{
                  ...bubbleStyle,
                  background: msg.sender === 'user' ? theme.userBubbleColor : theme.botBubbleColor
                }}
              >
                {msg.text}
              </div>
            </React.Fragment>
          );
        })}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div 
            className="message-bubble bot-bubble typing-indicator"
            style={{
              ...bubbleStyle,
              background: theme.botBubbleColor
            }}
          >
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Pinned suggestions bar — shows above input when last bot reply has suggestions */}
      {(() => {
        const lastBot = [...chatHistory].reverse().find(m => m.sender === "bot");
        const pins = lastBot?.suggestions || [];
        if (!pins.length || isTyping) return null;
        return (
          <div className="pinned-suggestions">
            <span className="pinned-label">✦ Try this</span>
            <div className="pinned-chips">
              {pins.map(s => (
                <button
                  key={s.id}
                  className="suggestion-chip"
                  style={{ "--chip-color": s.color }}
                  onClick={() => navigate(s.route || `/chat/mood-tracker?activity=${s.id}`)}
                >
                  <span className="chip-emoji">{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Modern Input Region */}
      <div className="chat-input-wrapper">
        <input
          type="text"
          className="chat-input-field"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleUserInput()}
          placeholder={isTyping ? `${selectedMentor} is typing...` : `Talk to ${selectedMentor}...`}
          disabled={isTyping}
          ref={inputRef}
        />
        <button className="send-btn-icon" onClick={isTyping ? undefined : handleUserInput} disabled={isTyping}>
          <FaPaperPlane />
        </button>
      </div>

      {/* Options Sidebar */}
      <div className={`options-sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="sidebar-content">
          <button className="sidebar-close-btn" onClick={() => setShowSidebar(false)} aria-label="Close details">
            <FaTimes />
          </button>
          <div className="sidebar-profile">
            <img 
              src={currentChatbot?.avatar || defaultMentors.find(m => m.name === selectedMentor)?.image} 
              alt="" 
              className="sidebar-avatar-large"
              onError={(e) => { e.target.src = '/assets/default-avatar.png'; }}
            />
            <h2>{currentChatbot?.name || selectedMentor}</h2>
            <p className="sidebar-author">
              By {currentChatbot?.isOfficial ? '@mentora_official' : (
                currentChatbot?.user?.username ? (
                  <span 
                    className="creator-link" 
                    onClick={() => navigate(`/profile/${currentChatbot.user.username}`)}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {currentChatbot.user.name || currentChatbot.user.username}
                  </span>
                ) : (currentChatbot?.user?.name || 'Custom Creator')
              )}
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
            <button className="menu-item" onClick={() => { setShowCustomizer(true); setShowSidebar(false); }}><FaUserCog /> Customize</button>
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

      {/* Customizer Modal */}
      <ChatCustomizer 
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
      />
      {/* Login required modal for guests trying to chat/create */}
      <LoginRequiredModal
        isOpen={showAuthModal}
        onConfirm={() => { setShowAuthModal(false); navigate('/login'); }}
        onCancel={() => setShowAuthModal(false)}
      />
    </div></>
  );
};

export default Chat;
