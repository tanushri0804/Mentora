import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaEdit, FaClock, FaComment } from 'react-icons/fa';
import './ChatHistory.css';

const ChatHistory = ({ aiId, mentorName, isOpen, onClose, onSelectSession }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSession, setEditingSession] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const navigate = useNavigate();

  // Define functions before using them
  const loadChatSessions = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('mentora_token');
      
      const response = await fetch(`http://localhost:5000/api/sessions/ai/${aiId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSessions(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [aiId]);

  useEffect(() => {
    if (isOpen && aiId) {
      loadChatSessions();
    }
  }, [isOpen, aiId, loadChatSessions]);

  const createNewChat = async () => {
    try {
      const token = localStorage.getItem('mentora_token');
      
      const response = await fetch('http://localhost:5000/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          aiId: aiId,
          title: 'New Chat'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Load updated sessions
          loadChatSessions();
          // Select the new session
          onSelectSession(data.data.id);
          // Close history panel
          onClose();
          // Navigate to chat with the new session
          navigate(`/chat/${mentorName}?sessionId=${data.data.id}`);
        }
      }
    } catch (error) {
      console.error('Failed to create new chat session:', error);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      const token = localStorage.getItem('mentora_token');
      
      const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Remove session from local state
          setSessions(sessions.filter(session => session.id !== sessionId));
        }
      }
    } catch (error) {
      console.error('Failed to delete chat session:', error);
    }
  };

  const updateSessionTitle = async (sessionId) => {
    try {
      const token = localStorage.getItem('mentora_token');
      
      const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}/title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update session in local state
          setSessions(sessions.map(session => 
            session.id === sessionId 
              ? { ...session, title: newTitle }
              : session
          ));
          setEditingSession(null);
          setNewTitle('');
        }
      }
    } catch (error) {
      console.error('Failed to update session title:', error);
    }
  };

  const selectChatSession = (session) => {
    onSelectSession(session.id);
    onClose();
    navigate(`/chat/${mentorName}?sessionId=${session.id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-history-overlay">
      <div className="chat-history-panel">
        <div className="chat-history-header">
          <h3>Chat History</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="new-chat-section">
          <button className="new-chat-btn" onClick={createNewChat}>
            <FaPlus /> New Chat
          </button>
        </div>

        <div className="sessions-list">
          {loading ? (
            <div className="loading">Loading chat history...</div>
          ) : sessions.length === 0 ? (
            <div className="empty-state">
              <p>No chat history yet</p>
              <p>Start a new conversation to see it here!</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="session-item">
                <div className="session-content" onClick={() => selectChatSession(session)}>
                  <div className="session-info">
                    {editingSession === session.id ? (
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onBlur={() => updateSessionTitle(session.id)}
                        onKeyPress={(e) => e.key === 'Enter' && updateSessionTitle(session.id)}
                        className="session-title-input"
                        autoFocus
                      />
                    ) : (
                      <h4 className="session-title">{session.title}</h4>
                    )}
                    <div className="session-meta">
                      <span className="session-time">
                        <FaClock /> {formatDate(session.updatedAt)}
                      </span>
                      <span className="session-count">
                        <FaComment /> {session.messageCount} messages
                      </span>
                    </div>
                  </div>
                  {session.lastMessage && (
                    <p className="session-preview">
                      {session.lastMessage.content.substring(0, 100)}
                      {session.lastMessage.content.length > 100 && '...'}
                    </p>
                  )}
                </div>
                <div className="session-actions">
                  <button 
                    className="action-btn edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSession(session.id);
                      setNewTitle(session.title);
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this chat session?')) {
                        deleteSession(session.id);
                      }
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
