import { createClient } from "@supabase/supabase-js";
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { query, apiKey, user_id, file_names, matches } = (await req.json()) as {
      query: string;
      apiKey: string;
      user_id: string;
      file_names: string[];
      matches: number;
    };

    const input = query.replace(/\n/g, " ");

    const res = await fetch("https://api.openai.com/v1/embeddings", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      method: "POST",
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input
      })
    });

    const json = await res.json();
    const embedding = json.data[0].embedding;

    const { data: chunks, error } = await supabaseAdmin.rpc("documents_search", {
      query_embedding: embedding,
      query_user_id: user_id,
      query_file_names: file_names,
      similarity_threshold: 0.01,
      match_count: matches
    });

    if (error) {
      console.error(error);
      return new Response("Error", { status: 500 });
    }

    return new Response(JSON.stringify(chunks), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;