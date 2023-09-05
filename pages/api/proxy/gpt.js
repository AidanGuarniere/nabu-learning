import dbConnect from "../../../utils/dbConnect";
import User from "../../../models/UserSchema";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import { decrypt } from "../../../utils/crypto";
import { Configuration, OpenAIApi } from "openai";
import { Readable } from "stream";
import rateLimiter from "../../../utils/rateLimiter";

// export const config = {
//   runtime: "edge",
// };

// U JUST UPDATED YOUR FETCH TO USE STREAMING FUNCTIONALITY DESCRIBED IN SO
const fetchDataFromAPI = async (
  model,
  messages,
  functions,
  function_call,
  apiKey
) => {
  const configuration = new Configuration({
    apiKey,
  });
  const openai = new OpenAIApi(configuration);

  try {
    const streamCompletion = [];
    const completion = await openai.createChatCompletion(
      {
        model: model,
        messages: messages,
        functions: functions,
        function_call: function_call,
        stream: true,
      },
      { responseType: "stream" }
    );
    // console.log(completion.data, Date.now());

    const stream = completion.data;

    stream.on("data", (chunk) => {
      const payloads = chunk.toString().split("\n\n");
      for (const payload of payloads) {
        if (payload.includes("[DONE]")) {
          // Handle completion: perhaps send streamCompletion to client or log it
          // console.log(streamCompletion.join(""));
          // Reset for next usage
          streamCompletion.length = 0;
          return;
        }

        if (payload.startsWith("data:")) {
          const data = JSON.parse(payload.replace("data: ", ""));
          try {
            const deltaContent = data.choices[0].delta?.content;
            if (deltaContent !== undefined) {
              streamCompletion.push(deltaContent);
              console.log(streamCompletion)
            }
          } catch (error) {
            console.log(`Error with JSON.parse and ${payload}.\n${error}`);
          }
        }
      }
    });
    // console.log(streamCompletion)

  } catch (error) {
    console.error(error);
    throw error;
  }
};

const handleRequest = async (
  user,
  model,
  messages,
  functions,
  function_call
) => {
  const decryptedApiKey = await decrypt(user.apiKey);
  return fetchDataFromAPI(
    model,
    messages,
    functions,
    function_call,
    decryptedApiKey
  );
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await dbConnect();
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = session.user.id;
  // try {
  //   await rateLimiter(userId);
  // } catch (err) {
  //   return res.status(429).json({ error: "Too many requests" });
  // }
  try {
    const user = await User.findById(session.user.id);
    const { model, messages, functions, function_call } = req.body;
    const completion = await handleRequest(
      user,
      model,
      messages,
      functions,
      function_call
    );
    res.status(200).json({ completion });
  } catch (error) {
    const statusCode = error.status || 500;

    console.error("Error Details:", {
      status: statusCode,
      message: error.message,
      stack: error.stack,
      requestBody: req.body,
      userId: session?.user?.id,
    });

    res.status(statusCode).json({ error: error.message });
  }
}
