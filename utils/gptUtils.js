// gptUtils.js
export const sendMessageHistoryToGPT = async function* ({
  model,
  messageHistory,
  functions,
  function_call,
}) {
  const processApiResponse = (apiResponse) => {
    if ("function_call" in apiResponse) {
      apiResponse.content = `FUNCTION CALLED: ${JSON.stringify(
        apiResponse.function_call
      )} `;
      apiResponse.function_call = null;
    }
    return apiResponse;
  };

  try {
    // const userData = await fetch("api/users/me", {
    //   method: "GET",
    //   headers: { "Content-Type": "application/json" },
    // });
    // const user = await userData.json();
    // if (user) {
    //   console.log(user);
    const payload = {
      model,
      messages: messageHistory,
      functions,
      function_call,
    };
    // POST user chat request to proxy/gpt for secure openai api interaction
    const response = await fetch("/api/proxy/gpt", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 200) {
      console.log(response.status);
      const reader = response.body.getReader();

      // Async generator loop to process streamed response
      while (true) {
        const { done, value } = await reader.read();

        // Decode the received value (chunk) from the stream
        const textChunk = new TextDecoder("utf-8").decode(value);
        // console.log(textChunk);

        if (done) break; // Exit loop once stream is completed

        // Process the chunk
        // const processedChunk = processApiResponse(textChunk);
        // messageHistory.push(processedChunk);

        // Yield the processed chunk so it can be consumed immediately
        yield textChunk;
      }
    } else {
      throw new Error("Error while sending message history to GPT");
    }
    // } else {
    //   throw new Error("User session invalid or not found");
    // }
  } catch (error) {
    console.error("sendMessageHistoryToGPT error:", error.code);
    throw error;
  }
};
