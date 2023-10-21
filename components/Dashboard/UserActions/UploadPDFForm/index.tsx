import { useState } from "react";

export function UploadPDF() {
  const [files, setFiles] = useState<FileList | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files) return;

    try {
      const data = new FormData();
      for (let i = 0; i < files.length; i++) {
        data.append("files", files[i]);
      }

      const res = await fetch("/api/uploadPDF", {
        method: "POST",
        body: data,
      });
      // handle the error
      if (!res.ok) throw new Error(await res.text());
    } catch (e: any) {
      // Handle errors here
      console.error(e);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="file"
        name="pdf"
        accept=".pdf"
        multiple
        onChange={(e) => setFiles(e.target.files)}
      />

      <button type="submit">Upload</button>
    </form>
  );
}
