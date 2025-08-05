import { 
  StellarWalletsKit, 
  WalletNetwork,
  allowAllModules 
} from '@creit.tech/stellar-wallets-kit';
import { 
  Client,
  networks
} from '../bindings';

// Initialize contract client with source account
const getContractClient = (sourceAccount?: string) => {
  return new Client({
    contractId: networks.testnet.contractId,
    networkPassphrase: networks.testnet.networkPassphrase,
    rpcUrl: "https://soroban-testnet.stellar.org",
    ...(sourceAccount && { publicKey: sourceAccount })
  });
};

export interface UploadParams {
  uploader: string;
  videoIpfs: string;
  thumbnailIpfs: string;
  title: string;
  description: string;
  price: bigint;
}

export interface BuyParams {
  buyer: string;
  videoId: bigint;
  tokenId: string;
}

export interface ViewParams {
  viewer: string;
  videoId: bigint;
}

// Initialize wallet kit
const initWalletKit = () => {
  return new StellarWalletsKit({
    network: WalletNetwork.TESTNET,
    modules: allowAllModules(),
  });
};

export async function uploadToContract(params: UploadParams): Promise<bigint> {
  try {
    console.log('Uploading to contract with params:', params);
    
    // Create client with the uploader as source account
    const clientWithSource = getContractClient(params.uploader);
    
    // Build the transaction with proper options
    const tx = await clientWithSource.upload({
      uploader: params.uploader,
      video_ipfs: params.videoIpfs,
      thumbnail_ipfs: params.thumbnailIpfs,
      title: params.title,
      description: params.description,
      price: params.price
    }, {
      fee: 100000 // Set explicit fee (increased for complex contract calls)
    });

    console.log('Transaction built, simulating...');
    
    // First simulate to get resource usage and auth requirements
    const simulationResult = await tx.simulate();
    console.log('Simulation result:', simulationResult);
    
    console.log('Transaction simulated, signing...');
    
    // Sign and send transaction using wallet kit
    const kit = initWalletKit();
    
    const result = await tx.signAndSend({
      signTransaction: async (txXdr: string) => {
        console.log('Signing transaction XDR:', txXdr);
        const { signedTxXdr } = await kit.signTransaction(txXdr, {
          address: params.uploader,
          networkPassphrase: WalletNetwork.TESTNET
        });
        console.log('Transaction signed successfully');
        return { signedTxXdr };
      }
    });

    console.log('Upload result:', result);
    console.log('Upload result type:', typeof result.result);
    console.log('Upload result value:', result.result);
    
    // The transaction was successful, extract video ID from simulation result
    // Since the blockchain explorer shows it's working, let's get the ID from simulation
    if (simulationResult && simulationResult.result !== undefined) {
      console.log('Getting video ID from simulation result:', simulationResult.result);
      // Handle Result type
      const simResult = simulationResult.result as any;
      if (simResult.Ok !== undefined) {
        return BigInt(simResult.Ok);
      } else if (simResult.value !== undefined) {
        return BigInt(simResult.value);
      } else if (typeof simResult === 'number' || typeof simResult === 'bigint') {
        return BigInt(simResult);
      }
    }
    
    // Fallback: try to get from transaction result
    if (result && result.result !== undefined) {
      const txResult = result.result as any;
      if (txResult.Ok !== undefined) {
        return BigInt(txResult.Ok);
      } else if (txResult.value !== undefined) {
        return BigInt(txResult.value);
      } else if (typeof txResult === 'number' || typeof txResult === 'bigint') {
        return BigInt(txResult);
      }
    }
    
    // If we can't parse the result but the transaction succeeded,
    // get the video count to determine the new video ID
    console.log('Result parsing failed, but transaction succeeded. Getting video count...');
    const videoCount = await getVideoCount();
    return videoCount; // The latest video ID should be the count
    
  } catch (error) {
    console.error('Contract upload failed:', error);
    
    // Check if this is just an XDR parsing error but the transaction actually succeeded
    if (error instanceof Error && error.message.includes('Bad union switch')) {
      console.log('Transaction may have succeeded despite XDR parsing error');
      // Get the video count to determine the new video ID
      console.log('Getting video count after parsing error...');
      const videoCount = await getVideoCount();
      return videoCount; // The latest video ID should be the count
    }
    
    throw error;
  }
}

export async function buyVideo(buyer: string, videoId: bigint): Promise<void> {
  try {
    console.log('Buying video with params:', { buyer, videoId });
    
    const params: BuyParams = {
      buyer,
      videoId,
      tokenId: NATIVE_TOKEN_ADDRESS // Use native XLM
    };
    
    // Create client with the buyer as source account
    const clientWithSource = getContractClient(params.buyer);
    
    const tx = await clientWithSource.buy({
      buyer: params.buyer,
      video_id: params.videoId,
      token_id: params.tokenId
    }, {
      fee: 100000 // Set explicit fee
    });

    console.log('Transaction built, simulating...');
    
    // First simulate to get resource usage
    const simulationResult = await tx.simulate();
    console.log('Buy simulation result:', simulationResult);

    console.log('Transaction simulated successfully, signing...');
    
    const kit = initWalletKit();

    await tx.signAndSend({
      signTransaction: async (txXdr: string) => {
        console.log('Signing buy transaction XDR:', txXdr);
        const { signedTxXdr } = await kit.signTransaction(txXdr, {
          address: params.buyer,
          networkPassphrase: WalletNetwork.TESTNET
        });
        console.log('Buy transaction signed successfully');
        return { signedTxXdr };
      }
    });

    console.log('Video purchased successfully!');
    // Don't try to parse the result, just assume success if no exception was thrown
  } catch (error) {
    console.error('Buy video failed:', error);
    
    // Check if this is just an XDR parsing error but the transaction actually succeeded
    if (error instanceof Error && error.message.includes('Bad union switch')) {
      console.log('Transaction may have succeeded despite XDR parsing error');
      // Don't throw, treat as success
      return;
    }
    
    throw error;
  }
}

