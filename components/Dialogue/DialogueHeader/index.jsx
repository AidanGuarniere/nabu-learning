import React from "react";
import ChatInfoButton from "./ChatInfoButton";

const DialogueHeader = ({ chats, selectedChatIndex }) => {
  return (
    <div className="fixed z-10 inset-0 md:pl-[260px] flex justify-center items-center h-[4rem] w-full border-b border-gray-500/20 bg-gray-100 ">
      <span className="text-center md:text-left text-gray-500">
        {chats[selectedChatIndex].chatPreferences.topic},{" "}
        {chats[selectedChatIndex].chatPreferences.mode === "Tutor Session"
          ? chats[selectedChatIndex].chatPreferences.tutorName
          : chats[selectedChatIndex].chatPreferences.mode === "Note Generation"
          ? `${chats[selectedChatIndex].chatPreferences.noteType} Notes`
          : "Flashcards"}{" "}
      </span>
      <ChatInfoButton />
    </div>
  );
};

export default DialogueHeader;
