import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

// define agent type interface for gpt interactiosn
export type ChatGPTAgent = "user" | "system";

// define chatgpt message interface for gpt interactions
export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: any;
  functions: any[];
  function_call: any;
}

// define openai v1/chat/completions payload interface for gpt interactions
export interface OpenAIStreamPayload {
  model: string;
  messages: ChatGPTMessage[];
  // temperature: number;
  // top_p: number;
  // frequency_penalty: number;
  // presence_penalty: number;
  // max_tokens: number;
  functions: any[];
  function_call: any;
  stream: boolean;
  // n: number;
}

export async function OpenAIStream(payload: OpenAIStreamPayload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // send content to openai api
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    // utilize api key from environment variables
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  // open new readable stream for gpt response
  const readableStream = new ReadableStream({
    async start(controller) {
      // callback
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;
          controller.enqueue(encoder.encode(data));
        }
      };

      // optimistic error handling
      if (res.status !== 200) {
        const data = {
          status: res.status,
          statusText: res.statusText,
          body: await res.text(),
        };
        console.log(
          `Error: recieved non-200 status code, ${JSON.stringify(data)}`
        );
        controller.close();
        return;
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse);
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  let counter = 0;
  const transformStream = new TransformStream({
    async transform(chunk, controller) {
      const data = decoder.decode(chunk);
      // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
      if (data === "[DONE]") {
        controller.terminate();
        return;
      }
      try {
        const json = JSON.parse(data);
        const extractTextFromDelta = (json) => {
          const delta = json.choices[0].delta;
          if (delta?.content) return delta.content;
          if (delta?.function_call?.arguments)
            return delta.function_call.arguments;
          return "";
        };
        const text = extractTextFromDelta(json);

        if (counter < 2 && (text.match(/\n/) || []).length) {
          // this is a prefix character (i.e., "\n\n"), do nothing
          return;
        }
        // stream transformed JSON resposne as SSE
        const payload = { text: text };
        // https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
        );
        counter++;
      } catch (e) {
        // maybe parse error
        controller.error(e);
      }
    },
  });

  return readableStream.pipeThrough(transformStream);
}
