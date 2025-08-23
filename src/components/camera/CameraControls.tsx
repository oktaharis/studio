import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Camera, RotateCcw, FlipHorizontal, Grid3X3, Upload } from "lucide-react";

interface CameraControlsProps {
  hasPhoto: boolean;
  ready: boolean;
  isCountingDown: boolean;
  showGrid: boolean;
  onCapture: () => void;
  onRetake: () => void;
  onToggleMirror: () => void;
  onToggleGrid: () => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CameraControls = ({ 
  hasPhoto, 
  ready, 
  isCountingDown, 
  showGrid,
  onCapture, 
  onRetake, 
  onToggleMirror, 
  onToggleGrid,
  onUpload 
}: CameraControlsProps) => {
  if (hasPhoto) {
    return (
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="lg"
          onClick={onRetake}
          className="px-6 sm:px-8"
          aria-label="Retake photo"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          <span className="hidden sm:inline">Retake Photo</span>
          <span className="sm:hidden">Retake</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
      <IconButton
        variant="outline"
        size="lg"
        onClick={onToggleMirror}
        disabled={!ready || isCountingDown}
        aria-label="Toggle camera mirror mode"
        title="Toggle mirror mode"
      >
        <FlipHorizontal className="h-5 w-5" />
      </IconButton>

      <IconButton
        variant="outline"
        size="lg"
        onClick={onToggleGrid}
        disabled={!ready || isCountingDown}
        aria-label={showGrid ? "Hide grid lines" : "Show grid lines"}
        title={showGrid ? "Hide grid" : "Show grid (G)"}
        className={showGrid ? "bg-primary/10 border-primary" : ""}
      >
        <Grid3X3 className="h-5 w-5" />
      </IconButton>

      <Button
        variant="gradient"
        size="lg"
        onClick={onCapture}
        disabled={!ready || isCountingDown}
        className="px-6 sm:px-8"
        aria-label={isCountingDown ? "Taking photo, please wait" : "Capture photo"}
      >
        <Camera className="mr-2 h-5 w-5" />
        <span className="hidden sm:inline">
          {isCountingDown ? 'Taking Photo...' : 'Capture'}
        </span>
        <span className="sm:hidden">
          {isCountingDown ? 'Wait...' : 'Capture'}
        </span>
      </Button>

      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload photo instead"
        />
        <Button variant="outline" size="lg" className="px-4 sm:px-6" title="Upload photo instead">
          <Upload className="mr-2 h-5 w-5" />
          <span className="hidden sm:inline">Upload</span>
        </Button>
      </div>
    </div>
  );
};