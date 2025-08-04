import React from "react";
import { pinata } from "./pinata";
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY;

async function uploadToPinata(file: File) {
  try {
    const upload = await pinata.upload
      .public.file(file)
      .name(file.name)
      .keyvalues({ app: "demo" });
    const cid = upload.cid;
    const url = `https://${PINATA_GATEWAY}/ipfs/${cid}`;
    return url;
  } catch (err) {
    console.error("Pinata upload failed:", err);
    throw err;
  }
}

export default function FileUploader({ onUploaded }: { onUploaded: (url: string) => void }) {
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadToPinata(file);
      onUploaded(url);
    }
  };
  return <input type="file" onChange={handleChange} />;
}
