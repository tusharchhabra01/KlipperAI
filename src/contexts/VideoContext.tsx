import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Short {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  createdAt: Date;
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  uploadedAt: Date;
  status: "processing" | "completed" | "failed";
  shorts: Short[];
}

interface VideoContextType {
  videos: Video[];
  addVideo: (video: Video) => void;
  updateVideo: (id: string, updates: Partial<Video>) => void;
  deleteVideo: (id: string) => void;
  deleteShort: (videoId: string, shortId: string) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

// Mock data for demo
const mockVideos: Video[] = [
  {
    id: "1",
    title: "How to Build a Startup in 2024",
    thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=225&fit=crop",
    duration: "15:32",
    uploadedAt: new Date(Date.now() - 86400000 * 2),
    status: "completed",
    shorts: [
      {
        id: "s1",
        title: "The #1 Startup Mistake",
        duration: "0:45",
        thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=356&fit=crop",
        videoUrl: "",
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        id: "s2",
        title: "Finding Product-Market Fit",
        duration: "0:58",
        thumbnail: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=200&h=356&fit=crop",
        videoUrl: "",
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        id: "s3",
        title: "Raising Your First Round",
        duration: "1:02",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=356&fit=crop",
        videoUrl: "",
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
    ],
  },
  {
    id: "2",
    title: "Machine Learning Fundamentals",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=225&fit=crop",
    duration: "28:15",
    uploadedAt: new Date(Date.now() - 86400000 * 5),
    status: "completed",
    shorts: [
      {
        id: "s4",
        title: "What is Machine Learning?",
        duration: "0:52",
        thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=200&h=356&fit=crop",
        videoUrl: "",
        createdAt: new Date(Date.now() - 86400000 * 5),
      },
      {
        id: "s5",
        title: "Neural Networks Explained",
        duration: "1:15",
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&h=356&fit=crop",
        videoUrl: "",
        createdAt: new Date(Date.now() - 86400000 * 5),
      },
    ],
  },
];

export function VideoProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<Video[]>(mockVideos);

  const addVideo = (video: Video) => {
    setVideos((prev) => [video, ...prev]);
  };

  const updateVideo = (id: string, updates: Partial<Video>) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === id ? { ...video, ...updates } : video
      )
    );
  };

  const deleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((video) => video.id !== id));
  };

  const deleteShort = (videoId: string, shortId: string) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === videoId
          ? {
              ...video,
              shorts: video.shorts.filter((short) => short.id !== shortId),
            }
          : video
      )
    );
  };

  return (
    <VideoContext.Provider
      value={{ videos, addVideo, updateVideo, deleteVideo, deleteShort }}
    >
      {children}
    </VideoContext.Provider>
  );
}

export function useVideos() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error("useVideos must be used within a VideoProvider");
  }
  return context;
}
