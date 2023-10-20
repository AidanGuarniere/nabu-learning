import { NextRequest, NextResponse } from "next/server";
import { PdfReader } from "pdfreader";
import { encode } from "gpt-tokenizer";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  let tokenLimit: number = 256;

  // errors be present
  function createOverlappingChunks(text: string, tokenLimit: number): string[] {
    const chunks: string[] = [];
    let startIdx = 0;
    let endIdx = 0;
    let tokenCount = 0;

    while (startIdx < text.length) {
      // Reset token count for new chunk
      tokenCount = 0;

      // Find endIdx for the current chunk based on token count
      while (endIdx < text.length && tokenCount <= tokenLimit) {
        endIdx++;
        const chunk = text.slice(startIdx, endIdx);
        tokenCount = encode(chunk).length;
      }

      // Adjust endIdx to ensure token count is within limit
      if (tokenCount > tokenLimit) {
        endIdx--;
      }

      // Add chunk to chunks array
      const chunk = text.slice(startIdx, endIdx);
      if (chunk) {
        chunks.push(chunk);
      }

      // Overlap: Start the next chunk halfway through the current one
      const increment = Math.max(1, Math.floor((endIdx - startIdx) / 2));
      if (endIdx >= text.length) {
        startIdx = text.length;
      } else {
        startIdx = startIdx + increment;
      }
    }

    return chunks;
  }

  const parsePdf = (buffer: Buffer) => {
    return new Promise<string>((resolve, reject) => {
      let scrapedData = "";
      new PdfReader(null).parseBuffer(buffer, (err, item) => {
        if (err) reject(err);
        else if (!item) {
          resolve(scrapedData);
        } else if (item.text) scrapedData = `${scrapedData} ${item.text}`;
      });
    });
  };
  // Usage
  try {
    // Await the completion of the PDF parsing
    const scrapedData = await parsePdf(buffer);
    // Now call createOverlappingChunks with the fully populated scrapedData
    const parsedChunks = createOverlappingChunks(scrapedData, tokenLimit);
    console.log("pc", parsedChunks);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false });
  }
}

// scrapedSentences.forEach((sentence) => {
//   const sentenceTokens = encode(sentence);
//   const sentenceTokenCount = sentenceTokens.length;
//   // if the sentence fits within the current index of textToBeEmbedded
//   if (sentenceTokenCount < tokenLimit) {
//     // if first index, just push sentence
//     if (textToBeEmbedded.length === 0) {
//       textToBeEmbedded.push(sentence);
//     } else {
//       // if adding to an existing array, concatinate current index w new sentence
//       textToBeEmbedded[textToBeEmbedded.length - 1] = `${
//         textToBeEmbedded[textToBeEmbedded.length - 1]
//       } ${sentence}`;
//     }
//     // update tokenLimit to account for newly added content
//     tokenLimit = tokenLimit - sentenceTokenCount;
//   } else {
//     if (sentenceTokenCount > tokenLimit && sentenceTokenCount < 256) {
//       textToBeEmbedded.push(sentence);
//       tokenLimit = 256 - sentenceTokenCount;
//     } else {
//       console.log("yuuuuge");
//     }
//   }
// });
