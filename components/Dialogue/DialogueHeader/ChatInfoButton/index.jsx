import React, { useState } from "react";

const ChatInfoButton = ({ showChatInfoForm, setShowChatInfoForm }) => {
  return (
    <div className="absolute right-1 md:right-2 md:m-[.55rem]">
      <button
        className=" w-full flex md:mb-0 px-1.5 py-1 md:p-2.5 items-center gap-3 hover:bg-green-200 transition-colors duration-200 text-white font-light cursor-pointer flex-shrink-0 bg-green-400 rounded-[.425rem]"
        onClick={() => {
          setShowChatInfoForm(!showChatInfoForm);
        }}
      >
        {/* <svg
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
        </svg> */}
        Chat info
      </button>
    </div>
  );
};

export default ChatInfoButton;
