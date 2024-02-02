import React, { useState, useEffect } from "react";

const GenericInput = ({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  height,
}) => {
  const [characterCount, setCharacterCount] = useState(0);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    // Enforce a maximum of 200 characters
    if (inputValue.length <= maxLength) {
      onChange(inputValue); // Call onChange with the inputValue only
      setCharacterCount(inputValue.length);
    }
  };
  useEffect(() => {
    if (value && characterCount !== value.length) {
      setCharacterCount(value.length);
    }
  }, [value, characterCount]);

  return (
    <div className="mb-[-1rem] md:m-0 p-0">
      <label
        className="text-gray-700 text-lg md:text-xl font-light"
        htmlFor={label}
      >
        {label}
      </label>
      <textarea
        id={label}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        rows={window.innerWidth >= 768 ? "2" : "1"}
        maxLength={maxLength}
        className={` bg-gray-100 resize-none w-full appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
        style={{ height: `${height}` }}
      />
      <div className="text-right text-gray-600 text-xs md:text-sm m-0 p-0">
        {characterCount}/{maxLength}
      </div>
    </div>
  );
};

export default GenericInput;
