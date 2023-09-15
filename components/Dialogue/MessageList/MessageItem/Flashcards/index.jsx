import React, { useState, useEffect, useRef } from "react";
const Flashcards = ({ flashcardData }) => {
  const [cardPairs, setCardPairs] = useState([]);
  const [bufferCount, setBufferCount] = useState(0); // Initialize bufferCount state
  const bufferRef = useRef(new Set());

  useEffect(() => {
    if (flashcardData.length) {
      console.log(flashcardData)
      // chunk complete objects (question answer pairs) from flashcardData
      const regex = /{[^}]+}/g;
      const chunks = flashcardData.match(regex) || [];
      // if chunks are present
      if (chunks.length) {
        // while not all chunks are present in bufferRef
        while (bufferRef.current.size < chunks.length) {
          // for each chunk at an index greater than or equal to the size of bufferRef
          chunks.forEach((chunk, index) => {
            console.log(index, bufferRef.current.size)
            if (index >= bufferRef.current.size) {
              try {
                // try to parse the chunk
                JSON.parse(chunk);
                // if chunk has not been added to buffer and is parseable, add it and increase the count
                if (!bufferRef.current.has(chunk)) {
                  bufferRef.current.add(chunk);
                  if (bufferCount !== bufferRef.current.size)
                    setBufferCount(bufferRef.current.size); // Increment bufferCount every time a new entry is added
                }
              } catch (e) {
                // Do nothing if parsing fails
              }
            }
          });
        }
      }
    }
  }, [flashcardData]);

  useEffect(() => {
    // This will run every time bufferCount updates
    // Convert bufferRef Set to an array and parse each entry, then update cardPairs

    const parsedArray = Array.from(bufferRef.current).map((item) =>
      JSON.parse(item)
    );
    console.log("parsedArr", parsedArray);
    setCardPairs(parsedArray);
  }, [bufferCount]);

  // useEffect(() => {
  //   console.log(cardPairs)
  // }, [cardPairs])

  return (
    <div className="flex flex-wrap justify-center w-full">
      {cardPairs.map((pair, index) => (
        <div className="flex flex-col md:flex-row p-2 md:p-4" key={index}>
          <div className="relative w-80 h-48 m-1 p-4 text-white bg-black rounded-lg">
            <h3 className="absolute top-0 left-0 ml-2 mt-2">
              {`Front - Card ${pair.count || index + 1}`}{" "}
              {/* Using count or fallback to index */}
            </h3>
            <div className="flex items-center justify-center h-full pt-6 text-center text-lg">
              <span className="text-center">{pair.question}</span>
            </div>
          </div>
          <div className="relative w-80 h-48 m-1 p-2 text-black bg-white border border-black rounded-lg">
            <h3 className="absolute top-0 left-0 ml-2 mt-2">
              {`Back - Card ${pair.count || index + 1}`}{" "}
              {/* Using count or fallback to index */}
            </h3>
            <div className="flex items-center justify-center h-full pt-6">
              <p className="text-center">{pair.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Flashcards;
