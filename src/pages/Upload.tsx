import { useState, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useVideos, Video, Short } from "@/contexts/VideoContext";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import {
  Upload as UploadIcon,
  FileVideo,
  Sparkles,
  CheckCircle2,
  Download,
  Play,
  LayoutDashboard,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

type UploadState = "idle" | "uploading" | "processing" | "complete";

export default function Upload() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedShorts, setGeneratedShorts] = useState<Short[]>([]);
  const [dragActive, setDragActive] = useState(false);
  
  const { addVideo } = useVideos();
  const { isAuthenticated, isLoading } = useAuth();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    const allowedExtensions = ['mp4', 'mov', 'avi', 'mkv', 'wmv'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      toast.error("Invalid file type", {
        description: "Please upload a video file (MP4, MOV, AVI, MKV, or WMV)",
      });
      return;
    }

    setSelectedFile(file);
    setUploadState("uploading");
    setUploadProgress(0);

    try {
      // fileExtension is already validated above
      const uploadUrlResponse = await fetch(
        `http://localhost:8000/api/video-upload/generate-upload-url?file_extension=${fileExtension}&expiry_hours=2`
      );

      if (!uploadUrlResponse.ok) {
        throw new Error(`Failed to get upload URL: ${uploadUrlResponse.statusText}`);
      }

      const uploadUrlData = await uploadUrlResponse.json();
      const sasUrl = uploadUrlData.sas_url;

      if (!sasUrl) {
        throw new Error("No sas_url in response");
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('PUT', sasUrl);
        xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
        xhr.send(file);
      });

      setUploadState("processing");

      for (let i = 0; i <= 100; i += 5) {
        await new Promise((r) => setTimeout(r, 150));
        setProcessingProgress(i);
      }

      const mockShorts: Short[] = [
        {
          id: `short_${Date.now()}_1`,
          title: "Key Insight #1",
          duration: "0:45",
          thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=356&fit=crop",
          videoUrl: "",
          createdAt: new Date(),
        },
        {
          id: `short_${Date.now()}_2`,
          title: "Highlight Moment",
          duration: "0:58",
          thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&h=356&fit=crop",
          videoUrl: "",
          createdAt: new Date(),
        },
        {
          id: `short_${Date.now()}_3`,
          title: "Best Quote",
          duration: "0:32",
          thumbnail: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=200&h=356&fit=crop",
          videoUrl: "",
          createdAt: new Date(),
        },
        {
          id: `short_${Date.now()}_4`,
          title: "Action Clip",
          duration: "1:05",
          thumbnail: "https://images.unsplash.com/photo-1551817958-d9d86fb29431?w=200&h=356&fit=crop",
          videoUrl: "",
          createdAt: new Date(),
        },
      ];

      setGeneratedShorts(mockShorts);
      setUploadState("complete");

      // Add to videos context
      const newVideo: Video = {
        id: `video_${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=225&fit=crop",
        duration: "10:00",
        uploadedAt: new Date(),
        status: "completed",
        shorts: mockShorts,
      };

      addVideo(newVideo);
      toast.success("Video processed!", {
        description: `${mockShorts.length} shorts have been generated.`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : "An error occurred during upload",
      });
      setUploadState("idle");
      setUploadProgress(0);
      setSelectedFile(null);
    }
  };

  const resetUpload = () => {
    setUploadState("idle");
    setUploadProgress(0);
    setProcessingProgress(0);
    setSelectedFile(null);
    setGeneratedShorts([]);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <AnimatePresence mode="wait">
          {uploadState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Upload Your Video
              </h1>
              <p className="text-muted-foreground mb-8">
                Drop a video and let AI create engaging shorts
              </p>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-12 md:p-24 transition-all duration-300 ${
                  dragActive
                    ? "border-primary bg-primary/5 glow"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <input
                  type="file"
                  accept=".mp4,.mov,.avi,.mkv,.wmv"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mb-6">
                    <UploadIcon className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">
                    Drag & drop your video
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    or click to browse files
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports MP4, MOV, AVI, MKV, WMV
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {(uploadState === "uploading" || uploadState === "processing") && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-md mx-auto"
            >
              <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6 animate-pulse">
                {uploadState === "uploading" ? (
                  <FileVideo className="w-10 h-10 text-primary-foreground" />
                ) : (
                  <Sparkles className="w-10 h-10 text-primary-foreground" />
                )}
              </div>

              <h2 className="text-xl font-semibold mb-2">
                {uploadState === "uploading"
                  ? "Uploading video..."
                  : "AI is creating your shorts..."}
              </h2>
              <p className="text-muted-foreground mb-6">
                {uploadState === "uploading"
                  ? `Uploading ${selectedFile?.name}`
                  : "Analyzing content and finding key moments"}
              </p>

              <div className="space-y-2">
                <Progress
                  value={
                    uploadState === "uploading" ? uploadProgress : processingProgress
                  }
                  className="h-2"
                />
                <p className="text-sm text-muted-foreground">
                  {uploadState === "uploading"
                    ? `${uploadProgress}%`
                    : `${processingProgress}%`}
                </p>
              </div>
            </motion.div>
          )}

          {uploadState === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Processing Complete!</h2>
                    <p className="text-muted-foreground">
                      {generatedShorts.length} shorts generated from your video
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetUpload}>
                    <X className="w-4 h-4 mr-2" />
                    Upload Another
                  </Button>
                  <Link to="/dashboard">
                    <Button variant="gradient">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      View Dashboard
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Original Video */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">Original Video</h3>
                  <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mx-auto mb-3">
                        <Play className="w-8 h-8" />
                      </div>
                      <p className="text-muted-foreground">{selectedFile?.name}</p>
                    </div>
                  </div>
                </div>

                {/* Generated Shorts */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">AI Generated Shorts</h3>
                  <div className="space-y-4">
                    {generatedShorts.map((short, index) => (
                      <motion.div
                        key={short.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-3 p-3 rounded-xl bg-card border border-border/50 group hover:border-primary/50 transition-colors"
                      >
                        <div className="relative w-16 rounded-lg overflow-hidden aspect-[9/16] flex-shrink-0">
                          <img
                            src={short.thumbnail}
                            alt={short.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-6 h-6" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {short.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {short.duration}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0"
                          onClick={() =>
                            toast.success("Download started!", {
                              description: `Downloading "${short.title}"`,
                            })
                          }
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
