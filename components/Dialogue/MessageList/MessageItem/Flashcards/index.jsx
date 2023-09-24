import React, { useState, useEffect, useRef } from "react";
const FlashCard = ({ pair, index }) => {
  const [showFront, setShowFront] = useState(true);
  const toggleCard = () => setShowFront(!showFront);

  return (
    <div className={`w-80 h-48 m-1 p-4 rounded-lg border border-black ${showFront ? 'bg-black text-white' : 'bg-white text-gray-800'}`} onClick={toggleCard}>
      <h3>{`Card ${pair.count || index + 1}`} {showFront ? 'front' : 'back'}</h3>
      <div className="flex items-center justify-center h-full pt-6">
        <span>{showFront ? pair.question : pair.answer}</span>
      </div>
    </div>
  );
};

const Flashcards = ({ flashcardData }) => {
  const [cardPairs, setCardPairs] = useState([]);
  const [bufferCount, setBufferCount] = useState(0); // Initialize bufferCount state
  const [flip, setFlip] = useState(false)
  const bufferRef = useRef(new Set());

  useEffect(() => {
    if (flashcardData.length) {
      // console.log("flashcardData",flashcardData)
      // chunk complete objects (question answer pairs) from flashcardData
      const regex = /{[^}]+}/g;
      const chunks = flashcardData.match(regex) || [];
      // if chunks are present
      if (chunks.length) {
        // while not all chunks are present in bufferRef
        while (bufferRef.current.size < chunks.length) {
          // for each chunk at an index greater than or equal to the size of bufferRef
          chunks.forEach((chunk, index) => {
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
    setCardPairs(parsedArray);
  }, [bufferCount]);

  // useEffect(() => {
  //   console.log(cardPairs)
  // }, [cardPairs])

  const handleFlip = () => {

  }

  return (
      <div className="flex flex-wrap justify-center w-full">
        {cardPairs.map((pair, index) => (
          <FlashCard pair={pair} index={index} key={index} />
        ))}
      </div>
  );
};

export default Flashcards;
