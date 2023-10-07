import React, { useState, useEffect } from "react";
import LogoutButton from "./LogoutButton";
import DeleteAllChatsButton from "./DeleteAllChatsButton";
import DarkModeToggle from "./DarkModeToggle";
import UserProfileButton from "./UserProfileButton";
import UserProfileForm from "./UserProfileForm";
import { getUser } from "../../../utils/userUtils";

const UserActions = ({ chats, session, setError, handleDeleteChats }) => {
  const [showUserProfileForm, setShowUserProfileForm] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "",
    personalInfo: "",
  });

  useEffect(() => {
    //TODO add caching
    const getUserInfo = async () => {
      const { name, personalInfo } = await getUser();
      setUserProfile({ name, personalInfo });
    };
    getUserInfo();
  }, []);

  return (
    <div className="w-full z-10 p-[.55rem] bg-gray-900">
      <div className="border-t border-white/20 w-full pt-3 ">
        {session && (
          <>
            {showUserProfileForm && (
              <UserProfileForm
                showUserProfileForm={showUserProfileForm}
                setShowUserProfileForm={setShowUserProfileForm}
                userProfile={userProfile}
                setUserProfile={setUserProfile}
              />
            )}
            <UserProfileButton
              showUserProfileForm={showUserProfileForm}
              setShowUserProfileForm={setShowUserProfileForm}
            />
            {/* <DarkModeToggle /> */}
            <LogoutButton />
          </>
        )}
        {chats.length > 0 && (
          <DeleteAllChatsButton handleDeleteChats={handleDeleteChats} />
        )}
      </div>
    </div>
  );
};

export default UserActions;
