import { UploadPDF } from "../components/Dashboard/UserActions/UploadPDFForm";
export  default function UploadPage() {
    const handleUpload = async (event) => {
      event.preventDefault();
  
      const formData = new FormData();
      formData.append("pdf", event.target.pdf.files[0]);
  
      const response = await fetch("/api/documents/uploadPDF", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      console.log(data.text); // Here, you have the extracted text from the PDF.
    };
  
    return (
      <div>
        <UploadPDF/>
      </div>
    );
  }
  