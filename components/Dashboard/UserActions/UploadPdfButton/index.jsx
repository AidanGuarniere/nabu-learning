import React from "react";
import NoteItemIcon  from "../../ChatActions/ChatItem/NoteItemIcon";

const UploadPdfButton = ({ showUploadPdfForm, setShowUploadPdfForm }) => {
  return (
    <button
      className="flex w-full p-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer"
      onClick={() => {
        if (!showUploadPdfForm) setShowUploadPdfForm(true);
      }}
    >
      <NoteItemIcon />
      Documents
    </button>
  );
};

export default UploadPdfButton;