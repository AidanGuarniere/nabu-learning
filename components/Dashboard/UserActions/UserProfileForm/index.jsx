import React, { useState, useEffect, useRef } from "react";
import GenericInput from "../../../UtilityComponents/GenericInput";

function UserProfileForm({ setShowUserProfileForm }) {
  const formRef = useRef();
  const [userProfile, setUserProfile] = useState({
    name: "",
    personalInfo: "",
  });

  const updateUserProfileInputs = (key, value) => {
    setUserProfile((prevUserProfile) => ({
      ...prevUserProfile,
      [key]: value,
    }));
  };


  useEffect(() => {
    function handleClickOutside(event) {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setShowUserProfileForm(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [setShowUserProfileForm]);

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-md flex justify-center items-center ml-[260px]">
      <div
        ref={formRef}
        className="bg-white border border-gray-800 rounded-md p-6 z-10"
      >
        <GenericInput
          label="Name"
          value={userProfile.name}
          onChange={(value) => updateUserProfileInputs("name", value)}
          placeholder="Your desired name"
          maxLength={80}
        />
        <GenericInput
          label="Personal Information"
          value={userProfile.personalInfo}
          onChange={(value) => updateUserProfileInputs("personalInfo", value)}
          placeholder="Any information you think would be relevant to your interactions with Nabu. Interests, occupation, etc."
          maxLength={500}
        />
      </div>
    </div>
  );
}

export default UserProfileForm;
