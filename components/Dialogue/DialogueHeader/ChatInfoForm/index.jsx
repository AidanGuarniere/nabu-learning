import React, { useState, useEffect, useRef } from "react";
import GenericInput from "../../../UtilityComponents/GenericInput";
import { updateChat } from "../../../../utils/chatUtils";
import { getUser } from "../../../../utils/userUtils";

const ChatInfoForm = ({ setShowChatInfoForm, chat, setChats }) => {
  const chatInfoFormRef = useRef();
  const [chatInfo, setChatInfo] = useState({
    topic: chat.chatPreferences.topic,
    goal: chat.chatPreferences.goal,
    additionalInfo: "",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatInfoFormRef.current &&
        !chatInfoFormRef.current.contains(event.target)
      ) {
        setShowChatInfoForm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [setShowChatInfoForm]);

  const updateChatInfoInputs = (key, value) => {
    setChatInfo((prevChatInfo) => ({
      ...prevChatInfo,
      [key]: value,
    }));
  };

  const updateSystemMessage = (
    name,
    personalInfo,
    chatInfoPayload,
    chatPreferences
  ) => {
    let systemMessageContent;
    if (chatPreferences.mode === "Tutor Session") {
      const socraticAddition = (tutorType) =>
        tutorType === "Socratic"
          ? "The user seeks a Socratic dialogue. Ask probing questions to foster critical thinking and explore underlying assumptions, but continue the momentum of the conversation."
          : "";

      systemMessageContent = `
          Your name is ${chatPreferences.tutorName}, and you are an expert in ${
        chatInfoPayload.topic
      }. You will be taking on the role of a ${
        chatPreferences.tutorType
      } style tutor.
          ${socraticAddition(chatPreferences.tutorType)}
          Your instructions are to guide the conversation towards understanding and achieving the user's goal: ${
            chatInfoPayload.goal
          }.
          ${
            chatInfoPayload.additionalInfo &&
            `Here is some additional context for the interaction, provided by the user: '${chatInfoPayload.additionalInfo}'`
          }
          Utilize your expertise in ${
            chatInfoPayload.topic
          } to foster this understanding. Be sure to keep the conversation relevant to the user's topic and goal.
          ${
            name &&
            `The user you are interacting with is named ${name} and must be referred to as ${name} unless requested otherwise`
          }
          ${
            personalInfo &&
            `Additional information about the user, from the user: ${personalInfo}`
          }
        `;
    } else if (chatPreferences.mode === "Note Generation") {
      systemMessageContent = `
        You are instructed to generate detailed and comprehensive notes on the topic: ${
          chatInfoPayload.topic
        }. 
        The notes should be in the ${
          chatPreferences.noteType
        } format, titled "${chatPreferences.noteTitle}", and written in a ${
        chatPreferences.noteTone
      } tone. Feel free to include bullet points, equations, or code snippets in your answers if relevant. 
      ${
        chatInfoPayload.additionalInfo &&
        `Here is some additional context for the interaction, provided by the user: '${chatInfoPayload.additionalInfo}'`
      }
        The specific goal is to ${
          chatInfoPayload.goal
        }, and the information provided must directly relate to this objective.
        ${
          name &&
          `The user you are interacting with is named ${name} and must be referred to as ${name} unless requested otherwise`
        }
        ${
          personalInfo &&
          `Additional information about the user, from the user: ${personalInfo}`
        }
        Please ensure that the content is in-depth and directly related to the main subject and user's goal.
      `;
    } else if (chatPreferences.mode === "Flashcard Generation") {
      systemMessageContent = `
      You are instructed to EXPLICITLY generate a set of flashcards NUMBERED from 1 to ${
        chatPreferences.flashcardCount
      } based on the topic: ${chatInfoPayload.topic}.
      Use simple arithmetic: The first flashcard should be numbered 1, the second numbered 2, and so on until you reach flashcard number ${
        chatPreferences.flashcardCount
      }.
      Each flashcard should adhere to the selected difficulty level of ${
        chatPreferences.flashcardDifficulty
      }.
      ${
        chatInfoPayload.additionalInfo &&
        `Here is some additional context for the interaction, provided by the user: '${chatInfoPayload.additionalInfo}'`
      }
      The specific goal in creating these flashcards is to ${
        chatInfoPayload.goal
      }.
      ${
        name &&
        `The user you are interacting with is named ${name} and must be referred to as ${name} unless requested otherwise`
      }
      ${
        personalInfo &&
        `Additional information about the user, from the user: ${personalInfo}`
      }
      Ensure each flashcard has a unique number, directly contributes to achieving the user's specified objective, AND that the total number of flashcards equals ${
        chatPreferences.flashcardCount
      }. Ensure each flashcard has 1 verifiably accurate answer to it's associated question. 
    `;
    }
    return systemMessageContent;
  };

  const submitChatInfoForm = async () => {
    const chatInfoPayload = { ...chatInfo };
    const currentChat = {...chat};
    // TODO replace w cache/global state
    const { name, personalInfo } = await getUser();
    const newSystemMessage = {
      role: "system",
      content: updateSystemMessage(
        name,
        personalInfo,
        chatInfoPayload,
        currentChat.chatPreferences
      ),
    };
    currentChat.messages[0] = newSystemMessage;
    const updatedMessages = currentChat.messages
    const updatedChat = await updateChat(chat._id, {
      messages: updatedMessages,
    });
    setChats((prevChats) =>
      prevChats.map((prevChat) =>
        prevChat._id === chat._id ? updatedChat : prevChat
      )
    );
    setShowChatInfoForm(false)
  };

  return (
    <div className="w-[100vw] h-[100vh] py-24 md:w-auto fixed inset-0 bg-opacity-50 backdrop-blur-md flex justify-center items-center md:ml-[260px] z-50">
      <div
        ref={chatInfoFormRef}
        className="bg-white border border-gray-800 rounded-md p-6 w-4/5"
      >
        <h1 className="text-center text-gray-800 text-2xl font-light">
          Interaction Info
        </h1>
        <h2 className="px-2 py-3 text-center text-gray-800 font-light text-sm md:text-md">
          This information will be referenced by Nabu to provide a more
          personalized experience for this interaction
        </h2>
        <GenericInput
          label="Topic"
          value={chatInfo.topic}
          onChange={(value) => updateChatInfoInputs("topic", value)}
          placeholder="What is the topic of the interaction?"
          maxLength={200}
          height={"auto"}
        />
        <GenericInput
          label="Goal"
          value={chatInfo.goal}
          onChange={(value) => updateChatInfoInputs("goal", value)}
          placeholder="What is the goal for this interaction?"
          maxLength={500}
          height={"10rem"}
        />
        <GenericInput
          label="Additional Info"
          value={chatInfo.additionalInfo}
          onChange={(value) => updateChatInfoInputs("additionalInfo", value)}
          placeholder="Any other information you feel would be relevant to this interaction. e.g. your experience with the topic"
          maxLength={1000}
          height={"10rem"}
        />
        <div className="flex justify-center mt-4 space-x-4">
          <button
            className="bg-red-700 hover:bg-red-600 h-10 py-2 px-4 rounded-md"
            onClick={() => {
              setShowChatInfoForm(false);
            }}
          >
            Cancel
          </button>
          <button
            className="bg-green-400 hover:bg-green-200 h-10 py-2 px-4 rounded-md"
            onClick={() => {
              submitChatInfoForm();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInfoForm;
