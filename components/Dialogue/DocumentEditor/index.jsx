import React, { useState, useRef } from "react";

export default function Editor() {
  const [content, setContent] = useState("");
  const editorRef = useRef(null);

  const handleChange = (e) => {
    setContent(e.target.innerHTML);
  };

const applyStyle = (styleType, value) => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    if (!range.collapsed) {
      const span = document.createElement("span");
      
      // Apply the style to the span
      switch (styleType) {
        case 'bold':
          span.style.fontWeight = 'bold';
          break;
        case 'italic':
          span.style.fontStyle = 'italic';
          break;
        case 'underline':
          span.style.textDecoration = 'underline';
          break;
        case 'hiliteColor':
          span.style.backgroundColor = value;
          break;
        case 'fontSize':
          span.style.fontSize = `${value}px`;
          break;
        default:
          break;
      }

      span.appendChild(range.extractContents());
      range.insertNode(span);
      
      // Reset range position to right after the inserted node for natural typing
      range.setStartAfter(span);
      range.setEndAfter(span);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  editorRef.current.focus();
};


  return (
    <div className="pl-[260px]">
      <section className="flex space-x-4 mb-4">
        <button className="bg-green-200"onClick={() => applyStyle("bold")}>Bold</button>
        <button className="bg-green-200"onClick={() => applyStyle("italic")}>Italic</button>
        <button className="bg-green-200"onClick={() => applyStyle("underline")}>Underline</button>
        <button className="bg-green-200"onClick={() => applyStyle("hiliteColor", "yellow")}>
          Highlight
        </button>
        <button className="bg-green-200"onClick={() => applyStyle("fontSize", "7")}>Large Text</button>
        <button className="bg-green-200"onClick={() => applyStyle("fontSize", "3")}>Small Text</button>
      </section>
      <article
        ref={editorRef}
        className="prose bg-white p-6 w-full h-screen overflow-y-auto"
        contentEditable={true}
        onInput={handleChange}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{ whiteSpace: "pre-wrap" }} // This allows custom whitespaces
      ></article>
    </div>
  );
}
