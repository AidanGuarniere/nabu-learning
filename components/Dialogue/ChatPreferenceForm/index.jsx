import React, { useState, useEffect } from "react";
import ModelSelect from "./ModelSelect"; // Import the existing ModelSelect component
import GenericInput from "./GenericInput";
import GenericSelect from "./GenericSelect";
import { createChat } from "../../../utils/chatUtils";
import { sendMessageHistoryToGPT } from "../../../utils/gptUtils";

const PreferencesForm = ({ session, setChats, setSelectedChat, setError }) => {
  // State for Model Selection
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");

  // State for Tutor Type
  const [tutorType, setTutorType] = useState("");

  const [tutorName, setTutorName] = useState("");

  // State for Tutor Behavior
  const [tutorBehavior, setTutorBehavior] = useState("");

  // State for Topic of Discussion
  const [topic, setTopic] = useState("");

  // State for Specific Goal
  const [goal, setGoal] = useState("");

  // State for Personal Information
  const [personalInfo, setPersonalInfo] = useState("");

  // Function to handle form submission
  // Inside PreferencesForm component

  const handleChatPreferencesFormSubmit = async (e) => {
    e.preventDefault();

    // Gather all the preferences into a chatPreferences object
    const userChatPreferences = {
      selectedModel,
      tutorType,
      tutorName,
      tutorBehavior,
      topic,
      goal,
      personalInfo,
    };

    // setLoading(true); // Start loading

    // Call the chat creation logic
    await createNewChat(userChatPreferences);
    setSelectedModel("gpt-3.5-turbo");
    setTutorType("");
    setTutorName("");
    setTutorBehavior("");
    setTopic("");
    setGoal("");
    setPersonalInfo("");
    // setLoading(false); // End loading
  };

  const createNewChat = async (userChatPreferences) => {
    const systemMessageContent = `
    Your name is ${userChatPreferences.tutorName} are a ${
      userChatPreferences.tutorType
    } style tutor instructed to behave according to the following description: ${
      userChatPreferences.tutorBehavior
    }. Stay in character throughout the discussion. 
    The topic of discussion is ${
      userChatPreferences.topic
    }, and the specific goal is ${userChatPreferences.goal}.
    ${
      userChatPreferences.personalInfo
        ? `Here's some additional information on the user, from the user: ${userChatPreferences.personalInfo}`
        : ""
    }
  `;

    const userGreetingContent =
      "Introduce yourself to the user and briefly acknowledge the topic and goal of the discussion";

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
          model: userChatPreferences.selectedModel || "gpt-3.5-turbo",
          tutorType: userChatPreferences.tutorType,
          tutorName: userChatPreferences.tutorName,
          personality: userChatPreferences.tutorBehavior,
          topic: userChatPreferences.topic,
          chatGoal: userChatPreferences.goal,
          personalInfo: userChatPreferences.personalInfo,
        },
        messages: messageHistory,
      };
      try {
        const newChat = await createChat(newChatData);
        setChats((prevChats) =>
          prevChats.length ? [...prevChats, newChat] : [newChat]
        );
        setSelectedChat(newChat._id);
      } catch (error) {
        setError(error);
      }
    }
  };

  // useEffect(() => {
  //   // set state values to default
  // setSelectedModel("gpt-3.5-turbo");
  // setTutorType("");
  // setTutorName("");
  // setTutorBehavior("");
  // setTopic("");
  // setGoal("");
  // setPersonalInfo("");
  // }, []);

  return (
    <form
      onSubmit={handleChatPreferencesFormSubmit}
      className="w-full h-full max-w-5xl mx-auto px-10 bg-white rounded-lg"
    >
      <div className="fixed text-gray-700 text-2xl font-semibold mt-4">
        Discussion Preferences
      </div>
      <div className="h-full w-full py-4">
        <ModelSelect
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col justify-between">
            {" "}
            {/* Flexbox added here */}
            <div className="block text-gray-700 text-xl text-center font-bold mb-2">
              Tutor Information
            </div>
            <GenericSelect
              label="Tutor Type"
              value={tutorType}
              onChange={setTutorType}
              options={["Traditional", "Socratic"]}
            />
            <GenericInput
              label="Tutor Name"
              value={tutorName}
              onChange={setTutorName}
              placeholder="Socrates"
              maxLength={50}
            />
            <GenericInput
              label="Tutor Behavior"
              value={tutorBehavior}
              onChange={setTutorBehavior}
              placeholder="What kind of personality or behavior do you want your tutor to have?"
              maxLength={200}
            />
          </div>
          <div className="flex flex-col justify-between">
            {" "}
            {/* Flexbox added here */}
            <div className="block text-gray-700 text-xl text-center font-bold mb-2">
              Discussion Details
            </div>
            <GenericInput
              label="Topic"
              value={topic}
              onChange={setTopic}
              placeholder="Enter the topic of discussion"
              maxLength={200}
            />
            <GenericInput
              label="Goal"
              value={goal}
              onChange={setGoal}
              placeholder="Enter the goal for this discussion"
              maxLength={200}
            />
            <GenericInput
              label="Personal Info"
              value={personalInfo}
              onChange={setPersonalInfo}
              placeholder="Enter any personal info you feel is relevant to the discussion"
              maxLength={200}
            />
          </div>
        </div>
        <div className="text-center">
          <button
            type="submit"
            className="w-1/6 mt-8 p-2 rounded-md text-white btn-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200 shadow-md"
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  );
};

export default PreferencesForm;
