import React from "react";

export default function FlashcardIcon() {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 32 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[1.125rem] w-[1.125rem]"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* First Flashcard Background */}
      <rect
        x="2"
        y="2"
        rx="4" // More rounded corners
        ry="4" // More rounded corners
        width="23"
        height="16"
        stroke="currentColor"
      />
      
      {/* Second Flashcard Background - Slightly Overlapping */}
      <rect
        x="8"
        y="8"
        rx="4" // More rounded corners
        ry="4" // More rounded corners
        width="23"
        height="16"
        stroke="currentColor"
        fill="white"
      />
    </svg>
  );
}
