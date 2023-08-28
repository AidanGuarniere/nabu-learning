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
    keyConcepts: [""],
    personalInfo: "",
    noteType: "", // For note generation (e.g., "Cornell", "Bullets")
    noteTitle: "", // For note generation (e.g., "Cornell", "Bullets")
    noteTone: "",
    flashcardCount: null,
    flashcardDifficulty: "",
    // For note generation (e.g., "Formal", "Casual")
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

  const selectFunction = (preferences) => {
    const interactionMode = preferences.mode;
    const aiFunctionsInfo = { function_call: "auto", functions: [] };
    if (interactionMode === "Note Generation") {
      if (preferences.noteType === "Cornell") {
        const createCornellNotes = {
          name: "createCornellNotes",
          description:
            "Crafts organized Cornell notes to elevate the user's ability to capture, review, and synthesize complex information.",
          parameters: {
            type: "object",
            properties: {
              subject: {
                type: "string",
                description:
                  "The subject or topic of focus, guiding the note's context.",
              },
              cuesAndResponses: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    cue: {
                      type: "string",
                      description:
                        "A succinct question or keyword to trigger effective recall.",
                    },
                    responses: {
                      type: "array",
                      items: { type: "string" },
                      description:
                        "Concise points or explanations that directly relate to the cue.",
                    },
                  },
                  required: ["cue", "responses"],
                },
                description:
                  "An array of cue-response pairs to form a cohesive understanding.",
              },
              summary: {
                type: "string",
                description:
                  "A synthesized summary capturing key insights and implications.",
              },
            },
            required: ["subject", "cuesAndResponses", "summary"],
          },
        };

        aiFunctionsInfo.functions.push(createCornellNotes);
        aiFunctionsInfo.function_call = { name: "createCornellNotes" };
      }
      //  else if (preferences.noteType === "List") {
      // } else {
      // }
    }
    return aiFunctionsInfo;
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

    // system message logic
    let systemMessageContent;
    if (userChatPreferences.mode === "Discussion") {
      const socraticAddition = (tutorType) =>
        tutorType === "Socratic"
          ? "The user seeks a Socratic dialogue. Ask probing questions to foster critical thinking and explore underlying assumptions."
          : "";

      systemMessageContent = `
          Your name is ${
            userChatPreferences.tutorName
          }, and you are an expert in ${
        userChatPreferences.topic
      }. You will be taking on the role of a ${
        userChatPreferences.tutorType
      } style tutor.
          ${socraticAddition(userChatPreferences.tutorType)}
          Your instructions are to guide the conversation towards understanding and achieving the user's goal: ${
            userChatPreferences.goal
          }.
          Utilize your expertise in ${
            userChatPreferences.topic
          } to foster this understanding.
          ${
            userChatPreferences.personalInfo
              ? `Additional information about the user: ${userChatPreferences.personalInfo}`
              : ""
          }
        `;
    } else if (userChatPreferences.mode === "Note Generation") {
      systemMessageContent = `
        You are instructed to generate detailed and comprehensive notes on the topic: ${
          userChatPreferences.topic
        }. 
        The notes should be in the ${
          userChatPreferences.noteType
        } format, titled "${userChatPreferences.noteTitle}", and written in a ${
        userChatPreferences.noteTone
      } tone. Feel free to include bullet points, equations, or code snippets in your answers if relevant. 
        The specific goal is to ${
          userChatPreferences.goal
        }, and the information provided must directly relate to this objective.
        ${
          userChatPreferences.personalInfo
            ? `Here is some additional information on the user, from the user: ${userChatPreferences.personalInfo}`
            : ""
        }
        Please ensure that the content is in-depth and directly related to the main subject and user's goal.
      `;
    }

    // send gpt functions based on interaction mode
    const aiFunctionsInfo = await selectFunction(preferences);

    // trigger interaction
    const userGreetingContent =
      userChatPreferences.mode === "Discussion"
        ? "Introduce yourself to the user and briefly acknowledge the topic and goal of the discussion."
        : "Start creating notes according to the given instructions.";

    const messageHistory = [
      { role: "system", content: systemMessageContent },
      { role: "user", content: userGreetingContent },
    ];
    let gptResponse = {};

    if (aiFunctionsInfo.functions.length) {
      gptResponse = await sendMessageHistoryToGPT({
        model: userChatPreferences.selectedModel,
        messageHistory: messageHistory,
        functions: aiFunctionsInfo.functions,
        function_call: aiFunctionsInfo.function_call,
      });
    } else {
      gptResponse = await sendMessageHistoryToGPT({
        model: userChatPreferences.selectedModel,
        messageHistory: messageHistory,
      });
    }

    if (gptResponse) {
      const newChatData = {
        userId: session.user.id,
        chatPreferences: {
          ...userChatPreferences,
        },
        messages: messageHistory,
        functions: aiFunctionsInfo.functions,
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
        <div className="h-full w-full flex flex-col md:justify-center items-center py-6 px-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // goToNextStage();
            }}
            className="w-full h-4/5 md:h-full flex flex-col justify-start items-center max-w-5xl mx-auto rounded-lg overflow-y-auto"
          >
            {stage === 1 && (
              <div className="h-full flex flex-col justify-center items-center">
                {" "}
                <h1 className="text-center text-3xl md:text-4xl mb-2 md:mb-4">
                  choose your interaction
                </h1>
                <ModelSelect
                  onChange={(value) =>
                    updatePreferences("selectedModel", value)
                  }
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full md:max-w-4xl">
                  {/* Note Generation Selection */}
                  <div
                    className="flex flex-col items-center h-full p-6 md:p-8 bg-gray-100 border rounded-lg cursor-pointer md:hover:shadow-xl md:transform md:transition-all md:duration-500 md:hover:scale-105"
                    onClick={() => {
                      updatePreferences("mode", "Note Generation"),
                        goToNextStage();
                    }}
                  >
                    <h2 className="text-2xl mb-2 md:mb-4">note generation</h2>
                    <p className="text-center text-gray-700 h-1/2 mb-4">
                      Generate notes in various formats.
                    </p>
                    {/* <button
                    onClick={() => {
                      updatePreferences("mode", "Note Generation"),
                        goToNextStage();
                    }}
                    className="btn-primary w-full p-2 rounded-md text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200 shadow-md"
                  >
                    select
                  </button> */}
                  </div>
                  {/* Discussion Selection */}
                  <div
                    className="flex flex-col items-center h-full p-6 md:p-8 bg-gray-100 border rounded-lg cursor-pointer md:hover:shadow-xl md:transform md:transition-all md:duration-500 md:hover:scale-105"
                    onClick={() => {
                      updatePreferences("mode", "Discussion"), goToNextStage();
                    }}
                  >
                    <h2 className="text-2xl mb-2 md:mb-4">tutoring session</h2>
                    <p className="text-center text-gray-700 h-1/2 mb-4">
                      Engage in an interactive discussion with a virtual tutor.
                    </p>
                    {/* <button
                    onClick={() => {
                      updatePreferences("mode", "Discussion"), goToNextStage();
                    }}
                    className="btn-primary w-full p-2 rounded-md text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200 shadow-md"
                  >
                    select
                  </button> */}
                  </div>
                  {/* Flascard Generation Selection */}
                  <div
                    className="flex flex-col items-center h-full p-6 md:p-8 bg-gray-100 border rounded-lg cursor-pointer md:hover:shadow-xl md:transform md:transition-all md:duration-500 md:hover:scale-105"
                    onClick={() => {
                      updatePreferences("mode", "Flashcard Generation"),
                        goToNextStage();
                    }}
                  >
                    <h2 className="text-2xl mb-2 md:mb-4">
                      flashcard generation
                    </h2>
                    <p className="text-center text-gray-700 h-1/2 mb-4">
                      Generate a set of flashcards to help you study.
                    </p>
                    {/* <button
                    onClick={() => {
                      updatePreferences("mode", "Flashcard Generation"),
                        goToNextStage();
                    }}
                    className="btn-primary w-full p-2 rounded-md text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200 shadow-md"
                  >
                    select
                  </button> */}
                  </div>
                </div>
              </div>
            )}

            {stage === 2 && (
              <div className="flex flex-col justify-between w-full h-full md:h-2/3">
                <h2 className="block text-gray-700 text-2xl text-center mb-2">
                  {preferences.mode === "Discussion"
                    ? "what would you like to discuss?"
                    : preferences.mode === "Note Generation"
                    ? "what topic should the notes cover?"
                    : preferences.mode === "Flashcard Generation"
                    ? "what subject are the flashcards for?"
                    : "what are we talking about?"}
                </h2>
                <GenericInput
                  label="Topic"
                  value={preferences.topic}
                  onChange={(value) => updatePreferences("topic", value)}
                  placeholder="Enter the topic of interaction"
                  maxLength={250}
                />
                <GenericInput
                  label="Goal"
                  value={preferences.goal}
                  onChange={(value) => updatePreferences("goal", value)}
                  placeholder="Enter the goal for this interaction"
                  maxLength={250}
                />
                <GenericInput
                  label="Personal Info"
                  value={preferences.personalInfo}
                  onChange={(value) => updatePreferences("personalInfo", value)}
                  placeholder="Enter any personal info you feel is relevant to this interaction e.g. your experience with the topic"
                  maxLength={250}
                />
              </div>
            )}

            {stage === 3 && (
              <div className="flex flex-col justify-between w-full h-full md:h-2/3">
                <div className="block text-gray-700 text-2xl text-center mb-2">
                  {preferences.mode === "Discussion"
                    ? "Tutor Information"
                    : "Note Preferences"}
                </div>

                {preferences.mode === "Discussion" && (
                  <>
                    <GenericSelect
                      label="Tutor Type"
                      value={preferences.tutorType}
                      onChange={(value) =>
                        updatePreferences("tutorType", value)
                      }
                      options={["Traditional", "Socratic"]}
                    />
                    <GenericInput
                      label="Tutor Name"
                      value={preferences.tutorName}
                      onChange={(value) =>
                        updatePreferences("tutorName", value)
                      }
                      placeholder="Socrates"
                      maxLength={50}
                    />
                    <GenericInput
                      label="Tutor Behavior"
                      value={preferences.tutorBehavior}
                      onChange={(value) =>
                        updatePreferences("tutorBehavior", value)
                      }
                      placeholder="What kind of personality or behavior do you want your tutor to have?"
                      maxLength={200}
                    />
                  </>
                )}

                {preferences.mode === "Note Generation" && (
                  <>
                    <GenericSelect
                      label="Note Type"
                      value={preferences.noteType}
                      onChange={(value) => updatePreferences("noteType", value)}
                      options={["Sentences", "List", "Cornell"]}
                    />
                    <GenericInput
                      label="Note Title"
                      value={preferences.noteTitle}
                      onChange={(value) =>
                        updatePreferences("noteTitle", value)
                      }
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
                  </>
                )}

                {preferences.mode === "Flashcard Generation" && (
                  <>
                    <GenericSelect
                      label="Flashcard Count"
                      value={preferences.flashcardCount}
                      onChange={(value) =>
                        updatePreferences("flashcardCount", value)
                      }
                      options={["10", "20", "30"]}
                    />
                    <GenericInput
                      label="Flashcard Difficulty"
                      value={preferences.flashcardDifficulty}
                      onChange={(value) =>
                        updatePreferences("flashcardDifficulty", value)
                      }
                      placeholder="Easy, Medium, or Hard"
                      maxLength={50}
                    />
                  </>
                )}
              </div>
            )}
          </form>
          {stage > 1 && (
            <div className="flex justify-center items-start w-full md:max-w-3xl mt-4 md:mt-0">
              <button
                onClick={goToPreviousStage}
                className="btn-secondary w-3/5 md:w-1/5 mx-2 p-2 rounded-md text-primary bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
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
        </div>
      )}
    </div>
  );
};

