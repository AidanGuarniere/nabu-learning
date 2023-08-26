import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import ErrorDisplay from "../ErrorDisplay";
import PromptActions from "./PromptActions";
import ChatScrollButton from "./ChatScrollButton";
import MessageList from "./MessageList";
import ChatPreferenceForm from "./ChatPreferenceForm";

function Dialogue({
  session,
  userText,
  setUserText,
  error,
  setError,
  chats,
  setChats,
  selectedChat,
  setSelectedChat,
  selectedChatLoading,
}) {
  const chatRef = useRef(null);
  const [scrollHeight, setScrollHeight] = useState();
  const [prevSelectedChat, setPrevSelectedChat] = useState(null);
  const [prevMessageCount, setPrevMessageCount] = useState(0);
  const selectedChatIndex = chats.findIndex(
    //change to .id
    (chat) => chat._id === selectedChat
  );

  useLayoutEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chats]);

  useEffect(() => {
    if (selectedChatLoading === false && selectedChat !== null) {
      const currentChat =
        //chande to .id
        chats[chats.findIndex((chat) => chat._id === selectedChat)];
      if (
        chatRef.current &&
        (prevSelectedChat !== selectedChat ||
          currentChat.messages.length !== prevMessageCount)
      ) {
        // L solution for attempted scroll before message render
        if (chatRef.current) {
          setTimeout(() => {
            chatRef.current.scrollTo({
              top: chatRef.current.scrollHeight,
              behavior: "auto",
            });
          }, 100);
        }
        if (currentChat.messages) {
          setPrevMessageCount(currentChat.messages.length);
        }
      }
    }
    setPrevSelectedChat(selectedChat);
  }, [
    chats,
    selectedChat,
    selectedChatLoading,
    prevMessageCount,
    prevSelectedChat,
  ]);

  return (
    <div className="md:pl-[260px] w-full h-full p-0 m-0 overflow-hidden bg-white dark:bg-gray-800">
      <div className="flex chat w-full h-full">
        {error ? (
          <ErrorDisplay error={error} />
        ) : selectedChat !== null && chats[selectedChatIndex]?.messages ? (
          <div
            className=" overflow-y-scroll p-0 w-full h-full"
            ref={chatRef}
            key={selectedChat}
            onScroll={() => {
              setScrollHeight(chatRef.current.scrollTop);
            }}
          >
            <div className="flex justify-center items-center h-10 w-full border-b border-gray-500/20">
              <span className="text-center md:text-left text-gray-500">
                {chats[selectedChatIndex].chatPreferences.topic},{" "}
                {chats[selectedChatIndex].chatPreferences.tutorName
                  ? chats[selectedChatIndex].chatPreferences.tutorName
                  : `${chats[selectedChatIndex].chatPreferences.noteType} Notes`}{" "}
                
              </span>
            </div>
            <MessageList
              chats={chats}
              selectedChat={selectedChat}
              session={session}
              setChats={setChats}
            />
            <ChatScrollButton chatRef={chatRef} scrollHeight={scrollHeight} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full ">
            <ChatPreferenceForm
              session={session}
              setError={setError}
              setChats={setChats}
              setSelectedChat={setSelectedChat}
            />
          </div>
        )}
        {selectedChat && (
          <PromptActions
            session={session}
            setError={setError}
            userText={userText}
            setUserText={setUserText}
            chats={chats}
            setChats={setChats}
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            chatRef={chatRef}
          />
        )}
      </div>
    </div>
  );
}
export default Dialogue;