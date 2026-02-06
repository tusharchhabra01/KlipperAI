import { useState, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useVideos, Video, Short } from "@/contexts/VideoContext";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link, useNavigate } from "react-router-dom";
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
import axiosInstance from "@/api/axiosInstance";
import { t } from "@/i18n";

type UploadState = "idle" | "uploading" | "processing" | "complete";

export default function Upload() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedShorts, setGeneratedShorts] = useState<Short[]>([]);
  const [dragActive, setDragActive] = useState(false);
  // const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [uploadedDurationSeconds, setUploadedDurationSeconds] = useState<number | null>(null);

  const { addVideo } = useVideos();
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

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

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);

      video.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(video.duration);
      });

      video.addEventListener('error', (e) => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load video metadata'));
      });

      video.src = url;
    });
  };

  /**
 * Generates a video thumbnail on the client side by capturing a frame
 * from the uploaded video while preserving the original aspect ratio.
 *
 * - The thumbnail is captured at a meaningful timestamp (frame 3)
 *   to avoid black or blank intro frames.
 * - The video frame is scaled to fit within a fixed canvas size
 *   (default 1280x720) without cropping.
 * - If the video aspect ratio does not match the canvas, black
 *   letterboxing (top/bottom) or pillarboxing (left/right) is applied.
 *
 * This approach ensures consistent thumbnail dimensions across
 * landscape, portrait, square, and ultra-wide videos, similar to
 * platforms like YouTube.
 *
 * The returned value is a temporary Object URL that can be used
 * for immediate preview in the UI.
 */
  const generateVideoThumbnail = (
    file: File,
    targetWidth = 1280,
    targetHeight = 720
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return reject("Canvas not supported");

      const videoUrl = URL.createObjectURL(file);
      video.src = videoUrl;
      video.currentTime = 3;
      video.muted = true;
      video.playsInline = true;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      video.onloadeddata = () => {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        const videoAspect = videoWidth / videoHeight;
        const canvasAspect = targetWidth / targetHeight;

        let drawWidth = targetWidth;
        let drawHeight = targetHeight;
        let offsetX = 0;
        let offsetY = 0;

        // 📐 Fit video inside canvas while preserving aspect ratio
        if (videoAspect > canvasAspect) {
          // Video is wider → black bars top & bottom
          drawWidth = targetWidth;
          drawHeight = targetWidth / videoAspect;
          offsetY = (targetHeight - drawHeight) / 2;
        } else {
          // Video is taller → black bars left & right
          drawHeight = targetHeight;
          drawWidth = targetHeight * videoAspect;
          offsetX = (targetWidth - drawWidth) / 2;
        }

        // 🖤 Fill background with black
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // 🎬 Draw video frame
        ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject("Thumbnail generation failed");
            const thumbnailUrl = URL.createObjectURL(blob);
            URL.revokeObjectURL(videoUrl);
            resolve(thumbnailUrl);
          },
          "image/jpeg",
          0.9
        );
      };

      video.onerror = () => {
        URL.revokeObjectURL(videoUrl);
        reject("Failed to load video");
      };
    });
  };


  const handleFile = async (file: File) => {
    const allowedExtensions = ['mp4', 'mov', 'avi', 'mkv', 'wmv'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      toast.error(t("upload.toastInvalidTypeTitle"), {
        description: t("upload.toastInvalidTypeDescription"),
      });
      return;
    }

    // Validate file size (20MB = 20 * 1024 * 1024 bytes). This is temporary and will be changed later.
    const maxSizeInBytes = 30 * 1024 * 1024; // 30MB
    if (file.size > maxSizeInBytes) {
      const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(t("upload.toastTooLargeTitle"), {
        description: t("upload.toastTooLargeDescription").replace(
          "{{size}}",
          fileSizeInMB
        ),
      });
      return;
    }

    // Validate video duration (20 seconds). This is temporary and will be changed later.
    let videoDurationSeconds = 0;
    try {
      const duration = await getVideoDuration(file);
      videoDurationSeconds = Math.floor(duration);
      const maxDurationSeconds = 20; // 20 seconds
      if (duration > maxDurationSeconds) {
        toast.error(t("upload.toastTooLongTitle"), {
          description: t("upload.toastTooLongDescription").replace(
            "{{seconds}}",
            String(videoDurationSeconds)
          ),
        });
        return;
      }
    } catch (error) {
      toast.error(t("upload.toastReadFailedTitle"), {
        description: t("upload.toastReadFailedDescription"),
      });
      return;
    }

    // Map file extensions to MIME types
    const mimeTypeMap: Record<string, string> = {
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      'wmv': 'video/x-ms-wmv',
    };

    const contentType = mimeTypeMap[fileExtension] || file.type || 'video/mp4';

    setSelectedFile(file);
    setUploadState("uploading");
    setUploadProgress(0);

    try {
      // fileExtension is already validated above
      const uploadUrlResponse = await axiosInstance.get(
        `/videoInputOutput/generate-upload-url`,
        {
          params: {
            file_extension: fileExtension,
            expiry_hours: 2,
          },
          headers: {
            'Content-Type': contentType,
          },
          withCredentials: true, // Ensure cookies (auth_token, device_id, refresh_token) are sent
        }
      );

      const sasUrl = uploadUrlResponse.data.sas_url;
      // Try to get filename from response, otherwise extract from SAS URL
      let filename = uploadUrlResponse.data.filename || uploadUrlResponse.data.file_name;

      if (!filename && sasUrl) {
        // Extract filename from SAS URL (blob name is typically in the path)
        try {
          const url = new URL(sasUrl);
          const pathParts = url.pathname.split('/').filter(Boolean);
          filename = pathParts[pathParts.length - 1]?.split('?')[0]; // Remove query params if present
        } catch (e) {
          console.warn("Could not extract filename from SAS URL:", e);
        }
      }

      if (!sasUrl) {
        throw new Error("No sas_url in response");
      }

      // Store upload metadata for later verification when user clicks "Process"
      if (filename) {
        setUploadedFilename(filename);
        setUploadedDurationSeconds(videoDurationSeconds);
      } else {
        setUploadedFilename(null);
        setUploadedDurationSeconds(null);
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      await new Promise<void>(async (resolve, reject) => {
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


        try {
          // ✅ Generate thumbnail BEFORE upload
          const thumbnail = await generateVideoThumbnail(file);
          // setThumbnailBlob(thumbnail.blob);
          setThumbnailUrl(thumbnail);
        } catch {
          toast.error(t("upload.toastThumbFailed"));
        }
      });

      // setUploadState("processing");

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
      // toast.success("Video Uploaded!", {
      //   description: `${mockShorts.length} shorts have been generated.`,
      // });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("upload.toastUploadFailedTitle"), {
        description:
          error instanceof Error
            ? error.message
            : t("upload.toastUploadFailedDescription"),
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
    setUploadedFilename(null);
    setUploadedDurationSeconds(null);
  };

  const handleProcessClick = async () => {
    if (!uploadedFilename || uploadedDurationSeconds == null) {
      toast.error(t("upload.toastCannotProcessTitle"), {
        description: t("upload.toastCannotProcessDescription"),
      });
      return;
    }

    try {
      await axiosInstance.post(
        `/videoInputOutput/verify-upload`,
        {
          blob_name: uploadedFilename,
          duration_seconds: uploadedDurationSeconds,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // Ensure cookies are sent
        }
      );
      toast.success(t("upload.toastVerifySuccessTitle"), {
        description: t("upload.toastVerifySuccessDescription"),
      });
      navigate("/dashboard?tab=in-progress");
    } catch (verifyError) {
      console.error("Verify upload error:", verifyError);
      toast.error(t("upload.toastVerifyFailedTitle"), {
        description: t("upload.toastVerifyFailedDescription"),
      });
    }
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
                {t("upload.idleTitle")}
              </h1>
              <p className="text-muted-foreground mb-8">
                {t("upload.idleSubtitle")}
              </p>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-12 md:p-24 transition-all duration-300 ${dragActive
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
                    {t("upload.dragDropTitle")}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {t("upload.dragDropSubtitle")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("upload.dragDropFormats")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("upload.dragDropLimits")}
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
                {t("upload.uploadingTitle")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {uploadState === "uploading"
                  ? `${t("upload.uploadingDescriptionPrefix")} ${selectedFile?.name}`
                  : t("upload.processingDescription")}
              </p>

              {uploadState === "uploading" && (
                <div className="space-y-2">
                  <Progress
                    value={uploadProgress}
                    className="h-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    {uploadProgress}%
                  </p>
                </div>
              )}
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
                    <h2 className="text-xl font-semibold">
                      {t("upload.completeHeaderTitle")}
                    </h2>
                    {/* <p className="text-muted-foreground">
                      {generatedShorts.length} shorts generated from your video
                    </p> */}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetUpload}>
                    <X className="w-4 h-4 mr-2" />
                    {t("upload.completeResetButton")}
                  </Button>
                  <Link to="/dashboard">
                    <Button variant="gradient">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      {t("upload.completeDashboardButton")}
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Original Video */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">
                    {t("upload.originalVideoTitle")}
                  </h3>
                  <div
                    className="aspect-video bg-muted rounded-xl flex items-center justify-center bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : undefined,
                    }}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mx-auto mb-3">
                        <Play className="w-8 h-8" />
                      </div>
                      <p className="text-muted-foreground">{selectedFile?.name}</p>
                    </div>
                  </div>
                  <div>
                    <Button
                      style={{ marginTop: "1rem" }}
                      className="text-lg"
                      variant="gradient"
                      onClick={handleProcessClick}
                    >
                      {t("upload.processButton")}
                    </Button>
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
