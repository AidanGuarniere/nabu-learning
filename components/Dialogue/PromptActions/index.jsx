import React, { useState, useEffect } from "react";
import PromptForm from "./PromptForm";
import RegenResponseButton from "./RegenResponseButton";
import streamGptResponse from "../../../utils/streamGptResponse";

function PromptActions({ session, setError, chats, setChats, selectedChat, currentlyStreamedChatRef }) {
  const [loading, setLoading] = useState(false);
  const [showRegen, setShowRegen] = useState(false);
  const [userText, setUserText] = useState("");
  const [stream, setStream] = useState("");

  useEffect(() => {
    if (stream.length) {
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
  }, [stream]);

  // useEffect(() => {
  //   if (selectedChat) {
  //     //  change to selectedChat.messages
  //     const selectedIndex = chats.findIndex(
  //       (chat) => chat._id === selectedChat
  //     );
  //     const chat = { ...chats[selectedIndex] };
  //     if (chat && chat.messages) {
  //       setShowRegen(true);
  //     }
  //   } else {
  //     setShowRegen(false);
  //   }
  // }, [selectedChat, chats]);

  const createMessageData = async (e) => {
    let messageHistory = [];
    //  change to selectedChat.id
    let chatId = selectedChat;
    //  change to selectedChat.model
    //change to selectedChat
    const selectedIndex = chats.findIndex((chat) => chat._id === selectedChat);
    //change to selectedChat
    const updatedChat = { ...chats[selectedIndex] };
    const messageModel = updatedChat.chatPreferences.selectedModel;
    updatedChat.messages.push({
      role: "user",
      content: userText,
    });
    //  change to setSelectedChat(updatedChat), filter extra message properties
    let updatedChats = [...chats];
    updatedChats[selectedIndex] = updatedChat;
    setChats(updatedChats);
    messageHistory = updatedChat.messages.map((message) => ({
      role: message.role,
      content: message.content || JSON.stringify(message.function_call),
    }));
    const chatFunctions = updatedChat.functions;
    setUserText("");
    e.target.style.height = "auto";
    return { chatId, messageModel, messageHistory, chatFunctions };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if user has typed something into promptform
    if (userText.length >= 1) {
      // set ui states to show request is in progress
      setLoading(true);
      setShowRegen(false);
      setError(null);
      setStream("");

      try {
        // get exisitng message history from chats state + submitted user prompt via usertext to create gpt request payload
        const messageData = await createMessageData(e);
        const gptRequestPayload = {
          model: messageData.messageModel,
          messages: messageData.messageHistory,
        };

        // check if chat uses function calling
        if (messageData.chatFunctions.length) {
          gptRequestPayload.functions = messageData.chatFunctions;
          gptRequestPayload.function_call = "auto";
        }

        // send gptRequestPayload to proxy/gpt endpoint which will submit it to the OpenAI chat completions api and stream the response back to the client
        streamGptResponse(gptRequestPayload, chats, selectedChat, currentlyStreamedChatRef, setStream);
      } catch (error) {
        setShowRegen(true);
        setError(error);
        setLoading(false);
      }
    } else {
      console.error("Please enter a valid prompt");
    }
  };

  const handleRegen = async () => {
    if (selectedChat) {
      setLoading(true);
      setError(null);
      setStream(""); // Clear the stream content for a fresh start

      try {
        const chatIndex = chats.findIndex((chat) => chat._id === selectedChat);
        let updatedChat = { ...chats[chatIndex] };

        const messageData = updatedChat.messages
          .slice(0, -1)
          .map((message) => ({
            role: message.role,
            content: message.content || JSON.stringify(message.function_call),
          }));

        const gptRequestPayload = {
          model: updatedChat.chatPreferences.selectedModel,
          messages: messageData,
        };

        if (updatedChat.functions && updatedChat.functions.length > 0) {
          gptRequestPayload.functions = updatedChat.functions;
          gptRequestPayload.function_call = "auto";
        }

        streamGptResponse(gptRequestPayload, chats, selectedChat, currentlyStreamedChatRef, setStream);

      } catch (error) {
        setError(error);
        setLoading(false);
      }
    }
  };

  return (
    <div className="md:pl-[260px] absolute bottom-0 left-0 w-full pt-8 pb-24 md:pb-12 bg-vert-light-gradient dark:bg-gray-800 md:!bg-transparent dark:md:bg-vert-dark-gradientborder-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent">
      {!loading && (
        <RegenResponseButton
          handleRegen={handleRegen}
          loading={loading}
          showRegen={showRegen}
        />
      )}
      <PromptForm
        userText={userText}
        setUserText={setUserText}
        handleSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
export default PromptActions;
