import React from "react";
import markdownToReact from "../../../../../utils/markdownToReact";
import CopyButton from "./CopyButton";

function AssistantMessage({ message, isNote }) {
  const renderedMarkdown = markdownToReact(message);
  return (
    <div className="w-full min-h-[20px] flex flex-col items-start gap-4">
      <div className="prose flex items-start w-full max-w-none break-words dark:prose-invert light text-gray-800 dark:text-gray-300 md:px-[1.6rem] px-0">
        <span className="w-[96.5%] text-lg">{renderedMarkdown}</span>
        {!isNote && <CopyButton text={message} />}
      </div>
    </div>
  );
}

export default AssistantMessage;
