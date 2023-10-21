import { Document, DocumentChunk, DocumentJSON } from "../../../types";
import { NextRequest, NextResponse } from "next/server";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { Configuration, OpenAIApi } from "openai";

loadEnvConfig("");

export async function POST(request: NextRequest) {
  console.log(request.body);
  const documentChunks: DocumentChunk[] = request.body;
  if (!Array.isArray(documentChunks)) {
    return NextResponse.json({ success: false, message: "Invalid input" });
  }

  const generateEmbeddings = async (
    session: any,
    documentChunks: DocumentChunk[]
  ) => {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    for (let i = 0; i < documentChunks.length; i++) {
      const chunk: DocumentChunk = documentChunks[i];
      const {
        page,
        document_date,
        content,
        content_length,
        content_tokens,
        fileName,
      } = chunk;

      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: content,
      });

      const [{ embedding }] = embeddingResponse.data.data;
      chunk.embedding = embedding;

      const { data, error } = await supabase
        .from("documents")
        .insert({
          user_id: session.user._id,
          fileName,
          page,
          document_date,
          content,
          content_length,
          content_tokens,
          embedding,
        })
        .select("*");

      if (error) {
        console.log("error", error);
      } else {
        console.log("saved", i);
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  };
  try {
    const results = await generateEmbeddings("user", documentChunks);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false });
  }
}

// (async () => {
//   const book: DocumentJSON = JSON.parse(fs.readFileSync("scripts/documents.json", "utf8"));
//   await generateEmbeddings(session, book.documents);  // Changed from book.essays to book.documents
// })();