export default PreferencesForm;
// {stage === 2 && (
//   <div className="flex flex-col md:flex-row justify-between w-full md:h-2/3 overflow-y-auto">
//     <div className="block text-gray-700 text-2xl text-center mb-2 w-full">
//       Topic Details
//     </div>

//     <div className="flex flex-col w-full md:w-1/2 p-2">
//       <GenericInput
//         label="Topic"
//         value={preferences.topic}
//         onChange={(value) => updatePreferences("topic", value)}
//         placeholder="Enter the topic of interaction"
//         maxLength={250}
//       />
//       <GenericInput
//         label="Sub-Topic"
//         value={preferences.subTopic}
//         onChange={(value) => updatePreferences("subTopic", value)}
//         placeholder="Enter specific areas within the topic"
//         maxLength={250}
//       />
//       <GenericInput
//         label="Prior Knowledge"
//         value={preferences.priorKnowledge}
//         onChange={(value) => updatePreferences("priorKnowledge", value)}
//         placeholder="Enter topics/modules you've completed"
//         maxLength={250}
//       />
//       <GenericInput
//         label="Learning Style"
//         value={preferences.learningStyle}
//         onChange={(value) => updatePreferences("learningStyle", value)}
//         placeholder="Enter your preferred learning style"
//         maxLength={250}
//       />
//     </div>

//     <div className="flex flex-col w-full md:w-1/2 p-2">
//       <GenericInput
//         label="Goal"
//         value={preferences.goal}
//         onChange={(value) => updatePreferences("goal", value)}
//         placeholder="Enter the goal for this interaction"
//         maxLength={250}
//       />
//       <GenericInput
//         label="Challenges"
//         value={preferences.challenges}
//         onChange={(value) => updatePreferences("challenges", value)}
//         placeholder="Enter areas you've found challenging"
//         maxLength={250}
//       />
//       <GenericInput
//         label="Time Frame"
//         value={preferences.timeFrame}
//         onChange={(value) => updatePreferences("timeFrame", value)}
//         placeholder="Enter the time frame for your goal"
//         maxLength={250}
//       />
//       <GenericInput
//         label="Personal Info"
//         value={preferences.personalInfo}
//         onChange={(value) => updatePreferences("personalInfo", value)}
//         placeholder="Enter relevant personal info"
//         maxLength={250}
//       />
//     </div>
//   </div>
// )}
