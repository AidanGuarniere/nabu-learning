// import { writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from "next/server";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

export const config = {
  api: {
    bodyParser: false,
  },
};

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uint8Array = new Uint8Array(buffer);

  const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

  let scrapedData = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    console.log("items:", textContent.items);
    scrapedData += textContent.items
      .map((item) => {
        if (typeof item["str"] === "string") {
          return item["str"];
        }
      })
      .join(" ");
  }

  console.log("Scraped Data:", scrapedData);

  return NextResponse.json({ success: true });
}
