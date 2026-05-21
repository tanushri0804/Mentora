import React from 'react';
import { FaTrash, FaTimes } from 'react-icons/fa';
import './DeleteChatModal.css';

const DeleteChatModal = ({ isOpen, onClose, onConfirm, mentorName }) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">
        <div className="delete-modal-header">
          <FaTrash className="delete-icon" />
          <h3>Delete Chat History</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="delete-modal-content">
          <p>Are you sure you want to permanently delete all messages with <strong>{mentorName}</strong>? This action cannot be undone and will remove the entire conversation history.</p>
          <ul className="delete-list">
            <li>📝 All chat messages</li>
            <li>💭 Conversation history</li>
            <li>🔄 Session data</li>
          </ul>
        </div>
        
        <div className="delete-modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-delete-btn" onClick={onConfirm}>
            <FaTrash /> Delete Everything
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteChatModal;
