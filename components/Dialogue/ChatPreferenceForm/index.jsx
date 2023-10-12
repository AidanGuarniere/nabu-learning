import React, { useState, useEffect, useRef } from "react";
import ModelSelect from "./ModelSelect"; // Import the existing ModelSelect component
import GenericInput from "../../UtilityComponents/GenericInput";
import GenericSelect from "../../UtilityComponents/GenericSelect";
import { createChat } from "../../../utils/chatUtils";
import { getUser } from "../../../utils/userUtils";
import DescribeContextForm from "./DescribeContextForm";

const ProgressBar = ({ stage }) => {
  return (
    <div className="relative w-full">
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-300 w-full">
        <div
          style={{ width: `${((stage - 1) / 2) * 100}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-200 transition-all duration-500"
        >
          <div className="absolute  w-full flex justify-between items-center z-20">
            <div
              className={`flex justify-center items-center h-10 w-10 md:h-12 md:w-12 rounded-[2rem] align-middle transition-all duration-500 ${
                stage >= 1
                  ? "bg-white text-green-200 border border-green-200"
                  : "bg-gray-300"
              }`}
            >
              <div className=""></div>
              <span className="text-lg">{stage > 1 ? "✓" : "1"}</span>
            </div>
            <div
              className={`flex justify-center items-center h-10 w-10 md:h-12 md:w-12 rounded-[2rem] align-middle transition-all duration-500 ${
                stage >= 2
                  ? "bg-white text-green-200 border border-green-200"
                  : "bg-gray-300"
              }`}
            >
              <span className="text-lg">{stage > 2 ? "✓" : "2"}</span>
            </div>
            <div
              className={`flex justify-center items-center h-10 w-10 md:h-12 md:w-12 rounded-[2rem] align-middle transition-all duration-500 ${
                stage >= 3
                  ? "bg-white text-green-200 border border-green-200"
                  : "bg-gray-300"
              }`}
            >
              <span className="text-lg">{stage > 3 ? "✓" : "3"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    mode: "",
    selectedModel: "gpt-3.5-turbo",
    topic: "",
    keyConcepts: [""],
    priorKnowledge: "",
    learningStyle: "",
    challenges: "",
    // timeFrame: Frame,
    goal: "",
    tutorType: "",
    tutorName: "",
    tutorBehavior: "",
    noteType: "",
    noteTitle: "",
    noteTone: "",
    flashcardDifficulty: "",
    flashcardCount: 10,
    additionalInfo: "",
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

  const handleChatPreferencesFormSubmit = async (e, userChatPreferences) => {
    e.preventDefault();

    // setLoading(true); // Start loading

    // Call the chat creation logic
    const { name, personalInfo } = await getUser();
    await createNewChat(name, personalInfo, userChatPreferences);
    setLoading(false); // End loading
  };
  const createNewChat = async (name, personalInfo, userChatPreferences) => {
    setLoading(true);

    // system message logic
    let systemMessageContent;
    if (userChatPreferences.mode === "Tutor Session") {
      const socraticAddition = (tutorType) =>
        tutorType === "Socratic"
          ? "The user seeks a Socratic dialogue. Ask probing questions to foster critical thinking and explore underlying assumptions, but continue the momentum of the conversation."
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
            name &&
            `The user you are interacting with is named ${name} and must be referred to as ${name} unless requested otherwise`
          }
          ${
            personalInfo &&
            `Additional information about the user, from the user: ${personalInfo}`
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
          name &&
          `The user you are interacting with is named ${name} and must be referred to as ${name} unless requested otherwise`
        }
        ${
          personalInfo &&
          `Additional information about the user, from the user: ${personalInfo}`
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
        name &&
        `The user you are interacting with is named ${name} and must be referred to as ${name} unless requested otherwise`
      }
      ${
        personalInfo &&
        `Additional information about the user, from the user: ${personalInfo}`
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

  // useEffect(() => {
  //   console.log(preferences);
  // }, [preferences]);

  return (
    <div className="w-full h-full ">
      {loading ? (
        "loading"
      ) : (
        <div className="w-full h-full flex flex-col md:justify-center items-center py-8 md:py-6 px-4">
          <ProgressBar stage={stage} />
          {stage === 1 ? (
            <div className="absolute top-[3.5rem] md:top-16 md:mb-2 py-2 px-4">
              <h1 className="text-center text-gray-700 font-light text-2xl md:text-5xl">
                choose your interaction
              </h1>
            </div>
          ) : stage === 2 ? (
            <div className="absolute top-[3.5rem] md:top-16 md:mb-2 py-2 px-4">
              <h1 className="text-center text-gray-700 font-light text-2xl md:text-5xl">
                provide some context
              </h1>
            </div>
          ) : stage === 3 ? (
            <div className="absolute top-[3.5rem] md:top-16 md:mb-2 py-2 px-4">
              <h1 className="text-center text-gray-700 font-light text-2xl md:text-5xl">
                confirm your preferences
              </h1>
            </div>
          ) : null}
          <form className="w-full h-full md:h-full rounded-xl bg-white md:h-full flex flex-col justify-start items-center max-w-5xl mx-auto rounded-lg pt-10 md:pt-16">
            {stage === 1 && (
              <div className="h-full flex flex-col md:justify-center items-center">
                <ModelSelect
                  onChange={(value) =>
                    updatePreferences("selectedModel", value)
                  }
                />
                <div className="h-2/3 md:h-auto grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 w-full md:max-w-5xl">
                  {/* Note Generation Selection */}
                  <div
                    className="flex flex-col items-center h-full p-2 md:p-8 bg-gray-100 border rounded-lg cursor-pointer shadow-sm md:hover:shadow-xl md:transform md:transition-all md:duration-500 md:hover:scale-105"
                    onClick={() => {
                      updatePreferences("mode", "Note Generation");
                      goToNextStage();
                    }}
                  >
                    <h2 className="text-xl md:text-2xl md:mb-4 text-gray-700 font-light">
                      note generation
                    </h2>
                    <p className="text-small md:text-md text-center text-gray-700 h-1/2 md:mb-4">
                      generate notes in various formats.
                    </p>
                  </div>
                  {/* Tutor Session Selection */}
                  <div
                    className="flex flex-col items-center h-full p-2 md:p-8 bg-gray-100 border rounded-lg cursor-pointer shadow-sm md:hover:shadow-xl md:transform md:transition-all md:duration-500 md:hover:scale-105"
                    onClick={() => {
                      updatePreferences("mode", "Tutor Session");
                      goToNextStage();
                    }}
                  >
                    <h2 className="text-xl md:text-2xl md:mb-4 text-gray-700 font-light">
                      tutoring session
                    </h2>
                    <p className="text-small md:text-md text-center text-gray-700 h-1/2 md:mb-4">
                      engage in an academic dialogue with a virtual tutor.
                    </p>
                  </div>
                  {/* Flascard Generation Selection */}
                  <div
                    className="flex flex-col items-center h-full p-2 md:p-8 bg-gray-100 border rounded-lg cursor-pointer shadow-sm md:hover:shadow-xl md:transform md:transition-all md:duration-500 md:hover:scale-105"
                    onClick={() => {
                      updatePreferences("mode", "Flashcard Generation");
                      goToNextStage();
                    }}
                  >
                    <h2 className="text-xl md:text-2xl md:mb-4 text-gray-700 font-light">
                      flashcard generation
                    </h2>
                    <p className="text-small md:text-md text-center text-gray-700 h-1/2 md:mb-4">
                      generate a set of flashcards to help you study.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {stage === 2 && (
              <div className="h-full flex flex-col justify-start">
                <DescribeContextForm
                  preferences={preferences}
                  updatePreferences={updatePreferences}
                  goToPreviousStage={goToPreviousStage}
                  goToNextStage={goToNextStage}
                />
              </div>
            )}
            {stage === 3 && (
              <>
                <h2 className="p-0 text-center text-gray-800 font-light text-xs md:text-lg">
                  This information will be referenced by Nabu to provide a more
                  personalized interaction
                </h2>
                <div className="bg-white rounded-md md:px-4 h-[72.5%] md:h-full overflow-y-auto md:overflow-hidden w-full md:pt-4">
                  {/* <h1 className="text-center text-gray-800 text-2xl font-light">
                    Interaction Info
                  </h1> */}
                  <GenericInput
                    label="Topic"
                    value={preferences.topic}
                    onChange={(value) => updatePreferences("topic", value)}
                    placeholder={`What is the topic of ${
                      preferences.mode === "Tutor Session"
                        ? "this tutoring session"
                        : preferences.mode === "Note Generation"
                        ? "these notes"
                        : "these flashcards"
                    }?`}
                    maxLength={500}
                    height={"auto"}
                  />
                  <GenericInput
                    label="Goal"
                    value={preferences.goal}
                    onChange={(value) => updatePreferences("goal", value)}
                    placeholder={`What is the goal ${
                      preferences.mode === "Tutor Session"
                        ? "for this tutoring session"
                        : preferences.mode === "Note Generation"
                        ? "in writing these notes"
                        : "in making these flashcards"
                    }?`}
                    maxLength={500}
                    height={"auto"}
                  />

                  {preferences.mode === "Tutor Session" && (
                    <>
                      <div className="flex justify-between">
                        <div className="w-1/2 pr-2">
                          <GenericSelect
                            label="Tutor Type"
                            value={preferences.tutorType}
                            onChange={(value) =>
                              updatePreferences("tutorType", value)
                            }
                            options={["Traditional", "Socratic"]}
                            height="3.5rem"
                          />
                        </div>
                        <div className="w-1/2 pl-2">
                          <GenericInput
                            label="Tutor Name"
                            value={preferences.tutorName}
                            onChange={(value) =>
                              updatePreferences("tutorName", value)
                            }
                            placeholder="What name would you like your tutor to have? E.g. Socrates"
                            maxLength={50}
                          />
                        </div>
                      </div>
                      <GenericInput
                        label="Tutor Behavior"
                        value={preferences.tutorBehavior}
                        onChange={(value) =>
                          updatePreferences("tutorBehavior", value)
                        }
                        placeholder="What kind of personality or behavior do you want your tutor to have?"
                        maxLength={200}
                      />{" "}
                    </>
                  )}
                  {preferences.mode === "Note Generation" && (
                    <>
                      <div className="flex justify-between">
                        <div className="w-1/2 pr-2">
                          <GenericSelect
                            label="Note Type"
                            value={preferences.noteType}
                            onChange={(value) =>
                              updatePreferences("noteType", value)
                            }
                            options={["Summary", "Cornell", "Outline"]}
                            height="3.5rem"
                          />
                        </div>
                        <div className="w-1/2 pl-2">
                          <GenericInput
                            label="Note Title"
                            value={preferences.noteTitle}
                            onChange={(value) =>
                              updatePreferences("noteTitle", value)
                            }
                            placeholder="Enter your note title here"
                            maxLength={50}
                          />
                        </div>
                      </div>
                      <GenericInput
                        label="Writing Style"
                        value={preferences.noteWritingStyle}
                        onChange={(value) =>
                          updatePreferences("noteWritingStyle", value)
                        }
                        placeholder="Specify your preferred writing style"
                        maxLength={200}
                      />{" "}
                    </>
                  )}
                  {preferences.mode === "Flashcard Generation" && (
                    <>
                      <GenericSelect
                        label="Flashcard Difficulty"
                        value={preferences.flashcardDifficulty}
                        onChange={(value) =>
                          updatePreferences("flashcardDifficulty", value)
                        }
                        options={["Easy", "Medium", "Hard"]}
                        height="3.5rem"
                      />
                    </>
                  )}
                  <GenericInput
                    label="Additional Info"
                    value={preferences.additionalInfo}
                    onChange={(value) =>
                      updatePreferences("additionalInfo", value)
                    }
                    placeholder={`Any other information you feel would be relevant to ${
                      preferences.mode === "Tutor Session"
                        ? "this tutoring session"
                        : preferences.mode === "Note Generation"
                        ? "these notes"
                        : "these flashcards"
                    }.`}
                    maxLength={1500}
                    height={"5rem"}
                  />
                </div>
                <div className="absolute left-0 bottom-24 md:bottom-[2.5rem] md:pl-[260px] flex justify-center items-start w-full">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      goToPreviousStage();
                    }}
                    className="btn-secondary w-3/5 md:w-1/5 mx-2 p-1 md:p-2 rounded-md text-primary text-gray-800 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
                  >
                    back
                  </button>
                  <button
                    className="btn-primary w-3/5 md:w-1/5 mx-4 p-1 md:p-2 rounded-md text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
                    onClick={(e) => {
                      const userChatPreferences = { ...preferences };
                      handleChatPreferencesFormSubmit(e, userChatPreferences);
                    }}
                  >
                    submit
                  </button>
                </div>
              </>
            )}
            {/* {stage > 1 && (
              <div className="h-1/6 flex justify-center items-start  w-full md:max-w-3xl mt-4 md:mt-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    goToPreviousStage();
                  }}
                  className="btn-secondary w-3/5 md:w-1/5 mx-2 p-2 rounded-md text-primary text-gray-800 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
                >
                  back
                </button>
                {stage < 3 ? (
                  <button
                    className="btn-primary w-3/5 md:w-1/5 mx-4 p-2 rounded-md text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
                    // disabled={!checkIfStageComplete(stage, preferences)}
                    onClick={(e) => {
                      e.preventDefault();
                      goToNextStage();
                    }} // Logic to check if all options are filled
                  >
                    next
                  </button>
                ) : (
                  <button
                    className="btn-primary w-3/5 md:w-1/5 mx-4 p-2 rounded-md text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
                    onClick={(e) => {
                      const userChatPreferences = { ...preferences };
                      handleChatPreferencesFormSubmit(e, userChatPreferences);
                    }}
                  >
                    submit
                  </button>
                )}
              </div>
            )} */}
          </form>
        </div>
      )}
    </div>
  );
};

export default PreferencesForm;
