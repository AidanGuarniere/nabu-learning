export const getDocumentsByUserId = async () => {
  try {
    const response = await fetch("/api/documents/getDocumentsByUserId");
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
  }
};

