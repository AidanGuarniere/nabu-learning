import React from "react";
import AssistantMessage from "../AssistantMessage";
import CopyButton from "../AssistantMessage/CopyButton"; // Remove if unused

const CornellNotes = ({ noteData }) => {
  const noteObject = JSON.parse(noteData.arguments);

  return (
    <div className="border border-gray-400 p-4 w-full">
      <div className="flex flex-wrap">
        {noteObject.cuesAndResponses.map((item, i) => (
          <div className="w-full flex border-b border-gray-200" key={i}>
            <div className="w-1/3 border-r border-gray-200 flex justify-center md:justify-start items-center">
              <span className="text-center md:text-left text-lg text-gray-900">
                {item.cue}
              </span>
            </div>
           <ul  className="w-2/3 py-2 text-gray-900" style={{ listStyleType: 'disc'}}>

              {item.responses.map((response, j) => (
                <li className="mx-[1.6rem] md:px-[-1.6rem] px-0" key={j}>
                  <AssistantMessage message={response} isNote={true} key={j} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="w-full p-2">
        <AssistantMessage message={noteObject.summary} isNote={true} />
      </div>
    </div>
  );
};

export default CornellNotes;
