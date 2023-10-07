import React, { useState, useEffect, useRef } from "react";
import GenericInput from "../../../UtilityComponents/GenericInput";
import GenericSelect from "../../../UtilityComponents/GenericSelect";
import { updateChat } from "../../../../utils/chatUtils";
import { getUser } from "../../../../utils/userUtils";

const ChatInfoForm = ({ setShowChatInfoForm, chat, setChats }) => {
  const chatInfoFormRef = useRef();
  // useEffect(() => {
  //   console.log(chat.chatPreferences);
  // }, [chat]);

  const [chatInfo, setChatInfo] = useState({
    mode: chat.chatPreferences.mode,
    selectedModel: chat.chatPreferences.selectedModel,
    topic: chat.chatPreferences.topic,
    keyConcepts: chat.chatPreferences.keyConcepts,
    priorKnowledge: chat.chatPreferences.priorKnowledge,
    learningStyle: chat.chatPreferences.learningStyle,
    challenges: chat.chatPreferences.challenges,
    // timeFrame: chat.chatPreferences.timeFrame,
    goal: chat.chatPreferences.goal,
    tutorType: chat.chatPreferences.tutorType,
    tutorName: chat.chatPreferences.tutorName,
    tutorBehavior: chat.chatPreferences.tutorBehavior,
    noteType: chat.chatPreferences.noteType,
    noteTitle: chat.chatPreferences.noteTitle,
    noteTone: chat.chatPreferences.noteTone,
    flashcardDifficulty: chat.chatPreferences.flashcardDifficulty,
    flashcardCount: chat.chatPreferences.flashcardCount,
    additionalInfo: chat.chatPreferences.additionalInfo,
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

  const updateSystemMessage = (name, personalInfo, chatInfoPayload) => {
    let systemMessageContent;
    if (chatInfoPayload.mode === "Tutor Session") {
      const socraticAddition = (tutorType) =>
        tutorType === "Socratic"
          ? "The user seeks a Socratic dialogue. Ask probing questions to foster critical thinking and explore underlying assumptions, but continue the momentum of the conversation."
          : "";

      systemMessageContent = `
          Your name is ${chatInfoPayload.tutorName}, and you are an expert in ${
        chatInfoPayload.topic
      }. You will be taking on the role of a ${
        chatInfoPayload.tutorType
      } style tutor.
          ${socraticAddition(chatInfoPayload.tutorType)}
          ${
            chatInfoPayload.goal &&
            `Your instructions are to guide the conversation towards understanding and achieving the user's goal: ${chatInfoPayload.goal}`
          }
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
    } else if (chatInfoPayload.mode === "Note Generation") {
      systemMessageContent = `
        You are instructed to generate detailed and comprehensive notes on the topic: ${
          chatInfoPayload.topic
        }. 
        The notes should be in the ${
          chatInfoPayload.noteType
        } format, titled "${chatInfoPayload.noteTitle}", and written in a ${
        chatInfoPayload.noteTone
      } tone. Feel free to include bullet points, equations, or code snippets in your answers if relevant. 
      ${
        chatInfoPayload.additionalInfo &&
        `Here is some additional context for the interaction, provided by the user: '${chatInfoPayload.additionalInfo}'`
      }

        ${
          chatInfoPayload.goal &&
          ` The user's goal in generating these notes is to ${chatInfoPayload.goal}, and the information provided must directly relate to this objective. `
        }
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
    } else if (chatInfoPayload.mode === "Flashcard Generation") {
      systemMessageContent = `
      You are instructed to EXPLICITLY generate a set of flashcards NUMBERED from 1 to ${
        chatInfoPayload.flashcardCount
      } based on the topic: ${chatInfoPayload.topic}.
      Use simple arithmetic: The first flashcard should be numbered 1, the second numbered 2, and so on until you reach flashcard number ${
        chatInfoPayload.flashcardCount
      }.
      Each flashcard should adhere to the selected difficulty level of ${
        chatInfoPayload.flashcardDifficulty
      }.
      ${
        chatInfoPayload.additionalInfo &&
        `Here is some additional context for the interaction, provided by the user: '${chatInfoPayload.additionalInfo}'`
      }
      ${
        chatInfoPayload.goal &&
        ` The user's goal in generating these flashcards is to ${chatInfoPayload.goal}, and the information provided must directly relate to this objective. `
      }
      ${
        name &&
        `The user you are interacting with is named ${name} and must be referred to as ${name} unless requested otherwise`
      }
      ${
        personalInfo &&
        `Additional information about the user, from the user: ${personalInfo}`
      }
      Ensure each flashcard has a unique number, directly contributes to achieving the user's specified objective, AND that the total number of flashcards equals ${
        chatInfoPayload.flashcardCount
      }. Ensure each flashcard has 1 verifiably accurate answer to it's associated question. 
    `;
    }
    return systemMessageContent;
  };

  const submitChatInfoForm = async () => {
    const chatInfoPayload = { ...chatInfo };
    const currentChat = { ...chat };
    // TODO replace w cache/global state
    const { name, personalInfo } = await getUser();
    const newSystemMessage = {
      role: "system",
      content: updateSystemMessage(name, personalInfo, chatInfoPayload),
    };
    currentChat.messages[0] = newSystemMessage;
    const updatedMessages = currentChat.messages;
    const updatedChat = await updateChat(chat._id, {
      chatPreferences: chatInfo,
      messages: updatedMessages,
    });
    setChats((prevChats) =>
      prevChats.map((prevChat) =>
        prevChat._id === chat._id ? updatedChat : prevChat
      )
    );
    setShowChatInfoForm(false);
  };

  return (
    <div className="w-[100vw] h-[100vh] py-24 md:w-auto fixed inset-0 bg-opacity-50 backdrop-blur-md flex justify-center items-center md:ml-[260px] z-50">
      <div
        ref={chatInfoFormRef}
        className="bg-white border border-gray-800 rounded-md p-4 h-[90vh] w-4/5 "
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
          maxLength={500}
          height={"auto"}
        />
        {/* <GenericInput
          label="Time Frame"
          value={chatInfo.timeFrame}
          onChange={(value) => updateChatInfoInputs("timeFrame", value)}
          placeholder="What's the timeframe?"
          height={"auto"}
        /> */}
        <GenericInput
          label="Goal"
          value={chatInfo.goal}
          onChange={(value) => updateChatInfoInputs("goal", value)}
          placeholder="What is the goal for this interaction?"
          maxLength={500}
          height={"auto"}
        />

        {chatInfo.mode === "Tutor Session" && (
          <>
            <div className="flex justify-between">
              <div className="w-1/2 pr-2">
                <GenericSelect
                  label="Tutor Type"
                  value={chatInfo.tutorType}
                  onChange={(value) => updateChatInfoInputs("tutorType", value)}
                  options={["Traditional", "Socratic"]}
                  height="3.5rem"
                />
              </div>
              <div className="w-1/2 pl-2">
                <GenericInput
                  label="Tutor Name"
                  value={chatInfo.tutorName}
                  onChange={(value) => updateChatInfoInputs("tutorName", value)}
                  placeholder="Socrates"
                  maxLength={50}
                />
              </div>
            </div>
            <GenericInput
              label="Tutor Behavior"
              value={chatInfo.tutorBehavior}
              onChange={(value) => updateChatInfoInputs("tutorBehavior", value)}
              placeholder="What kind of personality or behavior do you want your tutor to have?"
              maxLength={200}
            />{" "}
          </>
        )}

        {chatInfo.mode === "Note Generation" && (
          <>
            <div className="flex justify-between">
              <div className="w-1/2 pr-2">
                <GenericSelect
                  label="Note Type"
                  value={chatInfo.noteType}
                  onChange={(value) => updateChatInfoInputs("noteType", value)}
                  options={["Summary", "Cornell", "Outline"]}
                  height="3.5rem"
                />
              </div>
              <div className="w-1/2 pl-2">
                <GenericInput
                  label="Note Title"
                  value={chatInfo.noteTitle}
                  onChange={(value) => updateChatInfoInputs("noteTitle", value)}
                  placeholder="Enter your note title here"
                  maxLength={50}
                />
              </div>
            </div>
            <GenericInput
              label="Writing Style"
              value={chatInfo.noteWritingStyle}
              onChange={(value) =>
                updateChatInfoInputs("noteWritingStyle", value)
              }
              placeholder="Specify your preferred writing style"
              maxLength={200}
            />{" "}
          </>
        )}
        {chatInfo.mode === "Flashcard Generation" && (
          <>
            <GenericSelect
              label="Flashcard Difficulty"
              value={chatInfo.flashcardDifficulty}
              onChange={(value) =>
                updateChatInfoInputs("flashcardDifficulty", value)
              }
              options={["Easy", "Medium", "Hard"]}
              height="3.5rem"
            />
          </>
        )}
        <GenericInput
          label="Additional Info"
          value={chatInfo.additionalInfo}
          onChange={(value) => updateChatInfoInputs("additionalInfo", value)}
          placeholder="Any other information you feel would be relevant."
          maxLength={1500}
          height={"5rem"}
        />
        <div className="flex justify-center space-x-4">
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
