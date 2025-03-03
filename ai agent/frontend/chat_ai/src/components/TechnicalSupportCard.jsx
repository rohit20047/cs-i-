import React from "react";
import { PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, TicketIcon } from "@heroicons/react/24/outline";

const TechnicalSupportCard = ({ supportInfo }) => {
  if (!supportInfo) return null;

  const { supportTeamInfo, contactOptions, ticketInfo, message } = supportInfo;

  // Sort contact options by priority
  const sortedContactOptions = [...contactOptions].sort((a, b) => a.priority - b.priority);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-blue-500 shadow-lg max-w-md">
      {/* Header */}
      <div className="mb-4 border-b border-gray-700 pb-3">
        <h3 className="text-xl font-bold text-white mb-1">{supportTeamInfo.name}</h3>
        <p className="text-blue-400 text-sm">{supportTeamInfo.availability}</p>
        <p className="text-gray-300 text-sm mt-2">{message}</p>
      </div>

      {/* Contact Options */}
      <div className="space-y-3 mb-4">
        <h4 className="text-white font-semibold">Contact Options:</h4>
        {sortedContactOptions.map((option, index) => (
          <div key={index} className="flex items-start space-x-3 p-2 bg-gray-800 rounded-md">
            {option.method === "Live Chat" && (
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-500 mt-0.5" />
            )}
            {option.method === "Phone" && <PhoneIcon className="h-5 w-5 text-blue-500 mt-0.5" />}
            {option.method === "Email" && <EnvelopeIcon className="h-5 w-5 text-yellow-500 mt-0.5" />}
            {option.method === "Support Portal" && <TicketIcon className="h-5 w-5 text-purple-500 mt-0.5" />}
            <div>
              <div className="text-white font-medium">{option.method}</div>
              <div className="text-gray-400 text-sm">{option.details}</div>
              {option.url && (
                <a
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-sm hover:text-blue-300 inline-block mt-1"
                >
                  Connect Now →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Info */}
      <div className="bg-blue-900/30 p-3 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-medium">Ticket Priority:</span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              ticketInfo.priority === "High" ? "bg-red-500" : "bg-yellow-500"
            } text-white`}
          >
            {ticketInfo.priority}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">Est. Response Time:</span>
          <span className="text-white">{ticketInfo.estimatedResponseTime}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-300">Reference Code:</span>
          <span className="text-white font-mono">{ticketInfo.referenceCode}</span>
        </div>
      </div>
    </div>
  );
};

export default TechnicalSupportCard;
