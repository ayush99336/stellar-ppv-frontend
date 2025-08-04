import { useState, useEffect } from "react";
import { getVideoCount, getVideoInfo, hasAccess } from "./contractHelpers";

const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY;

interface Video {
  id: bigint;
  thumbnailIpfs: string;
  price: bigint;
  hasAccess: boolean;
}

interface VideoListProps {
  walletAddress: string | null;
  refresh: boolean;
}

export default function VideoList({ walletAddress, refresh }: VideoListProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const count = await getVideoCount();
      const videoList: Video[] = [];

      for (let i = 1n; i <= count; i++) {
        const info = await getVideoInfo(i);
        if (info) {
          const [thumbnailIpfs, price] = info;
          const userHasAccess = walletAddress 
            ? await hasAccess(walletAddress, i)
            : false;

          videoList.push({
            id: i,
            thumbnailIpfs,
            price,
            hasAccess: userHasAccess
          });
        }
      }

      setVideos(videoList);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, [walletAddress, refresh]);

  const handleBuyVideo = async (videoId: bigint) => {
    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // For now, just show an alert - you'll integrate the actual buy function later
      alert(`This will buy video ${videoId}. Buy functionality needs wallet integration.`);
      // After successful purchase, reload videos
      loadVideos();
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed');
    }
  };

  const formatPrice = (price: bigint): string => {
    return (Number(price) / 10_000_000).toFixed(7) + " XLM";
  };

  if (loading) {
    return <div className="text-center py-8">Loading videos...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Available Videos</h2>
      
      {videos.length === 0 ? (
        <p className="text-gray-500">No videos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div key={video.id.toString()} className="border rounded-lg p-4">
              <img
                src={`https://${PINATA_GATEWAY}/ipfs/${video.thumbnailIpfs}`}
                alt={`Video ${video.id}`}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Video {video.id.toString()}</span>
                <span className="text-blue-600">{formatPrice(video.price)}</span>
              </div>
              
              {video.hasAccess ? (
                <button
                  onClick={() => window.open(`https://${PINATA_GATEWAY}/ipfs/${video.thumbnailIpfs}`, '_blank')}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  ▶ Watch Video
                </button>
              ) : (
                <button
                  onClick={() => handleBuyVideo(video.id)}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Buy for {formatPrice(video.price)}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
