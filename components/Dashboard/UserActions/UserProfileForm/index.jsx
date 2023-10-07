import React, { useState, useEffect, useRef } from "react";
import GenericInput from "../../../UtilityComponents/GenericInput";
import { updateUser } from "../../../../utils/userUtils";

const UserProfileForm = ({
  showUserProfileForm,
  setShowUserProfileForm,
  userProfile,
  setUserProfile,
}) => {
  const formRef = useRef();
  const userProfileRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        if (userProfileRef.current !== userProfile) {
          setUserProfile(userProfileRef.current);
        }
        setShowUserProfileForm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [userProfile, setUserProfile, setShowUserProfileForm]);

  const updateUserProfileInputs = (key, value) => {
    setUserProfile((prevUserProfile) => ({
      ...prevUserProfile,
      [key]: value,
    }));
  };

  useEffect(() => {
    userProfileRef.current = userProfile;
  }, []);

  const submitUserProfileForm = () => {
    const userProfilePayload = { ...userProfile };
    if (userProfileRef !== userProfilePayload) {
      updateUser(userProfilePayload);
    }
    setShowUserProfileForm(false);
  };

  return (
    <div className="w-[100vw] md:w-auto fixed inset-0 bg-opacity-50 backdrop-blur-md flex justify-center items-center md:ml-[260px]">
      <div
        ref={formRef}
        className="bg-white border border-gray-800 rounded-md p-6 z-10 w-4/5 md:w-auto"
      >
        <h1 className="text-center text-gray-800 text-2xl font-light">
          User Info
        </h1>
        <h2 className="px-2 py-3 text-center text-gray-800 font-light">
          This information will be referenced by Nabu to provide a more
          personalized experience
        </h2>
        <GenericInput
          label="Name"
          value={userProfile.name}
          onChange={(value) => updateUserProfileInputs("name", value)}
          placeholder="Your desired name"
          maxLength={50}
          height={"auto"}
        />
        <GenericInput
          label="Personal Information"
          value={userProfile.personalInfo}
          onChange={(value) => updateUserProfileInputs("personalInfo", value)}
          placeholder="Any information you think would be relevant to your interactions with Nabu. Interests, occupations, goals, education level, etc."
          maxLength={2000}
          height={"12rem"}
        />
        <div className="flex justify-center mt-4 space-x-4">
          <button
            className="bg-red-700 hover:bg-red-600 h-10 py-2 px-4 rounded-md"
            onClick={() => {
              if (userProfileRef.current !== userProfile) {
                setUserProfile(userProfileRef.current);
              }
              setShowUserProfileForm(false);
            }}
          >
            Cancel
          </button>
          <button
            className="bg-green-400 hover:bg-green-200 h-10 py-2 px-4 rounded-md"
            onClick={() => {
              submitUserProfileForm();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;
