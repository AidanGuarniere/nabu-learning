import React from "react";

const Flashcards = ({ flashcardData }) => {
  const parsedData = JSON.parse(flashcardData.arguments);

  return (
    <div className="flex flex-wrap justify-center w-full">
      {parsedData.cardPairs.map((pair, index) => (
        <div className="flex flex-col md:flex-row p-2 md:p-4" key={index}>
          <div className="relative w-full h-60 m-1 p-4 text-white bg-black rounded-lg">
            <h3 className="absolute top-0 left-0 ml-2 mt-2 ">Front</h3>
            <div className="flex items-center justify-center h-full pt-6 text-center text-lg">
              {pair.question}
            </div>
          </div>
          <div className="relative w-full h-60 m-1 p-4 text-black bg-white border border-black rounded-lg">
            <h3 className="absolute top-0 left-0 ml-2 mt-2">Back</h3>

            <div className="flex items-center justify-center h-full pt-6">
              <ul className="list-disc pl-8">
                {pair.answer.map((ans, i) => (
                  <li key={i}>{ans}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Flashcards;
