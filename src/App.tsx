
import { useState } from "react";
import StellarWalletConnect from "./StellarWalletConnect";
import VideoUpload from "./VideoUpload";
import VideoList from "./VideoList";

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [refreshVideos, setRefreshVideos] = useState(false);

  const handleVideoUploaded = () => {
    setRefreshVideos(!refreshVideos);
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

        {walletAddress && (
          <div className="mb-8">
            <VideoUpload 
              walletAddress={walletAddress} 
              onVideoUploaded={handleVideoUploaded}
            />
          </div>
        )}

        <VideoList 
          walletAddress={walletAddress}
          refresh={refreshVideos}
        />
      </div>
    </div>
  );
}

export default App;