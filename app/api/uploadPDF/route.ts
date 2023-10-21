import { NextRequest, NextResponse } from "next/server";
import { PdfReader } from "pdfreader";
import { encode } from "gpt-tokenizer";
import { Document, DocumentChunk } from "../../../types";

// for pdf upload
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  // get file(s) data from client
  const data = await request.formData();
  const files: File[] = data.getAll("files") as unknown as File[];

  // if no files, abort
  if (!files.length) {
    return NextResponse.json({ success: false });
  }

  // process PDF file
  async function processFile(file: File) {
    // get mm/dd/yyyy of last PDF edit
    const pdfDate = new Date(file.lastModified * 1000);
    const formatDate = (date) => {
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based in JS
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();

      return `${month}/${day}/${year}`;
    };
    const formattedPdfDate = formatDate(pdfDate);

    // get pdf file name
    const title = file.name;

    // convert pdf binary to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // set token limit for ada 002 embeddings
    let tokenLimit: number = 512;

    // create overlapping chunks of text where each chunk's token count <= tokenLimit
    // called after PDF text is scraped
    function createOverlappingChunks(
      text: string,
      tokenLimit: number
    ): DocumentChunk[] {
      const chunks: DocumentChunk[] = [];
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
        const chunkContent = text.slice(startIdx, endIdx);
        if (chunkContent) {
          const chunk: DocumentChunk = {
            page: 0, // Placeholder, will need logic to determine page number
            document_date: "", // Placeholder, will need logic to determine document date
            content: chunkContent,
            content_length: chunkContent.length,
            content_tokens: encode(chunkContent).length,
            embedding: [], // Placeholder, will need logic to populate embedding
          };
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

    // parse pdf according to Document type interface
    const parsePdf = (buffer: Buffer) => {
      return new Promise<any>((resolve, reject) => {
        let documentData: Document = {
          author: "",
          content: "",
          length: 0,
          tokens: 0,
          fileName: title,
          date: formattedPdfDate,
          chunks: [],
        };
        new PdfReader(null).parseBuffer(buffer, (err, item) => {
          if (err) reject(err);
          // all items have been checked || pdf was blank
          else if (!item) {
            if (documentData.content.length) {
              // update documentData after all text has been scraped
              documentData.length = documentData.content.length;
              documentData.tokens = encode(documentData.content).length;
            }
            // resolve promise by returning document object
            resolve(documentData);
          } else if (item.text)
            documentData.content = `${documentData.content} ${item.text}`;
        });
      });
    };

    // turn buffer blob into pdf text via pdfreader, parse necessary data within parseBuffer
    const scrapedData = await parsePdf(buffer);

    // after PDF text is parsed, map over it to create overlapping chunks of text for embeddings according to DocumentChunk type interface
    scrapedData.chunks = createOverlappingChunks(
      scrapedData.content,
      tokenLimit
    );
    console.log("scrapedData", scrapedData);
    return scrapedData;
  }

  // parse and chunk each PDF file uploaded
  try {
    const results = await Promise.all(files.map((file) => processFile(file)));
    return NextResponse.json({ success: true, documents: results });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false });
  }
}
