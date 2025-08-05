
import { useState } from "react";
import StellarWalletConnect from "./StellarWalletConnect";
import VideoUploadDynamic from "./VideoUploadDynamic";
import VideoListDynamic from "./VideoListDynamic";

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [refreshVideos, setRefreshVideos] = useState<number>(0);

  const handleVideoUploaded = () => {
    setRefreshVideos(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Stellar Pay-to-View Video Platform</h1>
        
        <div className="mb-8">
          <StellarWalletConnect 
            onConnect={setWalletAddress}
            onDisconnect={() => setWalletAddress(null)}
          />
        </div>

        {/* Test Contract Functions Button */}
        <div className="mb-4">
          <button
            onClick={async () => {
              console.log('Testing contract functions...');
              try {
                const { getVideoCount, getVideoInfo } = await import('./realContractHelpers');
                const count = await getVideoCount();
                console.log('Video count:', count);
                
                for (let i = 1n; i <= count; i++) {
                  const info = await getVideoInfo(i);
                  console.log(`Video ${i} info:`, info);
                }
              } catch (error) {
                console.error('Test failed:', error);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Contract Functions
          </button>
        </div>

        {walletAddress && (
          <div className="mb-8">
            <VideoUploadDynamic 
              walletAddress={walletAddress} 
              onVideoUploaded={handleVideoUploaded}
            />
          </div>
        )}

        <VideoListDynamic 
          walletAddress={walletAddress}
          refresh={refreshVideos}
        />
      </div>
    </div>
  );
}

export default App;