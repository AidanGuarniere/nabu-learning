import axios from "axios";

export const sendMessageHistoryToGPT = async ({
  model,
  messageHistory,
  functions,
  function_call,
}) => {
  // if gpt completion includes a function_call, change function_call to plaintext and add it to message.content 
  const processApiResponse = (apiResponse) => {
    console.log(apiResponse);
    if ("function_call" in apiResponse) {
      apiResponse.content = `FUNCTION CALLED: ${JSON.stringify(
        apiResponse.function_call
      )} `;
      apiResponse.function_call = null;
    }
    return apiResponse;
  };

  // Function to handle the streaming response using EventSource
  const handleStreamingResponse = (url, onMessageReceived) => {
    // Creating a new EventSource object that listens for messages from the provided URL
    const eventSource = new EventSource(url);

    // Event listener for the 'message' event, which will be triggered whenever a new message is received from the server
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessageReceived(data);
    };

    // Event listener for errors. Could be useful for handling disconnects, network issues, etc.
    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close(); // Close the connection in case of an error
    };

    // Optionally, if you want to handle the custom 'done' event we created to signify the end of the stream:
    eventSource.addEventListener("done", () => {
      console.log("Received DONE event. Closing EventSource.");
      eventSource.close();
    });
  };

  try {
    // Now, instead of making a typical axios post request and waiting for the response, you'd initiate the SSE connection:
    handleStreamingResponse("/api/proxy/gpt", (data) => {
      // This callback is executed every time a new message is received from the server
      const newMessage = processApiResponse(data.message);
      console.log(newMessage);
      messageHistory.push(newMessage);
      console.log(messageHistory)
    });

    // If you still need to send the POST data (e.g., for initialization), you can do that separately:
    await axios.post(
      "/api/proxy/gpt",
      {
        model,
        messages: messageHistory,
        functions,
        function_call,
      },
      {
        timeout: 10000,
      }
    );
  } catch (error) {
    console.error("sendMessageHistoryToGPT error:", error.code);
    throw error;
  }
};
