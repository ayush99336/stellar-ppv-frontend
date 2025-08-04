// Mock contract helpers for testing the UI before full blockchain integration
// This simulates the contract behavior using localStorage

export interface UploadParams {
  uploader: string;
  videoIpfs: string;
  thumbnailIpfs: string;
  price: bigint;
}

export interface Video {
  id: bigint;
  uploader: string;
  videoIpfs: string;
  thumbnailIpfs: string;
  price: bigint;
  buyers: string[];
}

// Mock storage key
const VIDEOS_KEY = 'stellar_ppv_videos';

function getVideos(): Video[] {
  const stored = localStorage.getItem(VIDEOS_KEY);
  return stored ? JSON.parse(stored, (key, value) => {
    // Convert string back to bigint for price and id
    if (key === 'price' || key === 'id') {
      return BigInt(value);
    }
    return value;
  }) : [];
}

function saveVideos(videos: Video[]): void {
  localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos, (_key, value) => {
    // Convert bigint to string for storage
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }));
}

export async function uploadToContract(params: UploadParams): Promise<bigint> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const videos = getVideos();
  const newId = BigInt(videos.length + 1);
  
  const newVideo: Video = {
    id: newId,
    uploader: params.uploader,
    videoIpfs: params.videoIpfs,
    thumbnailIpfs: params.thumbnailIpfs,
    price: params.price,
    buyers: []
  };
  
  videos.push(newVideo);
  saveVideos(videos);
  
  console.log('Mock: Video uploaded with ID:', newId);
  return newId;
}

export async function getVideoInfo(videoId: bigint): Promise<readonly [string, bigint] | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const videos = getVideos();
  const video = videos.find(v => v.id === videoId);
  
  if (!video) return null;
  
  return [video.thumbnailIpfs, video.price] as const;
}

export async function hasAccess(viewer: string, videoId: bigint): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const videos = getVideos();
  const video = videos.find(v => v.id === videoId);
  
  if (!video) return false;
  
  // Uploader always has access
  if (video.uploader === viewer) return true;
  
  // Check if viewer has purchased
  return video.buyers.includes(viewer);
}

export async function getVideoCount(): Promise<bigint> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const videos = getVideos();
  return BigInt(videos.length);
}

export async function buyVideo(buyer: string, videoId: bigint): Promise<void> {
  console.log('buyVideo called with:', { buyer, videoId });
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const videos = getVideos();
  console.log('Current videos:', videos);
  const videoIndex = videos.findIndex(v => v.id === videoId);
  
  if (videoIndex === -1) {
    console.error('Video not found with ID:', videoId);
    throw new Error('Video not found');
  }
  
  const video = videos[videoIndex];
  console.log('Found video:', video);
  
  // Check if already purchased
  if (!video.buyers.includes(buyer)) {
    video.buyers.push(buyer);
    saveVideos(videos);
    console.log('Added buyer to video, updated videos:', videos);
  } else {
    console.log('User already owns this video');
  }
  
  console.log('Mock: Video purchased by:', buyer);
}

export async function getVideoContent(viewer: string, videoId: bigint): Promise<readonly [string, string] | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Check if user has access first
  const access = await hasAccess(viewer, videoId);
  if (!access) {
    throw new Error('Access denied: User has not purchased this video');
  }
  
  const videos = getVideos();
  const video = videos.find(v => v.id === videoId);
  
  if (!video) return null;
  
  return [video.videoIpfs, video.thumbnailIpfs] as const;
}

// Native XLM token address on Stellar testnet
export const NATIVE_TOKEN_ADDRESS = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAOBKYCNTGG";
export const CONTRACT_ADDRESS = "CBGZEWDUHTGPR4HSGN6Q36FIU46EOTEIYINV7QW2RW35D3JU2S5VBXKZ";
