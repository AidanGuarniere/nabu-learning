import { createParser, ParsedEvent } from "eventsource-parser";

const streamGptContextResponse = async (
  gptRequestPayload,
  setContextStream,
  setLoadingContext,
  goToNextStage
) => {
  const response = await fetch("/api/proxy/gpt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(gptRequestPayload),
  });

  // basic error handling
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  // handle streamed response using eventsource-parser
  const data = response.body;
  // if stream is sending data
  if (data) {
    let functionDeclared = false;
    const onParse = (event) => {
      // watch for data events
      if (event.type === "event") {
        const eventData = event.data;
        try {
          // parse chunk to json {"text": "value"}
          const parsedChunk = JSON.parse(eventData.trim());
          if (parsedChunk.text) {
            setContextStream((prev) => `${prev}${parsedChunk.text}`);
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
      setContextStream("");
      setLoadingContext(false);
      goToNextStage()
      // reset currentlyStreamedChatRef
    }
  }
};

export default streamGptContextResponse;
