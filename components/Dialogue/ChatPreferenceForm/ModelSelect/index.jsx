import React, { useEffect, useState } from "react";
import axios from "axios";

const ModelSelect = ({ value, onChange, }) => {
  const [hasGPT4, setHasGPT4] = useState(false);
  useEffect(() => {
    // check if user's api key has access to gpt-4 api
    axios
      .get("/api/proxy/models")
      .then((response) => {
        response.data.models.data.forEach((model) => {
          if (model.id === "gpt-4") {
            setHasGPT4(true);
          }
        });
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="flex flex-col justify-center items-center w-full mb-4 ">
      <label
        className="block text-center text-xl mb-2 font-light text-gray-800"
        htmlFor="model-select"
      >
        select model
      </label>
      <select
        id="model-select"
        value={value}
        onChange={(e) => onChange(e.target.value)} // Call onChange with the value only
        className=" shadow-sm appearance-none border rounded w-auto py-2 px-3 text-center bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      >
        <option key={"gpt-3.5-turbo"} value={"gpt-3.5-turbo"}>
          {"gpt-3.5-turbo"}
        </option>
        {hasGPT4 && (
          <>
            <option key={"gpt-4"} value={"gpt-4"}>
              {"gpt-4"}
            </option>
            {/* <option key={"gpt-4-0314"} value={"gpt-4-0314"}>
              {"gpt-4-0314"}
            </option> */}
          </>
        )}
      </select>
    </div>
  );
};

export default ModelSelect;