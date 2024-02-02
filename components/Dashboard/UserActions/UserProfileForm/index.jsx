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
    if (userProfileRef.current !== userProfile) {
      userProfileRef.current = userProfile;
    }
  }, [userProfile]);

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
            className="btn-secondary w-2/5 md:w-1/5 mx-2 p-1 md:p-2 rounded-md text-primary text-gray-800 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
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
            className="btn-primary w-2/5 md:w-1/5 mx-4 p-1 md:p-2 rounded-md text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
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
