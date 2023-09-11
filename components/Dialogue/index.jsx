import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import ErrorDisplay from "../ErrorDisplay";
import PromptActions from "./PromptActions";
import ChatScrollButton from "./ChatScrollButton";
import MessageList from "./MessageList";
import ChatPreferenceForm from "./ChatPreferenceForm";
import { createParser, ParsedEvent } from "eventsource-parser";

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

  useEffect(() => {
    if (selectedChat && currentlyStreamedChatRef.current.model) {
      setStream("");
      streamGptResponse(currentlyStreamedChatRef.current);
    }
  }, [currentlyStreamedChatRef, selectedChat]);

  useEffect(() => {
    // console.log(stream);
    // console.log("selectedChat",selectedChat)
    if (stream.length && selectedChat) {
      // console.log(stream);
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
  const streamGptResponse = async (gptRequestPayload) => {
    const response = await fetch("/api/proxy/gpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gptRequestPayload),
    });

    // basic error handling
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // handle streamed response using eventsource-parser
    const data = response.body;
    // if stream is sending data
    if (data) {
      const onParse = (event) => {
        // watch for data events
        if (event.type === "event") {
          const eventData = event.data;
          try {
            // parse chunk to json {"text": "value"}
            const parsedChunk = JSON.parse(eventData);
            if (parsedChunk.text) {
              console.log(parsedChunk);
              setStream((prev) => prev + parsedChunk.text);
            }
          } catch (e) {
            console.error("Error parsing JSON: ", eventData);
          }
        }
      };

      // eventsource-parser functions to read and decode chunks
      const reader = data.getReader();
      const decoder = new TextDecoder();

      const parser = createParser(onParse);
      let done = false;
      // track last chunk processed for coherent updates to chats state
      let lastChunkProcessed = "";
      while (!done) {
        // check for chunk value and done status
        const { value, done: doneReading } = await reader.read();
        // update done status from current chunk
        done = doneReading;
        // decode chunk value to string
        let chunkValue = decoder.decode(value);
        if (lastChunkProcessed) {
          // Check for overlap:
          let overlapIndex = chunkValue.indexOf(lastChunkProcessed);

          // If overlap found, adjust the chunk value:
          if (overlapIndex === 0) {
            chunkValue = chunkValue.substring(lastChunkProcessed.length);
          }
        }

        // At the end, set lastChunkProcessed:
        lastChunkProcessed = chunkValue;
        parser.feed(chunkValue);
      }
      if (done) {
        currentlyStreamedChatRef.current = {};
      }
    }
  };

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
          />
        )}
      </div>
    </div>
  );
}
export default Dialogue;
