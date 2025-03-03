import React from "react";
import boy from "../assets/boy.png";
import man from "../assets/agent.png";
import TechnicalSupportCard from "./TechnicalSupportCard";

const MessageBubble = ({ message }) => {
  // Check if this is a technical support message
  const hasTechnicalSupport = message.sender === "ai" && 
    message.supportInfo && 
    message.supportInfo.contactOptions;

  return (
    <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
      {message.sender === "ai" && (
        <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center mr-2 shrink-0 overflow-hidden">
          <img src={man} alt="AI Logo" className="h-full w-full object-cover" />
        </div>
      )}
      <div
        className={`${
          message.sender === "user"
            ? "max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-br-none shadow-lg border-2 border-blue-400/50"
            : hasTechnicalSupport
            ? "max-w-md" // Wider container for technical support card
            : message.isError
            ? "max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg bg-red-100 text-red-800 rounded-bl-none border-2 border-red-300/70 shadow-md"
            : "max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg bg-transparent text-white rounded-bl-none shadow-md border-2 border-gray-200/80"
        }`}
      >
        {hasTechnicalSupport ? (
          <TechnicalSupportCard supportInfo={message.supportInfo} />
        ) : (
          <div
            className={`${
              message.sender === "user"
                ? "font-sans text-base font-semibold tracking-tight leading-snug drop-shadow-sm"
                : "font-mono text-sm font-medium tracking-wide leading-relaxed text-white italic"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
      {message.sender === "user" && (
        <div className="h-8 w-8 rounded-full flex items-center justify-center ml-2 shrink-0 overflow-hidden">
          <img src={boy} alt="User Avatar" className="h-full w-full object-cover" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;