import { Client, networks } from '../bindings/dist/index.js';

// Initialize the client


// Initialize the client
const client = new Client({
  ...networks.testnet,
  rpcUrl: 'https://soroban-testnet.stellar.org', // or your preferred RPC endpoint
});

async function getVideoInfo() {
  try {
    // Get info for video ID 1
    const videoId = 1;
    
    console.log('Calling get_video_info for video ID:', videoId);
    
    const tx = await client.get_video_info({
      video_id: videoId
    });
    
    console.log('Raw transaction result:', tx.result);
    
    // The result is an Option<[string, i128]> - could be null or an array
    const result = tx.result;
    
    if (result !== null && result !== undefined) {
      // Check if result is an array
      if (Array.isArray(result) && result.length === 2) {
        const [thumbnailIpfs, price] = result;
        console.log('Video Info:');
        console.log('- Thumbnail IPFS:', thumbnailIpfs);
        console.log('- Price:', price.toString());
      } else {
        console.log('Unexpected result format:', result);
        console.log('Type of result:', typeof result);
      }
    } else {
      console.log('Video not found (result is null/undefined)');
    }
    
  } catch (error) {
    console.error('Error getting video info:', error);
    console.error('Error details:', error.message);
  }
}

// Usage
getVideoInfo();

// Usage
getVideoInfo();
