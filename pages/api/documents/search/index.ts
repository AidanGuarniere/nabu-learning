import typeSafeAuthOptions from "../../auth/typeOptions";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);



const handler = async (req, res): Promise<any> => {
  try {
    const session: any = await getServerSession(req, res, typeSafeAuthOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId: string = session.user.id;
    const { query, file_names, matches } = req.body as {
      query: string;
      file_names: string[];
      matches: number;
    };

    const input = query.replace(/\n/g, " ");

    const embeddingRes = await fetch("https://api.openai.com/v1/embeddings", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
      },
      method: "POST",
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input
      })
    });

    const json = await embeddingRes.json();
    const embedding = json.data[0].embedding;

    const { data: chunks, error } = await supabaseAdmin.rpc("documents_search", {
      query_embedding: embedding,
      query_user_id: userId,
      query_file_names: file_names,
      similarity_threshold: 0.01,
      match_count: matches
    });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.status(200).json({ data: JSON.stringify(chunks) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });

  }
};

export default handler;