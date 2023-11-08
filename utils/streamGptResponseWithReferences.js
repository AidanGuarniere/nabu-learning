import { updateChat } from "./chatUtils";
import { createParser, ParsedEvent } from "eventsource-parser";

const streamGptResponseWithReferences = async (
  file_names,
  gptRequestPayload,
  chats,
  selectedChat,
  currentlyStreamedChatRef,
  setStream
) => {
  const getReferences = async (query, file_names) => {
    try {
      const searchResponse = await fetch("/api/documents/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, file_names, matches: 3 }),
      });

      if (searchResponse.ok) {
        const searchResults = await searchResponse.json();
        return searchResults.data;
      }
    } catch (error) {
      console.error("Error deleting chat(s):", error);
      throw error;
    }
  };
  const query =
    gptRequestPayload.messages[gptRequestPayload.messages.length - 1].content;

  const referencesData = JSON.parse(await getReferences(query, file_names));
  console.log(referencesData);
  const references = referencesData
    .map(
      (reference) =>
        `file name: ${reference.filename}, page number: ${reference.page}, content: ${reference.content}`
    )
    .join("\n");
  // add references to user query
  const gptRequestPayloadWithReferences = { ...gptRequestPayload };
  gptRequestPayloadWithReferences.messages[
    gptRequestPayloadWithReferences.messages.length - 1
  ].content = `user query: "${query}" relevant references: [${references}]`;

  const response = await fetch("/api/proxy/gpt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(gptRequestPayloadWithReferences),
  });

  // basic error handling
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  // handle streamed response using eventsource-parser
  const data = response.body;
  // if stream is sending data
  if (data) {
    const onParse = (event) => {
      // watch for data events
      if (event.type === "event") {
        const eventData = event.data;
        try {
          const parsedChunk = JSON.parse(eventData.trim());
          if (parsedChunk.text) {
            setStream((prev) => `${prev}${parsedChunk.text}`);
          }
        } catch (e) {
          console.error("Error parsing JSON: ", e);
        }
      }
    };

    // eventsource-parser functions to read and decode chunks
    const reader = data.getReader();
    const decoder = new TextDecoder();

    const parser = createParser(onParse);
    let done = false;
    // track last chunk processed for coherent updates to chats state
    let lastChunkProcessed = "";
    while (!done) {
      // check for chunk value and done status
      const { value, done: doneReading } = await reader.read();
      // update done status from current chunk
      done = doneReading;
      // decode chunk value to string
      let chunkValue = decoder.decode(value);
      if (lastChunkProcessed) {
        // Check for overlap:
        let overlapIndex = chunkValue.indexOf(lastChunkProcessed);

        // If overlap found, adjust the chunk value:
        if (overlapIndex === 0) {
          chunkValue = chunkValue.substring(lastChunkProcessed.length);
        }
      }

      // At the end, set lastChunkProcessed:
      lastChunkProcessed = chunkValue;
      parser.feed(chunkValue);
    }
    if (done) {
      // reset stream
      setStream("");
      // reset currentlyStreamedChatRef
      currentlyStreamedChatRef.current = {};
      // update chat document w new messages
      const chatIndex = chats.findIndex((chat) => chat._id === selectedChat);
      const chatId = chats[chatIndex]._id;
      const chatMessages = chats[chatIndex].messages;
      updateChat(chatId, { messages: chatMessages });
    }
  }
};

export default streamGptResponseWithReferences;
