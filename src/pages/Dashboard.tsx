import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { VideoCard } from "@/components/VideoCard";
import { useVideos } from "@/contexts/VideoContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Upload, Video, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { t } from "@/i18n";

export default function Dashboard() {
  const { videos, fetchVideos, isLoadingVideos, fetchError } = useVideos();
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialTab =
    searchParams.get("tab") === "in-progress" ? "in-progress" : "my-videos";

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isAuthenticated) {
      const isCompleted = activeTab === "my-videos";
      fetchVideos(isCompleted);
    }
  }, [isAuthenticated, activeTab, fetchVideos]);

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground">
              {isLoadingVideos
                ? t("dashboard.loadingLabel")
                : videos.length === 1
                  ? t("dashboard.videoCountOne").replace("{{count}}", String(videos.length))
                  : t("dashboard.videoCountMany").replace("{{count}}", String(videos.length))}
            </p>
          </div>
          <Link to="/upload">
            <Button variant="gradient" size="lg">
              <Upload className="w-4 h-4 mr-2" />
              {t("dashboard.uploadButton")}
            </Button>
          </Link>
        </div>

        {fetchError && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            {fetchError}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-11 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="my-videos" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {t("dashboard.tabMyVideos")} ({activeTab === "my-videos" ? videos.length : "—"})
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {t("dashboard.tabInProgress")}
              {activeTab === "in-progress" && videos.length > 0 && (
                <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                  {videos.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-videos" className="mt-0">
            {isLoadingVideos ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : videos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-24"
              >
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                  <Video className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  {t("dashboard.myVideosEmptyTitle")}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {t("dashboard.myVideosEmptyDescription")}
                </p>
                <Link to="/upload">
                  <Button variant="gradient" size="lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t("dashboard.myVideosEmptyCta")}
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
                    <VideoCard video={video} statusLabel="Completed" />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in-progress" className="mt-0">
            {isLoadingVideos ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : videos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-24"
              >
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  {t("dashboard.inProgressEmptyTitle")}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {t("dashboard.inProgressEmptyDescription")}
                </p>
                <Link to="/upload">
                  <Button variant="gradient" size="lg">
                    <Upload className="w-4 h-4 mr-2" />
                    {t("dashboard.inProgressEmptyCta")}
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
                    <VideoCard video={video} statusLabel="In Progress" />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
