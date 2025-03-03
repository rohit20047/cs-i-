import React from "react";
import { Package, LifeBuoy } from "lucide-react"; // Lucide Icons
import clsx from "clsx"; // Utility for conditional classNames

const ChatOptions = ({ onOptionSelect }) => (
  <div className="flex justify-center mt-2">
    <div className="bg-gray-800 rounded-xl shadow-lg p-4 w-full max-w-sm">
      
      <div className="flex flex-col gap-3">
        {/* <button
          onClick={() => onOptionSelect("product")}
          className={clsx(
            "flex items-center justify-center gap-2 text-blue-500 border border-blue-500",
            "hover:bg-blue-500 hover:text-white transition-all",
            "text-sm font-medium py-3 px-4 rounded-full shadow-md hover:shadow-lg"
          )}
        >
          <Package className="w-5 h-5" />
          New Product Request
        </button> */}
        {/* <button
          onClick={() => onOptionSelect("support")}
          className={clsx(
            "flex items-center justify-center gap-2 text-green-500 border border-green-500",
            "hover:bg-green-500 hover:text-white transition-all",
            "text-sm font-medium py-3 px-4 rounded-full shadow-md hover:shadow-lg"
          )}
        >
          <LifeBuoy className="w-5 h-5" />
          Technical Support
        </button> */}
      </div>
    </div>
  </div>
);

export default ChatOptions;
