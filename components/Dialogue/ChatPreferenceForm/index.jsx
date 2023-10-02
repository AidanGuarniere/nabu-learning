import React, { useState, useEffect, useRef } from "react";
import ModelSelect from "./ModelSelect"; // Import the existing ModelSelect component
import GenericInput from "../../UtilityComponents/GenericInput";
import GenericSelect from "../../UtilityComponents/GenericSelect";
import { createChat } from "../../../utils/chatUtils";

const PreferencesForm = ({
  session,
  currentlyStreamedChatRef,
  setChats,
  selectedChat,
  setSelectedChat,
  setError,
}) => {
  // State for Model Selection
  const [stage, setStage] = useState(1);
  const [loading, setLoading] = useState(false);
  // hold chat values to update chats state until db interaction good to go, then create new chat in db with currentlyStreamedChatRef value
  const [preferences, setPreferences] = useState({
    mode: "", // "Tutor Session" or "Note Generation"
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
    flashcardCount: 10,
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
    const aiFunctionsInfo = { function_call: "auto", functions: [] };
    if (preferences.mode === "Note Generation") {
      if (preferences.noteType === "Cornell") {
        const createCornellNotes = {
          name: "createCornellNotes",
          description:
            "Crafts organized Cornell notes to elevate the user's ability to capture, review, and synthesize complex information.",
          parameters: {
            type: "object",
            properties: {
              functionName: {
                type: "string",
                description:
                  "The name of this function, createCornellNotes. the value of functionName MUST be createCornellNotes.",
              },
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
            required: [
              "functionName",
              "subject",
              "cuesAndResponses",
              "summary",
            ],
          },
        };

        aiFunctionsInfo.functions.push(createCornellNotes);
        aiFunctionsInfo.function_call = { name: "createCornellNotes" };
      }
      //  else if (preferences.noteType === "List") {
      // } else {
      // }
    } else if (preferences.mode === "Flashcard Generation") {
      const generateFlashcards = {
        name: "generateFlashcards",
        description:
          "Generates a set of interactive flashcards to enhance user's active recall and spaced repetition learning.",
        parameters: {
          type: "object",
          properties: {
            functionName: {
              type: "string",
              description: "The name of the function, generateFlashcards",
            },
            subject: {
              type: "string",
              description: "The topic for the flashcards.",
            },
            cardPairs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  count: {
                    type: "number",
                    description: "The index number of this flashcard.",
                  },
                  question: {
                    type: "string",
                    description: "The front of the flashcard.",
                  },
                  answer: {
                    type: "string",
                    description:
                      "The answer or details at the back of the flashcard.",
                  },
                },
                required: ["count", "question", "answer"],
              },
              description: "An array of flashcard question-answer pairs.",
            },
            difficulty: {
              type: "string",
              description:
                "Difficulty level for sorting or categorizing flashcards.",
            },
          },
          required: ["functionName", "subject", "cardPairs"],
        },
      };
      aiFunctionsInfo.functions.push(generateFlashcards);
      aiFunctionsInfo.function_call = { name: "generateFlashcards" };
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
      flashcardCount: preferences.flashcardCount,
      flashcardDifficulty: preferences.flashcardDifficulty,
    };

    // setLoading(true); // Start loading

    // Call the chat creation logic
    await createNewChat(userChatPreferences);
    setLoading(false); // End loading
  };
  const createNewChat = async (userChatPreferences) => {
    setLoading(true);

    // system message logic
    let systemMessageContent;
    if (userChatPreferences.mode === "Tutor Session") {
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
          } to foster this understanding. Be sure to keep the conversation relevant to the user's topic and goal.
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
    } else if (userChatPreferences.mode === "Flashcard Generation") {
      systemMessageContent = `
      You are instructed to EXPLICITLY generate a set of flashcards NUMBERED from 1 to ${
        userChatPreferences.flashcardCount
      } based on the topic: ${userChatPreferences.topic}.
      Use simple arithmetic: The first flashcard should be numbered 1, the second numbered 2, and so on until you reach flashcard number ${
        userChatPreferences.flashcardCount
      }.
      Each flashcard should adhere to the selected difficulty level of ${
        userChatPreferences.flashcardDifficulty
      }.
      The specific goal in creating these flashcards is to ${
        userChatPreferences.goal
      }.
      ${
        userChatPreferences.personalInfo
          ? `Additional context about the user: ${userChatPreferences.personalInfo}`
          : ""
      }
      Ensure each flashcard has a unique number, directly contributes to achieving the user's specified objective, AND that the total number of flashcards equals ${
        userChatPreferences.flashcardCount
      }. Ensure each flashcard has 1 verifiably accurate answer to it's associated question. 
    `;
    }

    // send gpt functions based on interaction mode
    const aiFunctionsInfo = await selectFunction(preferences);

    // trigger interaction
    const userGreetingContent =
      userChatPreferences.mode === "Tutor Session"
        ? "Introduce yourself to the user and briefly acknowledge the topic and goal of the tutoring session."
        : userChatPreferences.mode === "Note Generation"
        ? "Start creating notes according to the given instructions."
        : "Initiate the process to generate flashcards in line with the given topic and difficulty.";

    const messageHistory = [
      { role: "system", content: systemMessageContent },
      { role: "user", content: userGreetingContent },
    ];

    const gptRequestPayload = {
      model: userChatPreferences.selectedModel,
      messages: messageHistory,
    };

    // check if chat uses function calling
    if (aiFunctionsInfo.functions.length) {
      gptRequestPayload.functions = aiFunctionsInfo.functions;
      gptRequestPayload.function_call = aiFunctionsInfo.function_call;
    }

    // create new chat in db with current chat data
    const newChatPayload = {
      userId: session.user.id,
      chatPreferences: userChatPreferences,
      messages: messageHistory,
      functions: aiFunctionsInfo.functions,
    };

    currentlyStreamedChatRef.current = gptRequestPayload;

    const newChat = await createChat(newChatPayload);
    setChats((prevChats) =>
      prevChats.length ? [...prevChats, newChat] : [newChat]
    );
    setSelectedChat(newChat._id);
    // streamGptResponse(gptRequestPayload)
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
        if (preferences.mode === "Tutor Session") {
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
        <div className="w-full h-full flex flex-col md:justify-center items-center py-6 px-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // goToNextStage();
            }}
            className="w-full h-4/5 md:h-full rounded-xl bg-white md:h-full flex flex-col justify-start items-center max-w-5xl mx-auto rounded-lg"
          >
            {stage === 1 && (
              <div className="h-full flex flex-col justify-center items-center">
                {" "}
                <div className="flex items-center mb-2 md:mb-4 py-2 px-4">
                  <h1 className="text-center text-gray-700 font-light text-3xl md:text-[2.4rem]">
                    choose your interaction
                  </h1>
                </div>
                <ModelSelect
                  onChange={(value) =>
                    updatePreferences("selectedModel", value)
                  }
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full md:max-w-4xl">
                  {/* Note Generation Selection */}
                  <div
                    className="flex flex-col items-center h-full p-6 md:p-8 bg-gray-100 border rounded-lg cursor-pointer shadow-sm md:hover:shadow-xl md:transform md:transition-all md:duration-500 md:hover:scale-105"
                    onClick={() => {
                      updatePreferences("mode", "Note Generation"),
                        goToNextStage();
                    }}
                  >
                    <h2 className="text-2xl mb-2 md:mb-4 text-gray-700 font-light">
                      note generation
                    </h2>
                    <p className="text-center text-gray-700 h-1/2 mb-4">
                      generate notes in various formats.
                    </p>
                  </div>
                  {/* Tutor Session Selection */}
                  <div
                    className="flex flex-col items-center h-full p-6 md:p-8 bg-gray-100 border rounded-lg cursor-pointer shadow-sm md:hover:shadow-xl md:transform md:transition-all md:duration-500 md:hover:scale-105"
                    onClick={() => {
                      updatePreferences("mode", "Tutor Session"),
                        goToNextStage();
                    }}
                  >
                    <h2 className="text-2xl mb-2 md:mb-4 text-gray-700 font-light">
                      tutoring session
                    </h2>
                    <p className="text-center text-gray-700 h-1/2 mb-4">
                      engage in an academic dialogue with a virtual tutor.
                    </p>
                  </div>
                  {/* Flascard Generation Selection */}
                  <div
                    className="flex flex-col items-center h-full p-6 md:p-8 bg-gray-100 border rounded-lg cursor-pointer shadow-sm md:hover:shadow-xl md:transform md:transition-all md:duration-500 md:hover:scale-105"
                    onClick={() => {
                      updatePreferences("mode", "Flashcard Generation"),
                        goToNextStage();
                    }}
                  >
                    <h2 className="text-2xl mb-2 md:mb-4 text-gray-700 font-light">
                      flashcard generation
                    </h2>
                    <p className="text-center text-gray-700 h-1/2 mb-4">
                      generate a set of flashcards to help you study.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {stage === 2 && (
              <div className="flex flex-col md:justify-between md:justify-center w-full h-full">
                <h2 className="block text-gray-700 text-gray-700 font-lightext-2xl text-center">
                  {preferences.mode === "Tutor Session"
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
                  maxLength={500}
                />
                <GenericInput
                  label="Goal"
                  value={preferences.goal}
                  onChange={(value) => updatePreferences("goal", value)}
                  placeholder="Enter the goal for this interaction"
                  maxLength={500}
                />
                <GenericInput
                  label="Personal Info"
                  value={preferences.personalInfo}
                  onChange={(value) => updatePreferences("personalInfo", value)}
                  placeholder="Enter any personal info you feel is relevant to this interaction e.g. your experience with the topic"
                  maxLength={500}
                />
              </div>
            )}

            {stage === 3 && (
              <div className="flex flex-col justify-between w-full h-full md:h-2/3">
                <h2 className="block text-gray-700 t text-gray-700 font-lightext-2xl text-center">
                  {preferences.mode === "Tutor Session"
                    ? "tutor preferences"
                    : preferences.mode === "Note Generation"
                    ? "note preferences"
                    : "flashcard preferences"}
                </h2>

                {preferences.mode === "Tutor Session" && (
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
                    <GenericInput
                      label="Flashcard Count"
                      value={preferences.flashcardCount}
                      onChange={(value) =>
                        updatePreferences("flashcardCount", value)
                      }
                      options={["10", "20", "30"]}
                    />
                    <GenericSelect
                      label="Flashcard Difficulty"
                      value={preferences.flashcardDifficulty}
                      onChange={(value) =>
                        updatePreferences("flashcardDifficulty", value)
                      }
                      options={["easy", "medium", "hard"]}
                    />
                  </>
                )}
              </div>
            )}
          </form>
          {stage > 1 && (
            <div className="h-1/6 flex justify-center items-start  w-full md:max-w-3xl mt-4 md:mt-0">
              <button
                onClick={goToPreviousStage}
                className="btn-secondary w-3/5 md:w-1/5 mx-2 p-2 rounded-md text-primary text-gray-800 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
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
//     <div className="block text-gray-700 text-2xl text-center w-full">
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
