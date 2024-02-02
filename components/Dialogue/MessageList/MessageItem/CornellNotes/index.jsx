import React, { useState, useEffect, useRef } from "react";
import AssistantMessage from "../AssistantMessage";
import CopyButton from "../AssistantMessage/CopyButton"; // Remove if unused

const CornellNotes = ({ cornellNoteData }) => {
  // Assuming this is within your React functional component
  const [cuesAndResponsesState, setCuesAndResponsesState] = useState([]);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    let lastProcessedPosition = 0;
    const processCornellNoteData = (stream) => {
      // If the stream's length is not greater than the last processed position, we return to avoid reprocessing.
      if (stream.length <= lastProcessedPosition) return;

      // Set the current position to the last processed position.
      let currentPosition = lastProcessedPosition;

      // Create a temporary array to store cue-response objects.
      let tempCuesAndResponses = [];

      // Check if the stream contains the 'cuesAndResponses' key, starting from the current position.
      if (stream.includes('"cuesAndResponses": [', currentPosition)) {
        // Update the current position to the start of the cuesAndResponses array.
        currentPosition =
          stream.indexOf('"cuesAndResponses": [', currentPosition) + 21;

        // Process each cue-response object in the array until the end of the stream.
        while (currentPosition < stream.length) {
          // Find the end of the current cue-response object.
          let objectEnd = stream.indexOf("}", currentPosition);
          if (objectEnd === -1) {
            break;
          }

          let cueResponseObj = {};

          // Identify the start and end of the 'cue' value.
          let cueStart = stream.indexOf('"cue": "', currentPosition);
          let cueEnd = stream.indexOf('"', cueStart + 8);

          // If a cue is found and it's within the current object, extract it.
          if (cueStart !== -1 && cueEnd !== -1 && cueStart < objectEnd) {
            cueResponseObj.cue = stream.substring(cueStart + 8, cueEnd);
            currentPosition = cueEnd + 1;
          }

          // Identify the start of the 'responses' array.
          let responsesStart = stream.indexOf(
            '"responses": [',
            currentPosition
          );
          if (responsesStart !== -1 && responsesStart < objectEnd) {
            responsesStart += 14;
            // Find the end of the 'responses' array.
            let responsesEnd = stream.indexOf("]", responsesStart);

            // If responses are found and they are within the current object, extract them.
            if (responsesEnd !== -1 && responsesEnd < objectEnd) {
              cueResponseObj.responses = stream
                .substring(responsesStart, responsesEnd)
                .split(".")
                .map((s) => s.replace(/"/g, ""));
            }
          }

          // Push the constructed cueResponse object to the temp array.
          if (cueResponseObj.cue) {
            tempCuesAndResponses.push(cueResponseObj);
          }

          // Update the current position to after the current cue-response object.
          currentPosition = objectEnd + 1;
        }
      }

      // Identify the start of the 'summary' key.
      let summaryStart = stream.indexOf('"summary": "');
      if (summaryStart !== -1) {
        summaryStart += 12;
        // Find the end of the summary value.
        const potentialEnd = stream.indexOf('."', summaryStart);
        let summaryEnd = potentialEnd !== -1 ? potentialEnd : stream.length;
        // If a summary is found and hasn't been processed before, extract it.
        if (summaryEnd !== -1 && summaryStart >= lastProcessedPosition) {
          let tempSummary = stream.substring(summaryStart, summaryEnd);
          setSummary(tempSummary);
          currentPosition = summaryEnd + 1;
        }
      }

      // Update React state with the extracted cuesAndResponses object array and update the last processed position.
      setCuesAndResponsesState(tempCuesAndResponses);
      lastProcessedPosition = currentPosition;
    };
    processCornellNoteData(cornellNoteData);
  }, [cornellNoteData]);

  return cornellNoteData === '"functionName": "createCornellNotes"' ? null : (
    <div className="border border-gray-400 p-4 w-full">
      <div className="flex flex-wrap">
        {cuesAndResponsesState.length
          ? cuesAndResponsesState.map((item, i) => (
              <div className="w-full flex border-b border-gray-200" key={i}>
                <div className="w-1/3 border-r border-gray-200 flex justify-center md:justify-start">
                  <span className="py-2 text-center md:text-left text-xl font-semibold text-gray-900">
                    {item.cue}
                  </span>
                </div>
                <ul
                  className="w-2/3 py-2 text-gray-900"
                  style={{ listStyleType: "disc" }}
                >
                  {item.responses
                    ? item.responses.map((response, j) =>
                        response.length ? (
                          <li
                            className="mx-[1.6rem] md:px-[-1.6rem] px-0"
                            key={j}
                          >
                            <AssistantMessage
                              message={
                                j > 0
                                  ? response.substring(1, response.length)
                                  : response
                              }
                              isNote={true}
                              key={j}
                            />
                          </li>
                        ) : null
                      )
                    : null}
                </ul>
              </div>
            ))
          : null}
      </div>
      <div className="w-full p-2">
        <AssistantMessage message={summary} isNote={true} />
      </div>
    </div>
  );
};

export default CornellNotes;
