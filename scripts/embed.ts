import {  Document, DocumentChunk, DocumentJSON } from "../types";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { Configuration, OpenAIApi } from "openai";

loadEnvConfig("");

export const generateEmbeddings = async (session: any, documents: Document[]) => {
  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  for (let i = 0; i < documents.length; i++) {
    const section: Document = documents[i];
    for (let j = 0; j < section.chunks.length; j++) {
      const chunk: DocumentChunk = section.chunks[j];
      const { page, document_date, content, content_length, content_tokens } = chunk;

      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: content
      });

      const [{ embedding }] = embeddingResponse.data.data;

      const { data, error } = await supabase
        .from("documents")
        .insert({
          user_id: session.user._id,
          fileName: section.fileName,
          author: section.author,
          date: section.date,
          page,
          document_date,
          content,
          content_length,
          content_tokens,
          embedding
        })
        .select("*");

      if (error) {
        console.log("error", error);
      } else {
        console.log("saved", i, j);
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}



// (async () => {
//   const book: DocumentJSON = JSON.parse(fs.readFileSync("scripts/documents.json", "utf8"));
//   await generateEmbeddings(session, book.documents);  // Changed from book.essays to book.documents
// })();