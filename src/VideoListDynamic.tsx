import { useState, useEffect } from "react";

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

export default function VideoListDynamic({ walletAddress, refresh }: VideoListProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVideos = async () => {
    try {
      setLoading(true);
      console.log('Loading videos from real contract...');
      
      // Only use real contract helpers
      const contractHelpers = await import("./realContractHelpers");
      
      console.log('Getting video count...');
      const count = await contractHelpers.getVideoCount();
      console.log('Video count:', count);
      
      const videoList: Video[] = [];

      for (let i = 1n; i <= count; i++) {
        console.log(`Getting info for video ${i}...`);
        const info = await contractHelpers.getVideoInfo(i);
        console.log(`Video ${i} info:`, info);
        
        if (info) {
          const [thumbnailIpfs, price] = info;
          const userHasAccess = walletAddress 
            ? await contractHelpers.hasAccess(walletAddress, i)
            : false;
          
          console.log(`Video ${i} access for ${walletAddress}:`, userHasAccess);

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

    console.log('Attempting to buy video:', videoId, 'by user:', walletAddress);

    try {
      // Only use real contract helpers
      const contractHelpers = await import("./realContractHelpers");
        
      await contractHelpers.buyVideo(walletAddress, videoId);
      console.log('Purchase successful for video:', videoId);
      alert('Video purchased successfully!');
      // After successful purchase, reload videos
      loadVideos();
    } catch (error) {
      console.error('Purchase failed:', error);
      alert(`Purchase failed: ${error}`);
    }
  };

  const handleWatchVideo = async (videoId: bigint) => {
    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // Only use real contract helpers
      const contractHelpers = await import("./realContractHelpers");
        
      const content = await contractHelpers.getVideoContent(walletAddress, videoId);
      if (content) {
        const [videoIpfs, _thumbnailIpfs] = content;
        // Open video in new tab
        window.open(`https://${PINATA_GATEWAY}/ipfs/${videoIpfs}`, '_blank');
      }
    } catch (error) {
      console.error('Failed to access video:', error);
      alert('Failed to access video');
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
      <h2 className="text-2xl font-bold mb-4">Available Videos (On-chain)</h2>
      
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
                  onClick={() => handleWatchVideo(video.id)}
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
