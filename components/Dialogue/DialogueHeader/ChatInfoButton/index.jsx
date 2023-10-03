import React from "react";

const ChatInfoButton = ({  }) => {
  return (
    <div className="m-2 md:m-[.55rem] bg-gray-900 rounded-[.425rem] absolute right-0">
      <button
        className="dashboard-text w-full flex md:mb-0 p-[.775rem] items-center gap-3   hover:bg-gray-500/10 transition-colors duration-200 text-white font-semibold cursor-pointer flex-shrink-0 border border-white/20"

      >
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Chat info
      </button>
    </div>
  );
}

export default ChatInfoButton;
