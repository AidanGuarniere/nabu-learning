// gptUtils.js
import axios from "axios";

export const sendMessageHistoryToGPT = async ({
  model,
  messageHistory,
  functions,
  function_call,
}) => {
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
  try {
    const response = await axios.post(
      "/api/proxy/gpt",
      {
        model,
        messages: messageHistory,
        functions,
        function_call,
      },
      {
        timeout: 30000,
      }
    );
    if (response.status === 200) {
      const newMessage = await processApiResponse(
        response.data.completion.choices[0].message
      );
      console.log(newMessage);
      messageHistory.push(newMessage);
      return messageHistory;
    } else {
      throw new Error("Error while sending message history to GPT");
    }
  } catch (error) {
    console.error("sendMessageHistoryToGPT error:", error.code);
    throw error;
  }
};
