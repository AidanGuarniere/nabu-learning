import React, { useState, useEffect, useRef } from "react";
import GenericInput from "../../../UtilityComponents/GenericInput";
import { updateUser } from "../../../../utils/userUtils";

const UploadPdfForm = ({ showUploadPdfForm, setShowUploadPdfForm }) => {
  const formRef: any = useRef();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    console.log(files);
  }, [files]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files || files.length < 1) return;

    try {
      const data = new FormData();
      for (let file of files) {
        data.append("files", file);
      }

      const res = await fetch("/api/uploadPDF", {
        method: "POST",
        body: data,
      });
      // handle the error
      if (!res.ok) throw new Error(await res.text());
    } catch (e: any) {
      // Handle errors here
      console.error(e);
    }
  };
  const removeFile = (indexToRemove: number) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);

      // Clear the input so the next selection can be added to the existing files
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setShowUploadPdfForm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [setShowUploadPdfForm]);

  return (
    <div className="w-[100vw] md:w-auto fixed inset-0 bg-opacity-50 backdrop-blur-md flex justify-center items-center md:ml-[260px]">
      <div
        ref={formRef}
        className="bg-white border border-gray-800 rounded-md p-6 z-10 w-4/5 h-4/5"
      >
        <div>
          <form onSubmit={onSubmit}>
            <div className="flex justify-between items-center">
              <label
                htmlFor="fileInput"
                className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 text-xl font-light cursor-pointer"
              >
                Select PDFs
              </label>
              <button
                className={`p-2 bg-red-600 ${
                  files.length === 0 && "bg-red-800"
                } text-white rounded-md text-xl font-light`}
                onClick={(e) => {
                  e.preventDefault;
                  if (files.length > 0) {
                    setFiles([]);
                  }
                }}
              >
                Clear all
              </button>
            </div>
            <input
              id="fileInput"
              ref={fileInputRef}
              className="hidden"
              type="file"
              name="pdf"
              accept=".pdf"
              multiple
              onChange={handleFileChange}
            />
            <div className="buffer h-4 w-full"></div>
            {files && (
              <ul className="bg-gray-100 border border-gray-800 rounded-md min-h-[3.25rem] max-h-[16.9rem] overflow-auto">
                {files.length ? (
                  files.map((file, index) => (
                    <li
                      key={index}
                      className={`flex justify-between items-center text-gray-800 text-lg py-2 px-4 truncate whitespace-nowrap ${
                        index < files.length - 1 && "border-b border-gray-800"
                      }`}
                    >
                      {file.name}
                      <button
                        className="p-2 bg-gray-800 font-light text-white rounded-md vertical-middle hover:bg-gray-600 "
                        onClick={() => removeFile(index)}
                      >
                        <svg
                          stroke="currentColor"
                          fill="none"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                          height="1em"
                          width="1em"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-800 text-lg py-2 px-4">
                    No files selected
                  </li>
                )}
              </ul>
            )}

            <div className="absolute left-0 bottom-24 md:bottom-[7rem] flex justify-center items-start w-full">
              <button
                className="btn-secondary w-2/5 md:w-1/5 mx-2 p-1 md:p-2 rounded-md text-primary text-gray-800 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
                onClick={() => {
                  setShowUploadPdfForm(false);
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary w-2/5 md:w-1/5 mx-4 p-1 md:p-2 rounded-md text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
                type="submit"
              >
                Upload
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPdfForm;

{
  /* <div className="border border-gray-800 rounded-md my-4">
<ul>example previously-uploaded file name</ul>
</div> */
}
