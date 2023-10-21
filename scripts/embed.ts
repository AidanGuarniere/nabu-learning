import {  DocumentChunk } from "../types";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { Configuration, OpenAIApi } from "openai";
import { useImperativeHandle } from "react";

loadEnvConfig("");

export const generateEmbeddings = async (
  userId: string,
  documentChunks: DocumentChunk[]
) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  for (let i = 0; i < documentChunks.length; i++) {
    const chunk: DocumentChunk = documentChunks[i];
    const {
      page,
      fileName,
      document_date,
      content,
      content_length,
      content_tokens,
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
        user_id: userId,
        file_name: fileName,
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