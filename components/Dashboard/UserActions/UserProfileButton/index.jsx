import React from "react";

function UserProfileButton({showUserProfileForm, setShowUserProfileForm}) {
  return (
    <button
      className="flex w-full p-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer"
      onClick={() => {
        setShowUserProfileForm(!showUserProfileForm);
      }}
    >
      <svg
        className="h-4 w-4"
        height="1em"
        width="1em"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        {/* Head */}
        <circle cx="12" cy="7" r="4" />

        {/* Neck */}
        <rect x="10" y="11" width="4" height="2" />

        {/* Shoulders */}
        <rect x="4" y="13" width="16" height="4" />
      </svg>
      User Info
    </button>
  );
}

export default UserProfileButton;
