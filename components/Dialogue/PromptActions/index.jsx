// ERROR WITH CONTINUING CORNELL NOTE CONVERSATIONS, MUST INTEGRATE OPENAI FUNCTION CALLS TO MESSAGE HISTORY

import React, { useState, useEffect } from "react";
import PromptForm from "./PromptForm";
import RegenResponseButton from "./RegenResponseButton";
import { fetchChats, createChat, updateChat } from "../../../utils/chatUtils";
import { sendMessageHistoryToGPT } from "../../../utils/gptUtils";

function PromptActions({
  session,
  setError,
  chats,
  setChats,
  selectedChat,
}) {
  const [loading, setLoading] = useState(false);
  const [showRegen, setShowRegen] = useState(false);
  const [userText, setUserText] = useState("");

  // useEffect(() => {
  //   console.log(chats)
  // }, [chats])

  useEffect(() => {
    if (selectedChat) {
      //  change to selectedChat.messages
      const selectedIndex = chats.findIndex(
        (chat) => chat._id === selectedChat
      );
      const chat = { ...chats[selectedIndex] };
      if (chat && chat.messages) {
        setShowRegen(true);
      }
    } else {
      setShowRegen(false);
    }
  }, [selectedChat, chats]);

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
    // issue may be here w way we are sending function based on gpt response
    messageHistory = updatedChat.messages.map((message) => ({
      role: message.role,
      content: message.content || JSON.stringify(message.function_call),
    }));
    const chatFunctions = updatedChat.functions;
    setUserText("");
    e.target.style.height = "auto";
    return { chatId, messageModel, messageHistory, chatFunctions };
  };

  // confusion here so problem likely
  const handleGPTResponse = async (chatId, messageData) => {
    const updatedChatData = {
      userId: session.user.id,
      messages: messageData,
    };
    const updatedChat = await updateChat(chatId, updatedChatData);
    //updated selectedChat.messages with gpt response
    setChats((prevChats) =>
      prevChats.map((chat) => (chat._id === chatId ? updatedChat : chat))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userText.length >= 1) {
      setLoading(true);
      setShowRegen(false);
      setError(null);
      try {
        // create Chat based on user prompt
        const messageData = await createMessageData(e);
        let gptResponse;
        // send Chat message data to GPT API
        if (messageData.chatFunctions.length) {
          gptResponse = await sendMessageHistoryToGPT({
            model: messageData.messageModel,
            messageHistory: messageData.messageHistory,
            functions: messageData.chatFunctions,
            function_call: "auto",
          });
        } else {
          gptResponse = await sendMessageHistoryToGPT({
            model: messageData.messageModel,
            messageHistory: messageData.messageHistory,
          });
        }

        // update Chat with GPT response
        await handleGPTResponse(messageData.chatId, gptResponse);
        setLoading(false);
        setShowRegen(true);
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
      try {
        const chatIndex = chats.findIndex((chat) => chat._id === selectedChat);
        let updatedChat = { ...chats[chatIndex] };
  
        const messageData = updatedChat.messages
          .slice(0, -1)
          .map((message) => ({
            role: message.role,
            content: message.content || JSON.stringify(message.function_call),
          }));
  
        const gptResponse = await sendMessageHistoryToGPT({
          model: updatedChat.chatPreferences.selectedModel,
          messageHistory: messageData,
          functions: updatedChat.functions,
          function_call: "auto",
        });
  
        if (gptResponse && gptResponse.length > 0) {
          messageData[messageData.length - 1] = gptResponse[gptResponse.length - 1];
        }
  
        updatedChat = { ...updatedChat, messages: messageData };
  
        await updateChat(selectedChat, updatedChat);
        const updatedChats = await fetchChats();
        setChats(updatedChats);
        setLoading(false);
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
