import { useState } from "react";
import { pinata } from "./pinata";
import { uploadToContract } from "./realContractHelpers";

interface VideoUploadProps {
  walletAddress: string | null;
  onVideoUploaded: () => void;
}

export default function VideoUpload({ walletAddress, onVideoUploaded }: VideoUploadProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [price, setPrice] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const uploadToPinata = async (file: File): Promise<string> => {
    const upload = await pinata.upload
      .public.file(file)
      .name(file.name)
      .keyvalues({ app: "stellar-ppv" });
    
    return upload.cid;
  };

  const handleUpload = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }

    if (!videoFile || !thumbnailFile || !price) {
      alert("Please provide video, thumbnail, and price");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading video to IPFS...");

    try {
      // Upload video to IPFS
      const videoIpfsHash = await uploadToPinata(videoFile);
      setUploadStatus("Uploading thumbnail to IPFS...");
      
      // Upload thumbnail to IPFS
      const thumbnailIpfsHash = await uploadToPinata(thumbnailFile);
      setUploadStatus("Registering on blockchain...");

      // Register on blockchain
      const priceInStroops = BigInt(parseFloat(price) * 10_000_000); // Convert XLM to stroops
      
      const videoId = await uploadToContract({
        uploader: walletAddress,
        videoIpfs: videoIpfsHash,
        thumbnailIpfs: thumbnailIpfsHash,
        price: priceInStroops
      });

      setUploadStatus(`Upload successful! Video ID: ${videoId}`);
      setVideoFile(null);
      setThumbnailFile(null);
      setPrice("");
      onVideoUploaded();
      
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus(`Upload failed: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Thumbnail Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Price (XLM)</label>
          <input
            type="number"
            step="0.0000001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="1.0"
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={isUploading || !walletAddress}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isUploading ? "Uploading..." : "Upload Video"}
        </button>

        {uploadStatus && (
          <div className="mt-2 p-2 bg-gray-100 rounded">
            {uploadStatus}
          </div>
        )}
      </div>
    </div>
  );
}
