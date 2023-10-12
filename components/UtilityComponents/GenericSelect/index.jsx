import React from "react";

const GenericSelect = ({ label, value, onChange, options,height }) => {
  return (
    <div className="mb-[-1rem] md:m-0 h-1/3 md:h-auto">
      <label className="text-gray-700 text-xl font-light" htmlFor={label}>
        {label}
      </label>
      <select
        id={label}
        value={value}
        onChange={(e) => onChange(e.target.value)} // Call onChange with the value only
        className="appearance-none border rounded w-full p-3 bg-gray-100 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        style={{ height: `${height}` }}
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

