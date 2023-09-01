import React from "react";

const Flashcards = ({ flashcardData }) => {
  const parsedData = JSON.parse(flashcardData.arguments);

  return (
    <div className="flex flex-wrap justify-center w-full">
      {parsedData.cardPairs.map((pair, index) => (
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
