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
    setCharacterCount(value.length);
  }, []);

  return (
    <div className="md:mb-0 xl:mb-6">
      <label className="text-gray-700 text-xl font-light" htmlFor={label}>
        {label}
      </label>
      <textarea
        id={label}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        rows="2"
        maxLength={maxLength}
        className={` bg-gray-100 resize-none w-full h-${height}  appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
      />
      <div className="text-right text-gray-600 text-sm">
        {characterCount}/{maxLength} 
      </div>
    </div>
  );
};

export default GenericInput;
