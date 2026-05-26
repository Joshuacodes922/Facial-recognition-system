import { useRef, useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface VerificationResult {
  valid: boolean;
  confidence: number;
  message: string;
}

export default function Index() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
      console.error("Camera error:", err);
    }
  };

  const verifyFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
       // const imageData = canvasRef.current.toDataURL("image/jpeg");

        const blob = await new Promise((resolve) => {
          canvasRef.current.toBlob(resolve, "image/jpeg");
        });

        const formData = new FormData();
        formData.append("image2", blob, "face.jpg");

        const response = await fetch("http://127.0.0.1:8000/validate", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Verification failed");
        }

        const data = (await response.json()) as VerificationResult;
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification error occurred");
      setResult({
        valid: false,
        confidence: 0,
        message: "Unable to process image",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetResult = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="dark min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex flex-col items-center justify-center p-4">
      {/* Background animated accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="w-full max-w-3xl space-y-10 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block mb-2">
            
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight tracking-tight">
            Facial<br />
            <span className="bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
              Recognition APP
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto font-light">
            Powered by Siamese Neural Network Technology
          </p>
        </div>

        {/* Camera Feed */}
        <div className="rounded-2xl overflow-hidden bg-black border-2 border-primary/50 shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-shadow duration-300">
          <div className="relative aspect-video w-full bg-gradient-to-br from-gray-900 to-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-80 border-2 border-primary rounded-2xl animate-pulse shadow-lg shadow-primary/50" />
              </div>
            )}
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div
            className={`p-8 rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 ${
              result.valid
                ? "bg-green-950/40 border-green-500/60 shadow-lg shadow-green-500/20"
                : "bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-500/20"
            }`}
          >
            <div className="flex gap-4">
              {result.valid ? (
                <CheckCircle className="w-7 h-7 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-7 h-7 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3
                  className={`font-display text-2xl tracking-wide ${
                    result.valid ? "text-green-300" : "text-amber-300"
                  }`}
                >
                  {result.valid ? "IDENTITY VERIFIED" : "VERIFICATION REQUIRED"}
                </h3>
                <p
                  className={`text-sm mt-2 ${
                    result.valid ? "text-green-200/80" : "text-amber-200/80"
                  }`}
                >
                  {result.message}
                </p>
                <div className="mt-4">
                  <p className="text-sm font-medium text-white flex justify-between">
                    <span>Confidence</span>
                    <span>{(result.confidence * 100).toFixed(1)}%</span>
                  </p>
                  <div className="w-full bg-gray-800/50 rounded-full h-3 mt-2 overflow-hidden border border-gray-700/30">
                    <div
                      className={`h-full transition-all duration-500 ${
                        result.valid ? "bg-gradient-to-r from-green-500 to-green-400" : "bg-gradient-to-r from-amber-500 to-amber-400"
                      }`}
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="p-6 rounded-2xl bg-primary/10 border border-primary/50 backdrop-blur-sm flex gap-3 items-center justify-center">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <p className="text-white font-display tracking-wide text-lg">Verifying identity...</p>
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-950/40 border border-red-500/60 rounded-2xl backdrop-blur-sm flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Verify Button */}
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={verifyFace}
            disabled={!isCameraReady || isLoading}
            className="px-12 py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg font-display text-xl tracking-widest uppercase hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-primary/50 hover:border-primary disabled:border-primary/20"
          >
            Verify
          </button>
          {result && (
            <button
              onClick={resetResult}
              className="px-12 py-4 bg-gray-800/60 border border-gray-700/50 text-gray-300 rounded-lg font-display text-xl tracking-widest uppercase hover:bg-gray-700/60 hover:border-gray-600 transition-all duration-200 backdrop-blur-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
