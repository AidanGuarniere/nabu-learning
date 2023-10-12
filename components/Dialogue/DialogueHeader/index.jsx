import React, { useState } from "react";
import ChatInfoButton from "./ChatInfoButton";
import ChatInfoForm from "./ChatInfoForm";

const DialogueHeader = ({ chats, setChats, selectedChatIndex, session }) => {
  const [showChatInfoForm, setShowChatInfoForm] = useState(false);

  return (
    <div className="fixed z-10 inset-0 md:pl-[260px] flex md:justify-center items-center h-[2.5rem] py-2 w-full border-b border-gray-500/20 bg-gray-100 ">
      <div className="w-1/6 md:w-0 md:hidden"></div>
      <span className="text-center md:text-left text-gray-500 w-3/5 px-4 md:px-0 md:w-auto whitespace-nowrap truncate">
        {chats[selectedChatIndex].chatPreferences.topic},{" "}
        {chats[selectedChatIndex].chatPreferences.mode === "Tutor Session"
          ? chats[selectedChatIndex].chatPreferences.tutorName
          : chats[selectedChatIndex].chatPreferences.mode === "Note Generation"
          ? `${chats[selectedChatIndex].chatPreferences.noteType} Notes`
          : "Flashcards"}{" "}
      </span>
      <ChatInfoButton
        showChatInfoForm={showChatInfoForm}
        setShowChatInfoForm={setShowChatInfoForm}
      />
      {showChatInfoForm && (
        <ChatInfoForm
          setShowChatInfoForm={setShowChatInfoForm}
          chat={chats[selectedChatIndex]}
          setChats={setChats}
        />
      )}
    </div>
    
  );
};

export default DialogueHeader;
{/* <div className="fixed z-10 inset-0 md:pl-[260px] flex md:justify-center items-center h-[3.5rem] py-8 w-full border-b border-gray-500/20 bg-gray-100 ">
<div className="w-1/6"></div>
<span className="text-center md:text-left text-gray-500 w-3/5 px-4 whitespace-nowrap truncate">
  {chats[selectedChatIndex].chatPreferences.topic},{" "}
  {chats[selectedChatIndex].chatPreferences.mode === "Tutor Session"
    ? chats[selectedChatIndex].chatPreferences.tutorName
    : chats[selectedChatIndex].chatPreferences.mode === "Note Generation"
    ? `${chats[selectedChatIndex].chatPreferences.noteType} Notes`
    : "Flashcards"}{" "}
</span>
<ChatInfoButton
  showChatInfoForm={showChatInfoForm}
  setShowChatInfoForm={setShowChatInfoForm}
/>
{showChatInfoForm && (
  <ChatInfoForm
    setShowChatInfoForm={setShowChatInfoForm}
    chat={chats[selectedChatIndex]}
    setChats={setChats}
  />
)}
</div> */}