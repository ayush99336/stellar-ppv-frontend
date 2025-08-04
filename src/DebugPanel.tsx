import { useState } from "react";

export default function DebugPanel() {
  const [showData, setShowData] = useState(false);

  const clearData = () => {
    localStorage.removeItem('stellar_ppv_videos');
    alert('All video data cleared!');
    window.location.reload();
  };

  const getStoredData = () => {
    const stored = localStorage.getItem('stellar_ppv_videos');
    return stored ? JSON.parse(stored) : [];
  };

  return (
    <div className="bg-red-50 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-bold mb-2">🔧 Debug Panel</h3>
      <div className="space-x-2">
        <button
          onClick={() => setShowData(!showData)}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          {showData ? 'Hide' : 'Show'} Stored Data
        </button>
        <button
          onClick={clearData}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          Clear All Data
        </button>
      </div>
      
      {showData && (
        <div className="mt-3">
          <h4 className="font-semibold">Stored Videos:</h4>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(getStoredData(), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
