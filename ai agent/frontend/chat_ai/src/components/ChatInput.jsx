import React, { useState, useRef, useEffect } from "react";

const ChatInput = ({ inputValue: propInputValue, isLoading, currentStep, onInputChange, onSubmit }) => {
  const [inputValue, setInputValue] = useState(propInputValue || "");
  const [error, setError] = useState(""); // State for error message
  const inputRef = useRef(null);

  // Effect to focus the input whenever isLoading changes from true to false
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const getPlaceholder = () => {
    console.log("currentStep", currentStep)
    switch (currentStep) {
      case "emailInput":
        return "Enter your email address...";
      case "usernameInput":
        return "Enter your full name...";
      case "productInput":
        return "Enter product name...";
      default:
        return "Type your message...";
    }
  };

  // Email validation function using regex
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return; // Prevent empty or loading submissions

    // Check email format when in emailInput step
    if (currentStep === "emailInput") {
      if (!isValidEmail(inputValue)) {
        setError("Please enter a valid email address");
        return; // Stop submission if email is invalid
      }
    }

    setError(""); // Clear any previous error
    onSubmit(e); // Call the parent's onSubmit
    setInputValue(""); // Clear the input locally
    onInputChange({ target: { value: "" } }); // Notify parent of the cleared value

    if (inputRef.current) {
      inputRef.current.focus(); // Focus the input after submission
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value); // Update local state
    onInputChange(e); // Pass the change to the parent
    setError(""); // Clear error when user types
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-700 p-4 border-t border-gray-700">
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={getPlaceholder()}
          className={`flex-1 border ${
            error ? "border-red-500" : "border-gray-600"
          } rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans text-base tracking-wide text-white bg-gray-800 placeholder-gray-400`}
          disabled={isLoading}
          ref={inputRef}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className={`bg-blue-600 text-white rounded-full px-6 py-3 font-medium font-sans tracking-wide ${
            isLoading || !inputValue.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          <span className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>} {/* Display error message */}
    </form>
  );
};

export default ChatInput;