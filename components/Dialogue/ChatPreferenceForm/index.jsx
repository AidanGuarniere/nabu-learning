import React, { useState } from "react";
import ModelSelect from "./ModelSelect"; // Import the existing ModelSelect component
import GenericInput from "./GenericInput";
import GenericSelect from "./GenericSelect";

const PreferencesForm = ({ setChatPreferences }) => {
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
  const handleChatPreferencesFormSubmit = (e) => {
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

    // update chatPreferences upon form submission
    setChatPreferences(userChatPreferences);

    // set state values to default
    setSelectedModel("gpt-3.5-turbo");
    setTutorType("");
    setTutorName("");
    setTutorBehavior("");
    setTopic("");
    setGoal("");
    setPersonalInfo("");
  };


  return (
    <form
      onSubmit={handleChatPreferencesFormSubmit}
      className="w-full h-full py-6 px-10 border bg-gray-100 rounded-lg shadow-md"
    >
      <ModelSelect
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />
      <div className="flex flex-wrap -mx-3">
        <div className="w-full md:w-1/2 p-3 flex flex-col">
          <GenericInput
            label="Tutor Name"
            value={tutorName}
            onChange={setTutorName}
            placeholder="Socrates"
          />
          <GenericSelect
            label="Tutor Type"
            value={tutorType}
            onChange={setTutorType}
            options={["Traditional", "Socratic"]}
          />
          <GenericInput
            label="Tutor Behavior"
            value={tutorBehavior}
            onChange={setTutorBehavior}
            placeholder="What kind of personality or behavior do you want your tutor to have?"
          />
        </div>
        <div className="w-full md:w-1/2 p-3 flex flex-col">
          <GenericInput
            label="Topic"
            value={topic}
            onChange={setTopic}
            placeholder="Enter the topic of discussion"
          />
          <GenericInput
            label="Goal"
            value={goal}
            onChange={setGoal}
            placeholder="Enter the goal for this discussion"
          />
          <GenericInput
            label="Personal Info"
            value={personalInfo}
            onChange={setPersonalInfo}
            placeholder="Enter any personal info you feel is relevant to the discussion"
          />
        </div>
      </div>

      <div className="text-center mt-6">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default PreferencesForm;
