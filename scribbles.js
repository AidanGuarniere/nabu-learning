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