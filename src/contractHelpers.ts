import { 
  Client,
  networks 
} from '../bindings';

// Initialize contract client
const contractClient = new Client({
  contractId: networks.testnet.contractId,
  networkPassphrase: networks.testnet.networkPassphrase,
  rpcUrl: "https://soroban-testnet.stellar.org"
});

export interface UploadParams {
  uploader: string;
  videoIpfs: string;
  thumbnailIpfs: string;
  price: bigint;
}

export async function uploadToContract(params: UploadParams): Promise<bigint> {
  try {
    const tx = await contractClient.upload({
      uploader: params.uploader,
      video_ipfs: params.videoIpfs,
      thumbnail_ipfs: params.thumbnailIpfs,
      price: params.price
    });

    // For now, just simulate - you'll integrate with wallet signing later
    const result = await tx.simulate();
    return result.result;
  } catch (error) {
    console.error('Contract upload failed:', error);
    throw error;
  }
}

export async function getVideoInfo(videoId: bigint): Promise<readonly [string, bigint] | null> {
  try {
    const tx = await contractClient.get_video_info({ video_id: videoId });
    const result = await tx.simulate();
    return result.result || null;
  } catch (error) {
    console.error('Get video info failed:', error);
    return null;
  }
}

export async function hasAccess(viewer: string, videoId: bigint): Promise<boolean> {
  try {
    const tx = await contractClient.has_access({ viewer, video_id: videoId });
    const result = await tx.simulate();
    return result.result;
  } catch (error) {
    console.error('Check access failed:', error);
    return false;
  }
}

export async function getVideoCount(): Promise<bigint> {
  try {
    const tx = await contractClient.get_video_count();
    const result = await tx.simulate();
    return result.result;
  } catch (error) {
    console.error('Get video count failed:', error);
    return 0n;
  }
}

// Native XLM token address on Stellar testnet
export const NATIVE_TOKEN_ADDRESS = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAOBKYCNTGG";
