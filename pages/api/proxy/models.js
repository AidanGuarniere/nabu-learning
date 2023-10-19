// pages/api/upload.js
import multer from 'multer';
import { getDocument } from 'pdfjs-dist/es5/build/pdf';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('pdf');

const extractTextFromPDF = async (pdfBuffer) => {
  const pdf = await getDocument({ data: pdfBuffer }).promise;
  let extractedText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    extractedText += textContent.items.map(item => item.str).join(' ');
  }

  return extractedText;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: `Upload Error: ${err.message}` });
    }

    try {
      const extractedText = await extractTextFromPDF(req.file.buffer);
      res.status(200).json({ text: extractedText });
    } catch (error) {
      res.status(500).json({ error: `Failed to process PDF: ${error.message}` });
    }
  });
}
