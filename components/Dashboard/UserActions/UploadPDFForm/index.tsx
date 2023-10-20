import { useState } from "react";

export function UploadPDF() {
  const [file, setFile] = useState<File>();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    try {
      const data = new FormData();
      data.set("file", file);

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
        onChange={(e) => setFile(e.target.files?.[0])}
      />

      <button type="submit">Upload</button>
    </form>
  );
}
