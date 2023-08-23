import React from "react";

const GenericSelect = ({ label, value, onChange, options }) => {
  return (
    <div className="mb-4 h-1/3">
      <label className="text-gray-700 text-xl  " htmlFor={label}>
        {label}
      </label>
      <select
        id={label}
        value={value}
        onChange={(e) => onChange(e.target.value)} // Call onChange with the value only
        className="appearance-none border rounded w-full p-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      >
        <option value="" disabled hidden>
          Select an option
        </option>
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

