import React from 'react';
import Chat from "../Components/chat";
import './ChatInterface.css';

const ChatInterface = () => {
  return (
    <div className="chat-interface-container">
      <div className="chat-main-wrapper">
        <Chat />
      </div>
    </div>
  );
};

export default ChatInterface;


