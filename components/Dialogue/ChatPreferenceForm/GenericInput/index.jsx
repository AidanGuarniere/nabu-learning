import React from "react";

const GenericInput = ({ label, value, onChange, placeholder }) => {
  return (
    <div className="mb-4">
      <label
        className="block text-gray-700 text-xl font-bold mb-2"
        htmlFor={label}
      >
        {label}
      </label>
      <input
        type="text"
        id={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className=" appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
  );
};

export default GenericInput;
