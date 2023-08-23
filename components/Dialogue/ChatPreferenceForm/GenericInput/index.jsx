import React, { useState } from "react";

const GenericInput = ({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  keyToUpdate,
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

  return (
    <div className="mb-4 h-1/3">
      <label className="text-gray-700 text-xl " htmlFor={label}>
        {label}
      </label>
      <textarea
        id={label}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        rows="2"
        maxLength={maxLength}
        className="resize-none h-4/5 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
      <div className="text-right text-gray-600 text-sm">
        {characterCount}/{maxLength}
      </div>
    </div>
  );
};

export default GenericInput;
