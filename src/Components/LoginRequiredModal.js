import React from 'react';
import './LoginRequiredModal.css';

// Props:
// - isOpen: boolean
// - title, message: strings
// - onConfirm: navigate to login
// - onCancel: close
// - onContinueAsGuest: optional, if provided shows a "Continue as guest" button
const LoginRequiredModal = ({ isOpen, title = 'Login required', message, onConfirm, onCancel, onContinueAsGuest }) => {
  if (!isOpen) return null;

  return (
    <div className="lr-modal-backdrop">
      <div className="lr-modal">
        <h3 className="lr-title">{title}</h3>
        <p className="lr-message">{message || 'Logging in allows you to save your work, create content, and keep chats across devices. You can continue exploring as a guest, but some actions are restricted.'}</p>
        <div className="lr-actions">
          <button className="create-story-btn lr-confirm" onClick={onConfirm}>Log in / Sign up</button>
          {onContinueAsGuest && (
            <button className="lr-guest" onClick={onContinueAsGuest}>Continue as guest</button>
          )}
          <button className="lr-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
