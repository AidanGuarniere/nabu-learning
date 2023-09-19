import React, { useEffect, useState } from "react";
import ChatIcon from "./Icons/ChatIcon";
import UserIcon from "./Icons/UserIcon";
import AssistantMessage from "./AssistantMessage";
import CornellNotes from "./CornellNotes";
import Flashcards from "./Flashcards";
import UserMessage from "./UserMessage";

function MessageItem({
  message,
  chats,
  selectedChat,
  session,
  setChats,
  currentlyStreamedChatRef,
  setStream,
}) {
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [cornellNoteData, setCornellNoteData] = useState("");
  const [flashcardData, setFlashcardData] = useState("");
  const [isCornellNoteFunction, setIsCornellNoteFunction] = useState(false);
  const [isFlashcardFunction, setIsFlashcardFunction] = useState(false);

  useEffect(() => {
    // check for function calling in gpt responses
    if (message.role === "assistant") {
      const checkCornellNoteFunction =
        message.content &&
        message.content.includes('"functionName": "createCornellNotes"');
      if (checkCornellNoteFunction) {
        setIsCornellNoteFunction(true);
      }

      const checkFlashcardFunction =
        message.content &&
        message.content.includes('"functionName": "generateFlashcards"');
      if (checkFlashcardFunction) {
        setIsFlashcardFunction(true);
      }
    }
  }, [chats]);

  useEffect(() => {
    if (isCornellNoteFunction) {
      setCornellNoteData(message.content);
    }
  }, [chats, isCornellNoteFunction]);

  useEffect(() => {
    if (isFlashcardFunction) {
      setFlashcardData(message.content);
    }
  }, [chats, isFlashcardFunction]);

  // check if the message to be displayed is a function call
  // if so, identify which function was called
  const handleMessageSelect = () => {
    if (message.role === "user" && selectedMessageId !== message["_id"]) {
      setSelectedMessageId(message["_id"]);
    }
  };

  const resetMessageSelect = () => {
    if (message.role === "user") {
      setSelectedMessageId(null);
    }
  };

  return (
    <div
      className={`group w-full text-gray-800 dark:text-gray-100 border-b border-black/10 dark:border-gray-900/50 ${
        message.role === "user"
          ? "bg-white dark:bg-gray-800"
          : "bg-gray-50 dark:bg-[#444654]"
      }`}
      onMouseEnter={handleMessageSelect}
      onClick={handleMessageSelect}
      onMouseLeave={resetMessageSelect}
    >
      <div className="text-base gap-4 md:gap-6 md:max-w-md lg:max-w-2xl xl:max-w-[53.275rem] p-4 md:py-8 flex lg:px-0 m-auto">
        <div className="w-8 h-8 flex flex-col justify-center items-center">
          {message.role === "assistant" ? <ChatIcon /> : <UserIcon />}
        </div>
        <div className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
          {message.role === "assistant" ? (
            isCornellNoteFunction ? (
              <CornellNotes cornellNoteData={cornellNoteData} />
            ) : isFlashcardFunction ? (
              <Flashcards flashcardData={flashcardData} />
            ) : (
              <AssistantMessage message={message.content} />
            )
          ) : (
            <UserMessage
              message={message}
              selectedMessageId={selectedMessageId}
              chats={chats}
              selectedChat={selectedChat}
              session={session}
              setChats={setChats}
              currentlyStreamedChatRef={currentlyStreamedChatRef}
              setStream={setStream}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageItem;
