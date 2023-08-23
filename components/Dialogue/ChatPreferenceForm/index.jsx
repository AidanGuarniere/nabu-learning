import React, { useState, useEffect } from "react";
import ModelSelect from "./ModelSelect"; // Import the existing ModelSelect component
import GenericInput from "./GenericInput";
import GenericSelect from "./GenericSelect";
import { createChat } from "../../../utils/chatUtils";
import { sendMessageHistoryToGPT } from "../../../utils/gptUtils";

const PreferencesForm = ({ session, setChats, setSelectedChat, setError }) => {
  // State for Model Selection
  const [stage, setStage] = useState(1);

  const [loading, setLoading] = useState(false);

  const [preferences, setPreferences] = useState({
    mode: "", // "Discussion" or "Note Generation"
    selectedModel: "gpt-3.5-turbo",
    tutorType: "",
    tutorName: "",
    tutorBehavior: "",
    topic: "",
    goal: "",
    personalInfo: "",
    noteType: "", // For note generation (e.g., "Cornell", "Bullets")
    noteTitle: "", // For note generation (e.g., "Cornell", "Bullets")
    noteTone: "", // For note generation (e.g., "Formal", "Casual")
    // Additional preferences as needed
  });

  const goToNextStage = () => {
    setStage((prevStage) => prevStage + 1);
  };

  const goToPreviousStage = () => {
    setStage((prevStage) => prevStage - 1);
  };

  const updatePreferences = (key, value) => {
    setPreferences((prevPreferences) => ({
      ...prevPreferences,
      [key]: value,
    }));
  };


  // Function to handle form submission
  // Inside PreferencesForm component
  const handleChatPreferencesFormSubmit = async (e) => {
    e.preventDefault();

    // Gather all the preferences into a chatPreferences object
    const userChatPreferences = {
      mode: preferences.mode,
      selectedModel: preferences.selectedModel,
      tutorType: preferences.tutorType,
      tutorName: preferences.tutorName,
      tutorBehavior: preferences.tutorBehavior,
      topic: preferences.topic,
      goal: preferences.goal,
      personalInfo: preferences.personalInfo,
      noteType: preferences.noteType,
      noteTitle: preferences.noteTitle,
      noteTone: preferences.noteTone,
    };

    // setLoading(true); // Start loading

    // Call the chat creation logic
    await createNewChat(userChatPreferences);
    // setLoading(false); // End loading
  };
  const createNewChat = async (userChatPreferences) => {
    setLoading(true);
    let systemMessageContent;

    if (userChatPreferences.mode === "Discussion") {
      systemMessageContent = `
        Your name is ${userChatPreferences.tutorName} and you are a ${
        userChatPreferences.tutorType
      } style tutor ${
        userChatPreferences.tutorType === "Socratic" &&
        "The user seeks a Socratic dialogue. Ask probing questions to foster critical thinking and explore underlying assumptions."
      } instructed to behave according to the following description: ${
        userChatPreferences.tutorBehavior
      }. Emulate this description to the best of your ability and in character throughout the discussion. 
        The topic of discussion is ${
          userChatPreferences.topic
        }, and the specific goal is ${userChatPreferences.goal}.
        ${
          userChatPreferences.personalInfo
            ? `Here is some additional information on the user, from the user: ${userChatPreferences.personalInfo}`
            : ""
        }
      `;
    } else if (userChatPreferences.mode === "Note Generation") {
      systemMessageContent = `
        You are instructed to generate notes on the topic: ${
          userChatPreferences.topic
        }. The notes should be in the ${
        userChatPreferences.noteType
      } format, titled "${userChatPreferences.noteTitle}", and written in a ${
        userChatPreferences.noteTone
      } tone. 
        The specific goal is ${userChatPreferences.goal}.
        ${
          userChatPreferences.personalInfo
            ? `Here is some additional information on the user, from the user: ${userChatPreferences.personalInfo}`
            : ""
        }
      `;
    }

    const userGreetingContent =
      userChatPreferences.mode === "Discussion"
        ? "Introduce yourself to the user and briefly acknowledge the topic and goal of the discussion."
        : "Start creating notes according to the given instructions.";

    const messageHistory = [
      { role: "system", content: systemMessageContent },
      { role: "user", content: userGreetingContent },
    ];

    const gptResponse = await sendMessageHistoryToGPT({
      model: userChatPreferences.selectedModel,
      messageHistory: messageHistory,
    });

    if (gptResponse) {
      const newChatData = {
        userId: session.user.id,
        chatPreferences: {
          ...userChatPreferences,
        },
        messages: messageHistory,
      };
      try {
        const newChat = await createChat(newChatData);
        setChats((prevChats) =>
          prevChats.length ? [...prevChats, newChat] : [newChat]
        );
        setSelectedChat(newChat._id);
        setPreferences({
          mode: "",
          selectedModel: "gpt-3.5-turbo",
          tutorType: "",
          tutorName: "",
          tutorBehavior: "",
          topic: "",
          goal: "",
          personalInfo: "",
          noteType: "",
          noteTitle: "",
          noteTone: "",
        });
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const checkIfStageComplete = (stage, preferences) => {
    switch (stage) {
      case 1:
        return preferences.mode !== "";
      case 2:
        return (
          preferences.topic !== "" &&
          preferences.goal !== "" &&
          preferences.personalInfo !== ""
        );
      case 3:
        if (preferences.mode === "Discussion") {
          return (
            preferences.tutorType !== "" &&
            preferences.tutorName !== "" &&
            preferences.tutorBehavior !== ""
          );
        } else if (preferences.mode === "Note Generation") {
          return preferences.noteType !== "" && preferences.noteTitle !== "";
        }
        break;
      default:
        return false;
    }
  };

  return (
    <div className="w-full h-full ">
      {loading ? (
        "loading"
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // goToNextStage();
          }}
          className="w-full h-full flex flex-col justify-center items-center max-w-5xl mx-auto px-10 bg-white rounded-lg"
        >
          {stage === 1 && (
            <>
              {" "}
              <h1 className="text-center text-4xl mb-8 md:mb-20">
                choose your interaction
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:max-w-3xl">
                {/* Discussion Selection */}
                <div className="flex flex-col items-center p-8 bg-gray-100 rounded-lg hover:shadow-xl transform transition-all duration-500 hover:scale-105">
                  <h2 className="text-2xl mb-4">discussion</h2>
                  <p className="text-center text-gray-700 mb-4">
                    Engage in an interactive discussion with a virtual tutor.
                    Choose the tutor&apos;s personality, style, and more.
                  </p>
                  <button
                    onClick={() => {
                      updatePreferences("mode", "Discussion"), goToNextStage();
                    }}
                    className="btn-primary w-full p-2 rounded-md text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200 shadow-md"
                  >
                    select
                  </button>
                </div>
                {/* Note Generation Selection */}
                <div className="flex flex-col items-center p-8 bg-gray-100 rounded-lg hover:shadow-xl transform transition-all duration-500 hover:scale-105">
                  <h2 className="text-2xl mb-4">note generation</h2>
                  <p className="text-center text-gray-700 mb-4">
                    Generate notes in various formats such as Cornell, list, or
                    sentences. Customize the tone, title, and details.
                  </p>
                  <button
                    onClick={() => {
                      updatePreferences("mode", "Note Generation"),
                        goToNextStage();
                    }}
                    className="btn-primary w-full p-2 rounded-md text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200 shadow-md"
                  >
                    select
                  </button>
                </div>
              </div>
            </>
          )}
          {stage === 2 && (
            <div className="flex flex-col justify-between w-full h-2/3">
              {" "}
              {/* Flexbox added here */}
              <div className="block text-gray-700 text-xl text-center  mb-2">
                Topic Details
              </div>
              <GenericInput
                label="Topic"
                value={preferences.topic}
                onChange={(value) => updatePreferences("topic", value)}
                placeholder="Enter the topic of discussion"
                maxLength={200}
              />
              <GenericInput
                label="Goal"
                value={preferences.goal}
                onChange={(value) => updatePreferences("goal", value)}
                placeholder="Enter the goal for this discussion"
                maxLength={200}
              />
              <GenericInput
                label="Personal Info"
                value={preferences.personalInfo}
                onChange={(value) => updatePreferences("personalInfo", value)}
                placeholder="Enter any personal info you feel is relevant to the discussion e.g. your experience with the topic"
                maxLength={200}
              />
            </div>
          )}

          {stage === 3 && preferences.mode === "Discussion" && (
            <div className="flex flex-col justify-between w-full h-2/3">
              {" "}
              {/* Flexbox added here */}
              <div className="block text-gray-700 text-xl text-center mb-2">
                Tutor Information
              </div>
              <GenericSelect
                label="Tutor Type"
                value={preferences.tutorType}
                onChange={(value) => updatePreferences("tutorType", value)}
                options={["Traditional", "Socratic"]}
              />
              <GenericInput
                label="Tutor Name"
                value={preferences.tutorName}
                onChange={(value) => updatePreferences("tutorName", value)}
                placeholder="Socrates"
                maxLength={50}
              />
              <GenericInput
                label="Tutor Behavior"
                value={preferences.tutorBehavior}
                onChange={(value) => updatePreferences("tutorBehavior", value)}
                placeholder="What kind of personality or behavior do you want your tutor to have?"
                maxLength={200}
              />
            </div>
          )}

          {stage === 3 && preferences.mode === "Note Generation" && (
            <div className="flex flex-col justify-between w-full h-2/3">
              {" "}
              {/* Flexbox added here */}
              <div className="block text-gray-700 text-xl text-center mb-2">
                Note Preferences
              </div>
              <GenericSelect
                label="Note Type"
                value={preferences.noteType}
                onChange={(value) => updatePreferences("noteType", value)}
                options={["Sentences", "List", "Cornell"]}
              />
              <GenericInput
                label="Note Title"
                value={preferences.noteTitle}
                onChange={(value) => updatePreferences("noteTitle", value)}
                placeholder="Enter your note title here"
                maxLength={50}
              />
              <GenericInput
                label="Writing Style"
                value={preferences.noteWritingStyle}
                onChange={(value) =>
                  updatePreferences("noteWritingStyle", value)
                }
                placeholder="Specify your preferred writing style"
                maxLength={200}
              />
            </div>
          )}

          {stage > 1 && (
            <div className="flex justify-center items-center w-full md:max-w-3xl mt-8">
              <button
                onClick={goToPreviousStage}
                className="btn-secondary w-3/5 md:w-1/5 mx-4 p-2 rounded-md text-primary bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
              >
                back
              </button>
              {stage < 3 ? (
                <button
                  className="btn-primary w-3/5 md:w-1/5 mx-4 p-2 rounded-md text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
                  disabled={!checkIfStageComplete(stage, preferences)}
                  onClick={goToNextStage} // Logic to check if all options are filled
                >
                  next
                </button>
              ) : (
                <button
                  className="btn-primary w-3/5 md:w-1/5 mx-4 p-2 rounded-md text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
                  onClick={handleChatPreferencesFormSubmit}
                >
                  submit
                </button>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default PreferencesForm;
