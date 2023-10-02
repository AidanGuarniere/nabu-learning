import React, { useState } from "react";
import LogoutButton from "./LogoutButton";
import DeleteAllChatsButton from "./DeleteAllChatsButton";
import DarkModeToggle from "./DarkModeToggle";
import UserProfileButton from "./UserProfileButton";
import UserProfileForm from "./UserProfileForm";

const UserActions = ({ chats, session, setError, handleDeleteChats }) => {
  const [showUserProfileForm, setShowUserProfileForm] = useState(false);
  return (
    <div className="w-full z-10 p-[.55rem] bg-gray-900">
      <div className="border-t border-white/20 w-full pt-3 ">
        {session && (
          <>
            {showUserProfileForm && <UserProfileForm showUserProfileForm={showUserProfileForm} setShowUserProfileForm={setShowUserProfileForm}/>}
            <UserProfileButton showUserProfileForm={showUserProfileForm} setShowUserProfileForm={setShowUserProfileForm}/>
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
}

export default UserActions;
