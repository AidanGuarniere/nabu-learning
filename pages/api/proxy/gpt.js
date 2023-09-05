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

// Function to set up SSE connection and necessary headers for the response
const initSSE = (res) => {
  // Setting up headers required for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Sends the headers immediately to the client to establish an SSE connection
};

const fetchCompletionFromGptApi = async (model, messages, functions, function_call, apiKey, res) => {
  // configure openai api interaction
  const configuration = new Configuration({
    apiKey,
  });
  const openai = new OpenAIApi(configuration);

  try {
    // initiate chatCompletion stream from openai api
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

    // stream of completion data from gpt api
    const stream = completion.data;

    // Listening to 'data' event on stream. This is triggered every time a chunk of data is received.
    stream.on("data", (chunk) => {
      // split chunk based on new line breaks, as these represent separate chunks of data
      const payloads = chunk.toString().split("\n\n");
      // for each payload from the split chunk
      for (const payload of payloads) {
        // If the payload indicates the stream is done, we notify the client and close the stream.
        if (payload.includes("[DONE]")) {
          res.write('event: done\ndata: DONE\n\n');
          res.end();
          return;
        }

        // if payload contains data (if stream is still active)
        if (payload.startsWith("data:")) {
          // remove unneeded text
          const data = JSON.parse(payload.replace("data: ", ""));
          try {
            // deconstruct content from delta field 
            const deltaContent = data.choices[0].delta?.content;
            if (deltaContent !== undefined) {
              // Send the extracted deltaContent to the client immediately as it arrives.
              res.write(`data: ${deltaContent}\n\n`);
            }
          } catch (error) {
            console.log(`Error with JSON.parse and ${payload}.\n${error}`);
          }
        }
      }
    });

  } catch (error) {
    console.error(error);
    throw error;
  }
};


const initGptRequest = async (
  user,
  model,
  messages,
  functions,
  function_call,
  res
) => {
  // deconstruct logged-in user's api key, pass to completions endpoint for gpt interaction
  const decryptedApiKey = await decrypt(user.apiKey);
  return fetchCompletionFromGptApi(
    model,
    messages,
    functions,
    function_call,
    decryptedApiKey,
    res
  );
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // connect to mongoose instance
  await dbConnect();
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // try {
  //   await rateLimiter(userId);
  // } catch (err) {
  //   return res.status(429).json({ error: "Too many requests" });
  // }
  try {
    // find user w valid session
    const user = await User.findById(session.user.id);
    // deconstruct user completion data from body
    const { model, messages, functions, function_call } = req.body;
    // initate response headers for SSE
    initSSE(res);
    // initate request to gpt 
    const completion = await initGptRequest(
      user,
      model,
      messages,
      functions,
      function_call,
      res
    );
    // res.status(200).json({ completion });
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
