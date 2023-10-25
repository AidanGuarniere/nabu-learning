import React from "react";

const FetchButton = () => {
  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents/getDocumentsByUserId");
      const data = await response.json();
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };
  return <button onClick={fetchDocuments}>Fetch Documents</button>;
};

export default FetchButton;
