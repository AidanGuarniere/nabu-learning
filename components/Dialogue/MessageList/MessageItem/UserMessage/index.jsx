import React, { useState, useEffect } from "react";
import streamGptResponse from "../../../../../utils/streamGptResponse";
import { updateChat, fetchChats } from "../../../../../utils/chatUtils";

function UserMessage({
  message,
  selectedMessageId,
  chats,
  selectedChat,
  session,
  setChats,
  currentlyStreamedChatRef,
  setStream
}) {
  const [editMessageId, setEditMessageId] = useState(null);
  const [editedMessage, setEditedMessage] = useState("");

  const handleEditToggle = (messageId) => {
    if (editMessageId === messageId) {
      setEditMessageId(null);
    } else {
      setEditMessageId(messageId);
    }
  };
  

  const createEditedMessageData = async (e) => {
    // find selected chat and selected message
    const chatId = selectedChat;
    const selectedChatIndex = chats.findIndex(
      (chat) => chat._id === selectedChat
    );
    const updatedChat = { ...chats[selectedChatIndex] };
    const messageIndex = updatedChat.messages.findIndex(
      (msg) => msg._id === editMessageId
    );
    // get data from chats for gpt request
    const messageModel = updatedChat.chatPreferences.selectedModel;
    const chatFunctions = updatedChat.functions;

    // remove old message, push new edited message
    const updatedMessageData = updatedChat.messages.slice(0, messageIndex);
    updatedMessageData.push({
      role: "user",
      content: editedMessage,
    });
    // create messageHistory from the role and content data of each messaeg
    const messageHistory = updatedMessageData.map((message) => ({
      role: message.role,
      content: message.content || JSON.stringify(message.function_call),
    }));
    updatedChat.messages = messageHistory
    const updatedChats = [...chats];
    updatedChats[selectedChatIndex] = updatedChat;
    setChats(updatedChats);
    e.target.style.height = "auto";
    return { chatId, messageModel, messageHistory, chatFunctions };
  };

  const handleMessageEdit = async (e) => {
    e.preventDefault();

    const messageData = await createEditedMessageData(e);
    const gptRequestPayload = {
      model: messageData.messageModel,
      messages: messageData.messageHistory,
    };

    // check if chat uses function calling
    if (messageData.chatFunctions.length) {
      gptRequestPayload.functions = messageData.chatFunctions;
      gptRequestPayload.function_call = {name: messageData.chatFunctions[0].name};
    }

    // send gptRequestPayload to proxy/gpt endpoint which will submit it to the OpenAI chat completions api and stream the response back to the client
    streamGptResponse(gptRequestPayload, chats, selectedChat, currentlyStreamedChatRef, setStream);

    setEditMessageId(null);
    setEditedMessage("");
  };

  const handleCancel = () => {
    setEditMessageId(null);
    setEditedMessage("");
  };
  return (
    <div className="w-full min-h-[20px] flex flex-col items-start gap-4 text-gray-800">
      {editMessageId === message["_id"] ? (
        <div className="w-full">
          <textarea
            className="w-full m-0 resize-none border-0 bg-transparent p-0 focus:ring-0 focus-visible:ring-0 outline-none dark:text-white"
            defaultValue={message.content}
            onFocus={(e) => setEditedMessage(e.target.value)}
            onChange={(e) => setEditedMessage(e.target.value)}
          />
          <div className="text-center mt-2 flex justify-center">
            <button
              className="btn relative btn-primary mr-2"
              onClick={handleMessageEdit}
            >
              <div className="flex w-full items-center justify-center gap-2">
                Save &amp; Submit
              </div>
            </button>
            <button className="btn relative btn-neutral" onClick={handleCancel}>
              <div className="flex w-full items-center justify-center gap-2">
                Cancel
              </div>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative w-full">
            <p className="text-lg dark:text-gray-100 whitespace-pre-wrap md:px-[1.6rem] md:px-0">
              {message.content}
            </p>
          </div>
          <div
            className={`${
              selectedMessageId !== message["_id"] && "md:hidden"
            }flex absolute bottom-0 right-0 gap-2 md:gap-3 lg:gap-1 lg:mb-0 lg:mt-2 lg:pl-2 visible`}
          >
            <button
              className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-gray-300 disabled:dark:hover:text-gray-400 
                    md:invisible md:group-hover:visible"
              onClick={() => handleEditToggle(message["_id"])}
            >
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[1.125rem] w-[1.125rem]"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default UserMessage;
