import React from "react";

const GenericSelect = ({ label, value, onChange, options }) => {
  return (
    <div className="mb-4">
      <label
        className="block text-gray-700 text-xl font-bold mb-2"
        htmlFor={label}
      >
        {label}
      </label>
      <select
        id={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className=" appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GenericSelect;
