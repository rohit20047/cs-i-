import React from "react";
import MessageBubble from "./MessageBubble";
import ChatOptions from "./ChatOptions";
import ChatLoading from "./ChatLoading";

const ChatMessages = ({ 
  messages, 
  showOptions, 
  isLoading, 
  messagesEndRef, 
  onOptionSelect,
  showTypingIndicator  // Add this prop
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-80 bg-gray-700">
     {messages.map((message, index) => (
      <MessageBubble key={index} message={message} />
    ))}

      {/* Show typing indicator when it's active */}
      {showTypingIndicator && <ChatLoading />}

      {showOptions && <ChatOptions onOptionSelect={onOptionSelect} />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;