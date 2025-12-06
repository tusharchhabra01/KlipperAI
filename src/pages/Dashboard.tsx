import { Layout } from "@/components/layout/Layout";
import { VideoCard } from "@/components/VideoCard";
import { useVideos } from "@/contexts/VideoContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { Upload, Video, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { videos } = useVideos();
  const { isAuthenticated, isLoading } = useAuth();

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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">My Videos</h1>
            <p className="text-muted-foreground">
              {videos.length} video{videos.length !== 1 ? "s" : ""} uploaded
            </p>
          </div>
          <Link to="/upload">
            <Button variant="gradient" size="lg">
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </Link>
        </div>

        {/* Content */}
        {videos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No videos yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Upload your first video and let our AI create engaging shorts for you
            </p>
            <Link to="/upload">
              <Button variant="gradient" size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Upload Your First Video
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <VideoCard video={video} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
