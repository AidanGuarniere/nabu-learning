// // import { decrypt } from "../../../utils/crypto";
// import { Configuration, OpenAIApi } from "openai";
// // import { Readable } from "stream";
// // import rateLimiter from "../../../utils/rateLimiter";

// // check for api key
// if (!process.env.OPENAI_API_KEY) {
//   throw new Error("Missing env var from OpenAI");
// }

// export const config = {
//   runtime: "edge",
// };

// const fetchDataFromAPI = async (
//   model,
//   messages,
//   functions,
//   function_call,
//   apiKey,
//   res
// ) => {
//   // configure openai api interaction
//   const configuration = new Configuration({
//     apiKey,
//   });
//   const openai = new OpenAIApi(configuration);

//   try {
//     // array for openai stream response
//     const streamCompletion = [];
//     // create chat completion w user request
//     const completion = await openai.createChatCompletion(
//       {
//         model: model,
//         messages: messages,
//         functions: functions,
//         function_call: function_call,
//         stream: true,
//       },
//       { responseType: "stream" }
//     );

//     // stream = openai api response
//     const stream = completion.data;

//     // when stream receives a new chunk of data
//     stream.on("data", (chunk) => {
//       // deconstruct payloads based on newline characters
//       const payloads = chunk.toString().split("\n\n");
//       // for each payload
//       for (const payload of payloads) {
//         // openai stream complete, end response stream
//         if (payload.includes("[DONE]")) {
//           // Handle completion: perhaps send streamCompletion to client or log it
//           // console.log(streamCompletion.join(""));
//           // Reset for next usage
//           console.log("[DONE]");
//           res.end();
//           streamCompletion.length = 0;
//           return;
//         }

//         // if payload contains data
//         if (payload.startsWith("data:")) {
//           // remove unneccesary characters
//           const data = JSON.parse(payload.replace("data: ", ""));
//           try {
//             // deconstruct openai stream content from delta
//             const deltaContent = data.choices[0].delta?.content;
//             if (deltaContent !== undefined) {
//               // stream completion arr unused for now, may utilize for buffer or transform purposes later
//               streamCompletion.push(deltaContent);
//               // write content to directly to stream
//               console.log("delta", deltaContent);
//               res.write(deltaContent);
//               // console.log(res)
//             }
//           } catch (error) {
//             console.log(`Error with JSON.parse and ${payload}.\n${error}`);
//           }
//         }
//       }
//     });
//     // console.log(streamCompletion)
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };

// const handleRequest = async (
//   model,
//   messages,
//   functions,
//   function_call,
//   res
// ) => {
//   // get user api key from environment vars
//   const apiKey = process.env.OPENAI_API_KEY;
//   console.log("apiKey", apiKey);
//   // set streaming response headers
//   res.setHeader("Content-Type", "text/plain");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Transfer-Encoding", "chunked");

//   // pass request data and response object
//   return fetchDataFromAPI(
//     model,
//     messages,
//     functions,
//     function_call,
//     apiKey,
//     res
//   );
// };

// export default async function handler(req, res) {
//   // check http method
//   if (req.method !== "POST") {
//     res.setHeader("Allow", ["POST"]);
//     return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }

//   // validate user session, reject if unauthorized
//   // const session = await getServerSession(req, res, authOptions);
//   // if (!session) {
//   //   return res.status(401).json({ error: "Unauthorized" });
//   // }
//   // redis rate limiting for prod
//   // try {
//   //   await rateLimiter(userId);
//   // } catch (err) {
//   //   return res.status(429).json({ error: "Too many requests" });
//   // }
//   try {
//     // find current user based on session
//     // const user = await User.findById(session.user.id);
//     // deconstruct gpt api payload from request
//     const payload = await req.json();
//     const { model, messages, functions, function_call } = payload;

//     // pass payload and response object to handleRequest
//     await handleRequest(model, messages, functions, function_call, res);
//     // return res;
//     // error handling
//   } catch (error) {
//     const statusCode = error.status || 500;

//     console.error("Error Details:", {
//       status: statusCode,
//       message: error.message,
//       stack: error.stack,
//       requestBody: req.body,
//     });
//   }
// }


import { OpenAIStream, OpenAIStreamPayload } from "../../../utils/openAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  const { model, messages, functions, function_call } = await req.json()

  if (!messages) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    model,
    messages,
    functions,
    function_call,
    stream: true,
  };

  const stream = await OpenAIStream(payload);
  // return stream response (SSE)
  return new Response(
    stream, {
      headers: new Headers({
        // since we don't use browser's EventSource interface, specifying content-type is optional.
        // the eventsource-parser library can handle the stream response as SSE, as long as the data format complies with SSE:
        // https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#sending_events_from_the_server
        
        // 'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      })
    }
  );
};

export default handler;