export async function getVideoInfo(videoId: bigint): Promise<[string, bigint, string?] | null> {
  try {
    const contract = getContractClient();
    
    const tx = await contract.get_video_info(
      { video_id: videoId }
    );

    console.log('Video info transaction for video', videoId, ':', tx);
    
    // The transaction already has the result, no need to simulate again
    console.log('Video info result for video', videoId, ':', tx.result);

    if (tx.result) {
      let videoInfo: any;
      
      // Handle the Ok2 { value: { ... } } structure
      if (typeof tx.result === 'object' && tx.result !== null) {
        const result = tx.result as any;
        
        // Check if it's an Ok2 instance with a value property
        if (result.value && typeof result.value === 'object') {
          // Structure: Ok2 { value: VideoInfo }
          videoInfo = result.value;
        } else if ('Ok' in result && result.Ok && typeof result.Ok === 'object' && 'value' in result.Ok) {
          // Structure: Ok { value: VideoInfo }
          videoInfo = result.Ok.value;
        } else if ('Ok' in result) {
          // Structure: Ok { VideoInfo }
          videoInfo = result.Ok;
        } else if ('thumbnail_ipfs' in result && 'price' in result) {
          // Direct VideoInfo object
          videoInfo = result;
        } else {
          console.warn('Unexpected result structure:', tx.result);
          return null;
        }
      } else {
        console.warn('Result is not an object:', tx.result);
        return null;
      }
      
      console.log(`Video ${videoId} info:`, videoInfo);
      
      // Return thumbnail, price, and title as expected by the UI
      return [videoInfo.thumbnail_ipfs, BigInt(videoInfo.price), videoInfo.title];
    }
    
    console.warn('No valid result found for video:', videoId);
    return null;
    
  } catch (error) {
    console.error('Contract getVideoInfo failed:', error);
    return null;
  }
}
export async function hasAccess(viewer: string, videoId: bigint): Promise<boolean> {
  try {
    const client = getContractClient();
    const tx = await client.has_access({ viewer, video_id: videoId });
    return tx.result;
  } catch (error) {
    console.error('Check access failed:', error);
    return false;
  }
}

export async function getVideoContent(viewer: string, videoId: bigint): Promise<readonly [string, string] | null> {
  try {
    const client = getContractClient();
    console.log('Getting video content for viewer:', viewer, 'video:', videoId);
    
    const tx = await client.view({ viewer, video_id: videoId });
    console.log("raw view result:", tx.result);
    
    if (tx.result) {
      let contentResult: any;
      
      // Handle the Ok2 { value: [video_ipfs, thumbnail_ipfs] } structure
      if (typeof tx.result === 'object' && tx.result !== null) {
        const result = tx.result as any;
        
        // Check if it's an Ok2 instance with a value property
        if (result.value && Array.isArray(result.value)) {
          contentResult = result.value;
        } else if ('Ok' in result && Array.isArray(result.Ok)) {
          contentResult = result.Ok;
        } else if (Array.isArray(result)) {
          contentResult = result;
        } else {
          console.warn('Unexpected view result structure:', tx.result);
          return null;
        }
      } else {
        console.warn('View result is not an object:', tx.result);
        return null;
      }
      
      if (Array.isArray(contentResult) && contentResult.length >= 2) {
        const [videoIpfs, thumbnailIpfs] = contentResult;
        console.log('Parsed video content:', { videoIpfs, thumbnailIpfs });
        return [videoIpfs as string, thumbnailIpfs as string];
      }
    }
    
    console.warn('No video content found or unexpected format:', tx.result);
    return null;
    
  } catch (error) {
    console.error('Get video content failed:', error);
    return null;
  }
}

export async function getVideoCount(): Promise<bigint> {
  try {
    const client = getContractClient();
    console.log('Getting video count');
    
    const tx = await client.get_video_count();
    console.log("raw video count result:", tx.result);
    
    if (tx.result != null) {
      const count = BigInt(tx.result);
      console.log('Video count as bigint:', count);
      return count;
    }
    
    console.warn('Video count result is null');
    return BigInt(0);
    
  } catch (error) {
    console.error('Contract getVideoCount failed:', error);
    return BigInt(0);
  }
}

// Native XLM token address on Stellar testnet  
// Using the correct Stellar Asset Contract (SAC) address for native XLM on testnet
export const NATIVE_TOKEN_ADDRESS = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
export const CONTRACT_ADDRESS = "CBGZEWDUHTGPR4HSGN6Q36FIU46EOTEIYINV7QW2RW35D3JU2S5VBXKZ";
