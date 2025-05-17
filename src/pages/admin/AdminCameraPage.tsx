import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/common/Loading";
import { Video, AlertCircle } from "lucide-react";

const AdminCameraPage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const streamUrl = "https://dbf9-156-222-42-86.ngrok-free.app/stream";

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center space-x-3">
        <div className="p-2 bg-[#DFF5E1] rounded-lg">
          <Video className="w-6 h-6 text-[#3B945E]" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Live Camera Stream
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor the laboratory in real-time
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-800">
              Laboratory Camera
            </h2>
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1 text-sm text-gray-500">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Live</span>
              </span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div
            className="relative bg-gray-100 rounded-lg overflow-hidden"
            style={{ height: "480px", margin: "0 auto" }}
          >
            <img
              src={streamUrl}
              alt="Camera Stream"
              className="w-full h-full object-cover"
              onError={() =>
                setError(
                  "Failed to load the stream. Ensure the backend server is running and accessible."
                )
              }
              onLoad={() => setError(null)}
            />
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-75">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-white text-center p-4 max-w-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCameraPage;
