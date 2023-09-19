import { createChunkDecoder } from "ai"
import { data } from "autoprefixer"

// i have an api that will stream a response with an object shaped like:
// {
//   functionName: "",
//   subject: "",
//   cuesAndResponses: [{ cue: "", responses: "" }],
//   summary: "",
// };

// I want to analyze the stream as it is created to look for relevant pieces of data, those being cues, responses, and summary. 
// When found, I want to add this data to the associated state to render in my React component. This process may look something like

// check if "cuesAndResponses" exists in the stream
// if "cuesAndResponses" does exist in the stream
// start looking at content after the index of '"cuesAndResponses": [' for an opening object bracket "{"
// if an object is found within cuesAndResponses
// check for "cue"  
// if "cue" is found
// add it's value to the cues state **if the cue value is updated on future analysis, update the associated state value (streams may provide incomplete field values)
// check for responses array within the same object/index in cuesAndResponses
// if responses array is found
// loop through responses array and add each index of this responses array to the responses state until its closing array bracket ] and the closing bracket of this object/index } is found
// continue looping through cuesAndResponses, starting the loop after the index of the previous object we analyzed (this is to prevent repetative looping over the same content) 
// repeat previous steps until the closing bracket for cuesAndResponses is found 
// check for "summary:"
// if summary is found
// add it's value to the summary state

// i'd assume I would run this sequence each time the stream is updated