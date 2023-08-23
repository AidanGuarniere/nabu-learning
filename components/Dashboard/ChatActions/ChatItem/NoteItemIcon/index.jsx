import React from "react";

export default function NoteItemIcon() {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[1.125rem] w-[1.125rem]"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Binding */}
      {/* <rect x="3" y="2" width="1" height="20" fill="currentColor" /> */}
      {/* Cover */}
      <path
  d="M6 2 h14 a2 2 0 0 1 2 2 v16 a2 2 0 0 1 -2 2 h-14 a2 2 0 0 1 -2 -2 v-16 a2 2 0 0 1 2 -2 z"
  fill="none"
  stroke="currentColor"
/>


      {/* Lines */}
      <line x1="8" y1="6" x2="18" y2="6" stroke="currentColor" />
      <line x1="8" y1="10" x2="18" y2="10" stroke="currentColor" />
      <line x1="8" y1="14" x2="18" y2="14" stroke="currentColor" />
      <line x1="8" y1="18" x2="18" y2="18" stroke="currentColor" />
    </svg>
  );
}
