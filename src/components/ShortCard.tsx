import { Short, useVideos } from "@/contexts/VideoContext";
import { Button } from "@/components/ui/button";
import { Play, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ShortCardProps {
  short: Short;
  videoId: string;
}

export function ShortCard({ short, videoId }: ShortCardProps) {
  const { deleteShort } = useVideos();

  const handleDownload = () => {
    toast.success("Download started!", {
      description: `Downloading "${short.title}"`,
    });
  };

  const handleDelete = () => {
    deleteShort(videoId, short.id);
    toast.success("Short deleted", {
      description: `"${short.title}" has been removed`,
    });
  };

  return (
    <div className="group relative rounded-xl overflow-hidden bg-muted aspect-[9/16]">
      <img
        src={short.thumbnail}
        alt={short.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      {/* Play Button */}
      <Button
        variant="glass"
        size="icon"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10"
      >
        <Play className="w-5 h-5" />
      </Button>

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <p className="text-xs font-medium line-clamp-2 mb-1">{short.title}</p>
        <p className="text-xs text-muted-foreground">{short.duration}</p>
      </div>

      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="glass"
          size="icon"
          className="w-7 h-7"
          onClick={handleDownload}
        >
          <Download className="w-3 h-3" />
        </Button>
        <Button
          variant="glass"
          size="icon"
          className="w-7 h-7 hover:bg-destructive/20"
          onClick={handleDelete}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
