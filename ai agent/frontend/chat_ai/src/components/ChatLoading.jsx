import React from "react";
import aiImage from "../assets/agent.png";

const ChatLoading = () => (
  <div className="flex justify-start">
    {/* AI Avatar */}
    <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center mr-2 shrink-0 overflow-hidden">
      <img
        src={aiImage || "/placeholder.svg"}
        alt="AI Logo"
        className="h-full w-full object-cover"
      />
    </div>

    {/* Chat Bubble */}
    <div
      className="bg-transparent border-2 border-blue-500 shadow-sm text-gray-900 px-4 py-3 rounded-lg rounded-bl-none max-w-xs flex items-center space-x-2"
    >
      {/* Typing Text */}
      <div className="font-mono text-sm font-light tracking-wider leading-normal text-white">
        Typing
      </div>

      {/* Bouncing Dots */}
      <div className="flex space-x-1">
        <div
          className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
        <div
          className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"
          style={{ animationDelay: "600ms" }}
        ></div>
      </div>
    </div>
  </div>
);

export default ChatLoading;