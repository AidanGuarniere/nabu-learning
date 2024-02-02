import React from "react";

function Footer() {
  return (
    <div className="md:pl-[260px] relative bottom-[5rem] md:bottom-8 flex justify-center items-start left-0 w-full md:bg-vert-light-gradient bg-white dark:bg-gray-800 md:!bg-transparent dark:md:bg-vert-dark-gradient">
      <div className="h-20 w-4/5  sm:items-center mx-auto text-center">
        <span className="text-[.625rem] sm:text-[.75rem] text-gray-600 dark:text-gray-300">
          nabu may produce inaccurate information, please consult with an expert
          for important matters
        </span>
      </div>
    </div>
  );
}

export default Footer;
