import React, { useState, useEffect, useRef } from "react";
import streamGptContextResponse from "../../../../utils/streamGptContextResponse";

const DescribeContextForm = ({
  preferences,
  updatePreferences,
  goToPreviousStage,
  goToNextStage,
}) => {
  const [context, setContext] = useState({});
  const [contextStream, setContextStream] = useState("");
  const [loadingContext, setLoadingContext] = useState(false);
  const [userContextDescription, setuserContextDescription] = useState("");
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setuserContextDescription(e.target.value);
    // e.target.style.height = "auto";
    // e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitContext(e);
    }
  };
  let lastProcessedPosition = 0;

  const processContext = (stream) => {
    if (stream.length <= lastProcessedPosition) return;

    let currentPosition = lastProcessedPosition;
    let insideString = false;

    while (currentPosition < stream.length) {
      let keyStart = stream.indexOf('"', currentPosition);
      if (keyStart === -1) break;

      let keyEnd = stream.indexOf('"', keyStart + 1);
      if (keyEnd === -1) {
        currentPosition = keyStart + 1;
        break;
      }

      let key = stream.substring(keyStart + 1, keyEnd);

      let valueStart = stream.indexOf(":", keyEnd) + 1;
      if (valueStart === 0) {
        currentPosition = keyEnd + 1;
        break;
      }

      let valueEnd = valueStart;

      while (valueEnd < stream.length) {
        const currentChar = stream.charAt(valueEnd);
        if (currentChar === '"') insideString = !insideString;
        if (!insideString && (currentChar === "," || currentChar === "}"))
          break;
        valueEnd++;
      }

      if (valueEnd >= stream.length) {
        currentPosition = valueEnd;
        break;
      }

      try {
        const value = JSON.parse(stream.substring(valueStart, valueEnd).trim());
        console.log(key, value);
        updatePreferences(key, value);
      } catch (e) {
        console.error(
          "Invalid JSON encountered. Skipping this key-value pair."
        );
      }

      currentPosition = valueEnd + 1;
    }

    lastProcessedPosition = currentPosition;
  };

  useEffect(() => {
    setContextStream("");
    setContext({});
    setLoadingContext(false);
  }, [setContextStream, setContext, setLoadingContext]);

  useEffect(() => {
    processContext(contextStream);
  }, [contextStream, processContext]);

  const submitContext = async (e) => {
    e.preventDefault;
    const currentPreferences = { ...preferences };
    setContext({});
    setContextStream("");
    setLoadingContext(true);
    const messageModel = "gpt-4";
    const commitChatContext = {
      name: "commitChatContext",
      description:
        "Commits the gathered chat preferences to initiate a customized interaction.",
      parameters: {
        type: "object",
        properties: {
          mode: {
            type: "string",
            description: "The interaction mode chosen by the user.",
            enum: ["Tutor Session", "Note Generation", "Flashcard Generation"],
          },
          selectedModel: {
            type: "string",
            description: "The language model selected for the interaction.",
            enum: ["gpt-3.5-turbo", "gpt-4"],
          },
          topic: {
            type: "string",
            description: "The main topic for the interaction.",
            maxLength: 500,
          },
          keyConcepts: {
            type: "array",
            description: "Array of key concepts related to the topic.",
            items: {
              type: "string",
            },
            maxLength: 10,
          },
          priorKnowledge: {
            type: "string",
            description: "User's prior knowledge level about the topic.",
            enum: ["", "Beginner", "Intermediate", "Advanced"],
          },
          learningStyle: {
            type: "string",
            description: "Preferred learning style of the user.",
            enum: ["", "Visual", "Auditory", "Kinesthetic", "Reading/Writing"],
          },
          challenges: {
            type: "array",
            description: "List of challenges the user faces.",
            items: {
              type: "string",
            },
            maxLength: 5,
          },
          timeFrame: {
            type: "string",
            description: "The time frame for achieving the goal.",
          },
          goal: {
            type: "string",
            description: "The user's objective for the interaction.",
            maxLength: 500,
          },
          tutorType: {
            type: "string",
            description: "The type of tutor interaction.",
            enum: ["", "Traditional", "Socratic"],
          },
          tutorName: {
            type: "string",
            description: "The name of the tutor persona.",
            maxLength: 50,
          },
          tutorBehavior: {
            type: "string",
            description: "Behavior characteristics for the tutor.",
            maxLength: 50,
          },
          noteType: {
            type: "string",
            description: "Type of note to be generated.",
            enum: ["", "Summary", "Cornell", "Outline"],
          },
          noteTitle: {
            type: "string",
            description: "The title for the notes.",
            maxLength: 100,
          },
          noteTone: {
            type: "string",
            description: "The tone for the notes.",
            maxLength: 100,
          },
          flashcardDifficulty: {
            type: "string",
            description: "Difficulty level for the flashcards.",
            enum: ["", "Easy", "Medium", "Hard"],
          },
          flashcardCount: {
            type: "number",
            description: "The number of flashcards to generate.",
          },
          additionalInfo: {
            type: "string",
            description:
              "Any additional information or context you can extrapolate from the user's message that may be relevant.",
            maxLength: 1500,
          },
        },
        required: ["functionName", "mode", "selectedModel"],
      },
    };

    const initialMessage = {
      role: "system",
      //change
      content: `You are to analyze the user's message and extrapolate as much relevant context for the following ${preferences.mode} as you can by fulfilling the object described in commitChatContext.`,
    };
    const userMessageContext = { ...userContextDescription };
    const messageHistory = [
      initialMessage,
      //add content
      {
        role: "user",
        content: `here is the user's context in natural language: ${userContextDescription}. and here is the existing context: ${currentPreferences}`,
      },
    ];
    const gptRequestPayload = {
      model: messageModel,
      messages: messageHistory,
      functions: [commitChatContext],
      function_call: { name: "commitChatContext" },
    };

    streamGptContextResponse(
      gptRequestPayload,
      setContextStream,
      setLoadingContext,
      goToNextStage
    );
  };
  // useEffect(() => {
  //   console.log("stream",contextStream);
  // }, [contextStream]);

  return (
    <div className="stretch flex flex-col w-full h-full justify-start md:justify-center ">
      <h1 className="text-sm md:text-xl font-light text-center text-gray-800 md:py-4 max-w-4xl">
        Write a few sentences about the topic you want to study, your learning
        goals, or anything else you think would be relevant to your tutoring
        session.
      </h1>
      <div className="h-full">
        <form
          className="flex h-2/3 md:h-3/4 flex-row gap-3 w-full mx-auto max-w-[96%] md:max-w-md lg:max-w-2xl xl:max-w-3xl mt-2 mb-1 sm:pl-3.5 py-2 sm:py-3.5 pr-0 relative border border-black/10 
               bg-white rounded-[.4325rem] dark:border-gray-900/50 dark:text-white dark:bg-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)] sm:min-h-[1rem] "
          onSubmit={(e) => {
            submitContext(e);
            // textareaRef.current.style.height = "auto";
          }}
          style={{ boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.1)" }}
        >
          <div className="w-full p-0 m-0">
            <textarea
              ref={textareaRef}
              className="resize-none h-full md:h-full w-full m-0 border-0 bg-transparent p-0 pl-2 pr-7 focus:ring-0 
                   focus-visible:ring-0 focus:outline-none focus:border-0 dark:bg-transparent md:pl-1 font-mendium align-top placeholder-gray-500 text-gray-700"
              tabIndex="0"
              placeholder="e.g. I want to study linear algebra to learn more about AI."
              data-id="root"
              value={userContextDescription}
              onChange={handleChange}
              minLength="1"
              spellCheck="false"
              rows={1}
              style={{
                minHeight: "1rem",
                fontSize: "1.12rem",
                // maxHeight: "28rem",
                lineHeight: "1.5rem",
              }}
              onKeyDown={handleKeyDown}
            ></textarea>
          </div>

          <button
            type="submit"
            className={`absolute p-1 rounded-md bottom-1.5 sm:bottom-3 right-1 md:right-2 hover:bg-gray-100 
                  dark:hover:text-gray-300 dark:hover:bg-gray-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent 
                  ${loadingContext ? "loading-icon" : null} ${
              userContextDescription.length === 0
                ? "text-gray-300 dark:text-gray-600"
                : "text-gray-500"
            }
                 `}
            disabled={loadingContext || userContextDescription.length === 0}
            onClick={(e) => {
              submitContext(e);
              // textareaRef.current.style.height = "auto";
            }}
          >
            {!loadingContext && (
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[1.12rem] w-[1.12rem] mr-1"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </form>
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
          className="btn-primary w-3/5 md:w-1/5 mx-2 p-1 md:p-2 rounded-md text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
          // disabled={!checkIfStageComplete(stage, preferences)}
          onClick={(e) => {
            e.preventDefault();
            if (userContextDescription) {
              submitContext(e);
            } else {
              goToNextStage();
            }
          }} // Logic to check if all options are filled
        >
          next
        </button>
      </div>
    </div>
  );
};

export default DescribeContextForm;
