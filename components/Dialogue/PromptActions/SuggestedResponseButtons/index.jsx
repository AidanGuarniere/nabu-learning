import React, { useState, useEffect } from "react";
import streamGptSuggestions from "../../../../utils/streamGptSuggestions";

const SuggestedResponseButtons = ({ chats, selectedChat, setUserText }) => {
  const [suggestedResponses, setSuggestedResponses] = useState([]);
  const [suggestionStream, setSuggestionStream] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  let lastProcessedPosition = 0;
  let suggestedUserResponsesOutput = [];

  const processSuggestedResponses = (stream) => {
    if (stream.length <= lastProcessedPosition) return;

    let currentPosition = lastProcessedPosition;

    if (stream.includes('"suggestedUserResponses": [', currentPosition)) {
      currentPosition =
        stream.indexOf('"suggestedUserResponses": [', currentPosition) + 26;

      while (currentPosition < stream.length) {
        let stringStart = stream.indexOf('"', currentPosition);
        let stringEnd = stream.indexOf('"', stringStart + 1);

        if (stringStart === -1 || stringEnd === -1) {
          break;
        }

        let suggestion = stream.substring(stringStart + 1, stringEnd);
        suggestedUserResponsesOutput.push(suggestion);
        setSuggestedResponses(suggestedUserResponsesOutput);

        currentPosition = stringEnd + 1;
      }
    }

    lastProcessedPosition = currentPosition;
  };

  useEffect(() => {
    setSuggestionStream("");
    setSuggestedResponses([]);
    setLoadingSuggestions(false);
  }, [
    chats,
    selectedChat,
    setSuggestionStream,
    setSuggestedResponses,
    setLoadingSuggestions,
  ]);

  useEffect(() => {
    processSuggestedResponses(suggestionStream);
  }, [suggestionStream, processSuggestedResponses]);

  const suggestResponses = async (e) => {
    setSuggestedResponses([]);
    setSuggestionStream("");
    setLoadingSuggestions(true);
    e.preventDefault;
    // find relevent messages in chat to suggest responses to
    const selectedChatIndex = chats.findIndex(
      (chat) => chat._id === selectedChat
    );
    const updatedChat = { ...chats[selectedChatIndex] };
    const messageModel = "gpt-3.5-turbo";
    const firstAndLastThree = (arr) => {
      if (arr.length <= 4) return arr;
      return [...arr.slice(-3)];
    };

    // suggestion function description
    const suggestUserResponsesFunctionDescription = {
      name: "suggestUserResponses",
      description:
        "Template for generating 2 user response suggestions for an existing chat.",
      parameters: {
        type: "object",
        properties: {
          suggestedUserResponses: {
            type: "array",
            items: { type: "string" },
            maxItems: 2,
            description:
              "Array of suggested user responses for chat interaction.",
          },
        },
        required: ["suggestedUserResponses"],
      },
    };

    const initialMessage = {
      role: "system",
      content:
        "This message is to take priority over all following messages. Your role is to interpret the follow messages and suggest two useful user responses to the most recent message that would assist the user's learning experience based on the following Messages. You are suggesting content for the user's next message, not continuing the conversation as an assistant. You are not actually participating in the provided conversation, just suggesting 2 responses for the user. Responses should be written as if they are coming from the user, not the assistant.",
    };

    const messageHistory = [
      initialMessage,
      ...firstAndLastThree(updatedChat.messages).map((message) => ({
        role: message.role === "system" ? "user" : message.role,
        content: message.content || JSON.stringify(message.function_call),
      })),
    ];

    const gptRequestPayload = {
      model: messageModel,
      messages: messageHistory,
      functions: [suggestUserResponsesFunctionDescription],
      function_call: { name: "suggestUserResponses" },
    };

    streamGptSuggestions(
      gptRequestPayload,
      setSuggestionStream,
      setLoadingSuggestions
    );
  };
  return (
    <div
      className="grid grid-cols-11  gap-3 w-full mx-auto max-w-[96%] md:max-w-md lg:max-w-2xl xl:max-w-3xl mt-2 mb-1 relative
               rounded-[.4325rem] dark:text-white dark:bg-gray-700 sm:min-h-[1rem]"
    >
      <button
        onClick={(e) => {
          if (!loadingSuggestions) {
            suggestResponses(e);
          }
        }}
        className={`col-span-3 h-12 py-2 px-0 md:px-4 bg-white border border-gray-200 text-gray-800 rounded-md text-xs md:text-sm text-centered ${
          loadingSuggestions ? "disabled" : ""
        }`}
      >
        suggestions
      </button>
      {suggestedResponses.length
        ? suggestedResponses.map((response, i) =>
            i < 2 ? (
              <div
                className="col-span-4  flex items-center h-12 py-2 px-4 border border-gray-200 rounded-md bg-gray-100 text-gray-800 cursor-pointer"
                key={i}
              >
                <span
                  onClick={(e) => {
                    setUserText(e.target.textContent);
                  }}
                  className="text-center text-sm truncate"
                  title={response}
                  style={{
                    maxWidth: "100%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {response}
                </span>
              </div>
            ) : null
          )
        : null}
    </div>
  );
};

export default SuggestedResponseButtons;
