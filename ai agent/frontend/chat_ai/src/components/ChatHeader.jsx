import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useDispatch } from "react-redux";
import { clearSession } from "../redux/chatSlice";

const ChatHeader = () => {
  const [liked, setLiked] = useState(false);
  const dispatch = useDispatch();

  const handleHeartClick = () => {
    setLiked(!liked);

    // If the heart is being clicked to "like" (not unlike), end the session
    if (!liked) {
      // Show thank you message for a moment before clearing
      setTimeout(() => {
        dispatch(clearSession());
        // Reset the heart after clearing the session
        setLiked(false);
        // Refresh the page
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <div className="bg-gray-900 shadow-lg p-4 flex items-center justify-between">
      {/* Profile Section (Left) */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src="https://randomuser.me/api/portraits/men/75.jpg" // Change to dynamic profile URL
            alt="User Profile"
            className="h-10 w-10 rounded-full border-2 border-green-400 shadow-lg"
          />
          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
        </div>
        <div className="text-white">
          <p className="font-semibold">John Doe</p>
          <p className="text-sm text-gray-300">Support Agent</p>
        </div>
      </div>

      {/* Heart Icon (Right) */}
      <div className="flex items-center space-x-2">
        {liked && <span className="text-green-400 text-sm">Thank you! We will meet again</span>}
        <Heart
          className={`h-6 w-6 cursor-pointer ${
            liked ? "fill-green-500 text-green-500" : "text-gray-400"
          }`}
          onClick={handleHeartClick}
        />
      </div>
    </div>
  );
};

export default ChatHeader;