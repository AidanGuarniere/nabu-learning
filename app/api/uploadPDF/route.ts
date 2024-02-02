import { NextRequest, NextResponse } from "next/server";
import { NextAuthOptions } from "next-auth";
import { PdfReader } from "pdfreader";
import { encode } from "gpt-tokenizer";
import { Document, DocumentChunk } from "../../../types";
import typeSafeAuthOptions from "../../../pages/api/auth/typeOptions";
import { getServerSession } from "next-auth/next";
import { generateEmbeddings } from "../../../scripts/embed";

// for pdf upload
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

type UserSession =
  | {
      id: string;
      username: string;
    }
  | undefined;

export async function POST(request: NextRequest, response: NextResponse) {
  const session: any = await getServerSession(typeSafeAuthOptions);
  if (!session) {
    return NextResponse.json({ success: false });
  }
  const userId: string = session.user.id;
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

    // set token limit for ada 002 text embeddings
    let tokenLimit: number = 512;

    // create overlapping chunks of text where each chunk's token count <= tokenLimit
    // called after PDF text is scraped
    function createOverlappingChunks(
      pageChunks: string[],
      tokenLimit: number
    ): DocumentChunk[] {
      const chunks: DocumentChunk[] = [];
      pageChunks.forEach((page, i) => {
        let startIdx = 0;
        let endIdx = 0;
        let tokenCount = 0;
        while (startIdx < page.length) {
          // Reset token count for new chunk
          tokenCount = 0;

          // Find endIdx for the current chunk based on token count
          while (endIdx < page.length && tokenCount <= tokenLimit) {
            endIdx++;
            const chunk = page.slice(startIdx, endIdx);
            tokenCount = encode(chunk).length;
          }

          // Adjust endIdx to ensure token count is within limit
          if (tokenCount > tokenLimit) {
            endIdx--;
          }

          // Add chunk to chunks array
          const chunkContent = page.slice(startIdx, endIdx);
          if (chunkContent) {
            const chunk: DocumentChunk = {
              page: i + 1, // Placeholder, will need logic to determine page number
              document_date: formattedPdfDate,
              fileName: title,
              content: chunkContent,
              content_length: chunkContent.length,
              content_tokens: encode(chunkContent).length,
              embedding: [], // Placeholder, will need logic to populate embedding
            };
            chunks.push(chunk);
          }

          // Overlap: Start the next chunk halfway through the current one
          const increment = Math.max(1, Math.floor((endIdx - startIdx) / 2));
          if (endIdx >= page.length) {
            startIdx = page.length;
          } else {
            startIdx = startIdx + increment;
          }
        }
      });

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
          if (err) {
            reject(err);
          }
          // all items have been checked || pdf was blank
          else if (!item) {
            if (documentData.content.length) {
              // update documentData after all text has been scraped
              documentData.length = documentData.content.length;
              documentData.tokens = encode(documentData.content).length;
            }
            // resolve promise by returning document object
            resolve(documentData);
          } else if (item.text) {
            documentData.content = `${documentData.content} ${item.text}`;
            documentData.chunks[documentData.chunks.length - 1] = `${
              documentData.chunks[documentData.chunks.length - 1]
            } ${item.text}`;
          } else if (item.page) {
            documentData.chunks[item.page - 1] = "";
          }
        });
      });
    };

    // turn buffer blob into pdf text via pdfreader, parse necessary data within parseBuffer
    const scrapedData = await parsePdf(buffer);
    // after PDF text is parsed, map over it to create overlapping chunks of text for embeddings according to DocumentChunk type interface
    const chunkedData = createOverlappingChunks(scrapedData.chunks, tokenLimit);
    return chunkedData;
  }

  // parse and chunk each PDF file uploaded
  try {
    const results = await Promise.all(files.map((file) => processFile(file)));
    const flattenedResults = results.flat();
    const embeddings = await generateEmbeddings(userId, flattenedResults);
    return NextResponse.json({ success: true, documentChunks: results });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false });
  }
}
