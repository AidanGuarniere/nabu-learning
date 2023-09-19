import React, { useState, useEffect } from "react";
import AssistantMessage from "../AssistantMessage";
import CopyButton from "../AssistantMessage/CopyButton"; // Remove if unused

const CornellNotes = ({ cornellNoteData }) => {
  const [cues, setCues] = useState([]);
  const [responses, setResponses] = useState([]);
  const [summary, setSummary] = useState("");
  // Initial states
  let cuesArray = [];
  let responsesArray = [];
  let summaryString = "";

  let lastProcessedPosition = 0; // This will mark the end of the last processed stream.

  function processData(stream) {
    if (stream.length <= lastProcessedPosition) return;

    let currentPosition = lastProcessedPosition;

    if (stream.includes('"cuesAndResponses": [', currentPosition)) {
      currentPosition =
        stream.indexOf('"cuesAndResponses": [', currentPosition) + 21;

      // Loop through objects within "cuesAndResponses" until we reach the end bracket or end of stream.
      while (currentPosition < stream.length) {
        let objectEnd = stream.indexOf("}", currentPosition);
        if (objectEnd === -1) {
          break; // If no closing bracket is found for the object, we break out and wait for more stream.
        }

        let cueStart = stream.indexOf('"cue": "', currentPosition);
        let cueEnd = stream.indexOf('"', cueStart + 8);

        if (cueStart !== -1 && cueEnd !== -1 && cueStart < objectEnd) {
          let cue = stream.substring(cueStart + 8, cueEnd);
          cuesArray.push(cue);
          console.log("cues",cuesArray)
          currentPosition = cueEnd + 1;
        }

        let responsesStart = stream.indexOf('"responses": [', currentPosition);
        if (responsesStart !== -1 && responsesStart < objectEnd) {
          responsesStart += 14;
          let responsesEnd = stream.indexOf("]", responsesStart);

          if (responsesEnd !== -1 && responsesEnd < objectEnd) {
            let responses = stream
              .substring(responsesStart, responsesEnd)
              .split(",")
              .map((s) => s.trim().replace(/"/g, ""));
            responsesArray.push(...responses);
            console.log("responses",responsesArray)
          }
        }

        currentPosition = objectEnd + 1; // Move the position after the current object's closing bracket.
      }
    }

    let summaryStart = stream.indexOf('"summary": "', currentPosition);
    console.log("start",summaryStart)
    if (summaryStart !== -1) {
      summaryStart += 12;
      let summaryEnd = stream.length;
      console.log("end", summaryEnd)
      if (summaryEnd !== -1 && summaryStart >= lastProcessedPosition) {
        summaryString = stream.substring(summaryStart, summaryEnd);
        console.log("summary",summaryString)
        currentPosition = summaryEnd + 1;
      }
    }

    lastProcessedPosition = currentPosition;
  }
  useEffect(() => {
    processData(cornellNoteData);
  }, [cornellNoteData]);

  // useEffect(() => {
  //   console.log(cues);
  // }, [cues]);

  // useEffect(() => {
  //   console.log(responses);
  // }, [responses]);

  // useEffect(() => {
  //   console.log(summary);
  // }, [summary]);

  return (
    <p>{cornellNoteData}</p>
    // <div className="border border-gray-400 p-4 w-full">
    //   <div className="flex flex-wrap">
    //     {noteObject.cuesAndResponses
    //       ? noteObject.cuesAndResponses.map((item, i) => (
    //           <div className="w-full flex border-b border-gray-200" key={i}>
    //             <div className="w-1/3 border-r border-gray-200 flex justify-center md:justify-start items-center">
    //               <span className="text-center md:text-left text-lg text-gray-900">
    //                 {item.cue}
    //               </span>
    //             </div>
    //             <ul
    //               className="w-2/3 py-2 text-gray-900"
    //               style={{ listStyleType: "disc" }}
    //             >
    //               {item.responses.map((response, j) => (
    //                 <li className="mx-[1.6rem] md:px-[-1.6rem] px-0" key={j}>
    //                   <AssistantMessage
    //                     message={response}
    //                     isNote={true}
    //                     key={j}
    //                   />
    //                 </li>
    //               ))}
    //             </ul>
    //           </div>
    //         ))
    //       : null}
    //   </div>
    //   <div className="w-full p-2">
    //     <AssistantMessage message={noteObject.summary} isNote={true} />
    //   </div>
    // </div>
  );
};

export default CornellNotes;
