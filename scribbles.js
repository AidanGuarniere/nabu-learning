const updateSystemMessage = (
    name,
    personalInfo,
    chatInfoPayload,
    chatPreferences
  ) => {
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
            goal &&
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
          goal &&
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
        goal &&
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



  <div className="bg-white border border-gray-800 rounded-md p-4 h-[90vh] w-4/5 ">
  <h1 className="text-center text-gray-800 text-2xl font-light">
    Interaction Info
  </h1>
  <h2 className="px-2 py-3 text-center text-gray-800 font-light text-sm md:text-md">
    This information will be referenced by Nabu to provide a more
    personalized experience for this interaction
  </h2>
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
  {/* <GenericInput
    label="Time Frame"
    value={preferences.timeFrame}
    onChange={(value) => updatePreferences("timeFrame", value)}
    placeholder="What's the timeframe?"
    height={"auto"}
  /> */}
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
    placeholder={`Any other information you feel would be relevant to${
      preferences.mode === "Tutor Session"
        ? "this tutoring session"
        : preferences.mode === "Note Generation"
        ? "these notes"
        : "these flashcards"
    }.`}
    maxLength={1500}
    height={"5rem"}
  />
  <div className="h-1/6 flex justify-center items-start  w-full md:max-w-3xl mt-4 md:mt-0">
    <button
      onClick={goToPreviousStage}
      className="btn-secondary w-3/5 md:w-1/5 mx-2 p-2 rounded-md text-primary text-gray-800 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
    >
      back
    </button>
    {stage < 2 ? (
      <button
        className="btn-primary w-3/5 md:w-1/5 mx-4 p-2 rounded-md text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
        // disabled={!checkIfStageComplete(stage, preferences)}
        onClick={goToNextStage} // Logic to check if all options are filled
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
  {/* <div className="flex justify-center space-x-4">
    <button
      className="bg-red-700 hover:bg-red-600 h-10 py-2 px-4 rounded-md"
      onClick={() => {
        setShowpreferencesForm(false);
      }}
    >
      Cancel
    </button>
    <button
      className="bg-green-400 hover:bg-green-200 h-10 py-2 px-4 rounded-md"
      onClick={() => {
        submitpreferencesForm();
      }}
    >
      Save
    </button>
  </div> */}
</div>