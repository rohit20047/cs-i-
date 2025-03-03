import React from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import useChatLogic from "../hooks/useChatLogic";

const ChatInterface = () => {
  const {
    messages,
    inputValue,
    isLoading,
    showOptions,
    currentStep,
    messagesEndRef,
    showTypingIndicator, // Get this from useChatLogic
    handleInputChange,
    handleOptionSelect,
    handleSubmit,
  } = useChatLogic();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-500 via-gray-500 to-blue-500">
      <div className="flex flex-col h-[500px] w-[400px] bg-gradient-to-t from-gray-800 to-gray-600 rounded-lg shadow-xl overflow-hidden">
        <ChatHeader />
        <ChatMessages
          messages={messages}
          // showOptions={showOptions}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
          onOptionSelect={handleOptionSelect}
          showTypingIndicator={showTypingIndicator} // Pass this prop
        />
        <ChatInput
          inputValue={inputValue}
          isLoading={isLoading}
          currentStep={currentStep}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default ChatInterface;