import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import ErrorDisplay from "../ErrorDisplay";
import PromptActions from "./PromptActions";
import ChatScrollButton from "./ChatScrollButton";
import MessageList from "./MessageList";
import ChatPreferenceForm from "./ChatPreferenceForm";
import streamGptResponse from "../../utils/streamGptResponse";

function Dialogue({
  session,
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
  const [stream, setStream] = useState("");
  const currentlyStreamedChatRef = useRef({});
  const selectedChatIndex = chats.findIndex(
    //change to .id
    (chat) => chat._id === selectedChat
  );

  // useEffect(() => {
  //   console.log("chats", chats);

  //   console.log("selectedChat", selectedChat);
  // }, [chats, selectedChat]);

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
              behavior: "smooth",
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

  useEffect(() => {
    // trigger for new gpt interaction & stream update
    setStream("");
    if (selectedChat && currentlyStreamedChatRef.current.model) {
      const gptRequestPayload = currentlyStreamedChatRef.current;
      streamGptResponse(
        gptRequestPayload,
        chats,
        selectedChat,
        currentlyStreamedChatRef,
        setStream
      );
    }
  }, [currentlyStreamedChatRef, selectedChat]);

  useEffect(() => {
    // update chats state as stream occurs
    if (stream.length && selectedChat) {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat._id === selectedChat) {
            const updatedChat = { ...chat };
            if (!updatedChat.messages) {
              updatedChat.messages = [];
            }
            const lastMessage =
              updatedChat.messages[updatedChat.messages.length - 1];
            if (lastMessage && lastMessage.role === "assistant") {
              lastMessage.content = stream;
            } else {
              updatedChat.messages.push({
                role: "assistant",
                content: stream,
              });
            }
            return updatedChat;
          }
          return chat;
        })
      );
    }
  }, [selectedChat, stream]);

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
                {chats[selectedChatIndex].chatPreferences.mode ===
                "Tutor Session"
                  ? chats[selectedChatIndex].chatPreferences.tutorName
                  : chats[selectedChatIndex].chatPreferences.mode ===
                    "Note Generation"
                  ? `${chats[selectedChatIndex].chatPreferences.noteType} Notes`
                  : "Flashcards"}{" "}
              </span>
            </div>
            <MessageList
              chats={chats}
              selectedChat={selectedChat}
              session={session}
              setChats={setChats}
              currentlyStreamedChatRef={currentlyStreamedChatRef}
              setStream={setStream}
            />
            <ChatScrollButton chatRef={chatRef} scrollHeight={scrollHeight} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full ">
            <ChatPreferenceForm
              session={session}
              setError={setError}
              currentlyStreamedChatRef={currentlyStreamedChatRef}
              setChats={setChats}
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
            />
          </div>
        )}
        {selectedChat && (
          <PromptActions
            session={session}
            setError={setError}
            chats={chats}
            setChats={setChats}
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            chatRef={chatRef}
            currentlyStreamedChatRef={currentlyStreamedChatRef}
            stream={stream}
            setStream={setStream}
          />
        )}
      </div>
    </div>
  );
}
export default Dialogue;
