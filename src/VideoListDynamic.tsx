import { useState, useEffect } from 'react';
import { 
  getVideoInfo, 
  hasAccess, 
  buyVideo, 
  getVideoCount,
  getVideoContent
} from './realContractHelpers';

const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || "gateway.pinata.cloud";

interface Video {
  id: bigint;
  thumbnailIpfs: string;
  price: bigint;
  title?: string;
  hasAccess: boolean;
}

interface CurrentVideo {
  id: bigint;
  videoUrl: string;
  title: string;
}

interface VideoListProps {
  walletAddress: string | null;
  refresh: number;
}

export default function VideoListDynamic({ walletAddress, refresh }: VideoListProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState<CurrentVideo | null>(null);

  const loadVideos = async () => {
    try {
      setLoading(true);
      console.log('Loading videos from real contract...');
      
      console.log('Getting video count...');
      const count = await getVideoCount();
      console.log('Video count:', count);
      
      const videoList: Video[] = [];

      for (let i = 1n; i <= count; i++) {
        console.log(`Getting info for video ${i}...`);
        const info = await getVideoInfo(i);
        console.log(`Video ${i} info:`, info);
        
        if (info) {
          const [thumbnailIpfs, price, title] = info;
          
          // Only check access if wallet is connected
          let userHasAccess = false;
          if (walletAddress) {
            console.log(`Checking access for video ${i}...`);
            userHasAccess = await hasAccess(walletAddress, i);
            console.log(`Video ${i} access:`, userHasAccess);
          }
          
          videoList.push({
            id: i,
            thumbnailIpfs,
            price,
            title,
            hasAccess: userHasAccess
          });
        }
      }

      setVideos(videoList);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, [walletAddress, refresh]);

  const formatPrice = (price: bigint) => {
    return `${Number(price) / 10000000} XLM`;
  };

  const handleBuyVideo = async (videoId: bigint) => {
    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      console.log('Buying video:', videoId.toString());
      await buyVideo(walletAddress, videoId);
      console.log('Video bought successfully');
      alert('Video purchased successfully!');
      loadVideos(); // Refresh the list
    } catch (error) {
      console.error('Error buying video:', error);
      alert('Error purchasing video. Please try again.');
    }
  };

  const handleWatchVideo = async (videoId: bigint, title?: string) => {
    if (!walletAddress) {
      alert("Please connect your wallet first to watch videos");
      return;
    }

    try {
      console.log('Getting video content for video:', videoId.toString());
      const videoContent = await getVideoContent(walletAddress, videoId);
      
      if (videoContent) {
        const [videoIpfs] = videoContent;
        const videoUrl = `https://${PINATA_GATEWAY}/ipfs/${videoIpfs}`;
        console.log('Video URL:', videoUrl);
        
        setCurrentVideo({
          id: videoId,
          videoUrl,
          title: title || `Video ${videoId}`
        });
      } else {
        throw new Error('Could not get video content');
      }
    } catch (error) {
      console.error('Error getting video content:', error);
      alert('Error loading video. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Available Videos (On-chain)</h2>
        <p className="text-gray-500">Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Available Videos (On-chain)</h2>
      
      {/* Video Player Modal */}
      {currentVideo && (
        <div className="mb-6 p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold">{currentVideo.title}</h3>
            <button
              onClick={() => setCurrentVideo(null)}
              className="text-red-500 hover:text-red-700 text-xl font-bold"
            >
              ✕
            </button>
          </div>
          <video
            src={currentVideo.videoUrl}
            controls
            className="w-full max-w-4xl mx-auto rounded"
            autoPlay
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      
      {videos.length === 0 ? (
        <p className="text-gray-500">No videos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div key={video.id.toString()} className="border rounded-lg p-4">
              <img
                src={`https://${PINATA_GATEWAY}/ipfs/${video.thumbnailIpfs}`}
                alt={video.title || `Video ${video.id}`}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <div className="mb-2">
                <h4 className="font-semibold text-lg">{video.title || `Video ${video.id}`}</h4>
                <span className="text-blue-600 font-medium">{formatPrice(video.price)}</span>
              </div>
              
              {!walletAddress ? (
                <button
                  onClick={() => alert("Please connect your wallet to interact with videos")}
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Connect Wallet to Buy
                </button>
              ) : video.hasAccess ? (
                <button
                  onClick={() => handleWatchVideo(video.id, video.title)}
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
