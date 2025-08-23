import { Button } from "@/components/ui/button";
import { Toolbar, ToolbarItem, ToolbarSeparator } from "@/components/ui/toolbar";
import { ArrowLeft, RotateCcw, Download, Smartphone } from "lucide-react";
import { useStudioStore } from "@/stores/useStudioStore";
import { exportImage } from "@/lib/exportImage";
import { toast } from "@/hooks/use-toast";
import { ToolbarZoomControls } from "./toolbar/ToolbarZoomControls";

interface StudioToolbarProps {
  onBack?: () => void;
  onSave?: () => void;
}

export const StudioToolbar = ({ onBack, onSave }: StudioToolbarProps) => {
  const { 
    mode, 
    frameSrc, 
    photoDataUrl, 
    leftPhotoDataUrl, 
    rightPhotoDataUrl, 
    activeSlot,
    zoom, 
    offset, 
    leftZoom, 
    leftOffset, 
    rightZoom, 
    rightOffset,
    setZoom, 
    setOffset,
    setLeftZoom,
    setLeftOffset,
    setRightZoom,
    setRightOffset
  } = useStudioStore();

  // Get current slot controls
  const getCurrentControls = () => {
    if (mode === 'portrait') {
      return { zoom, offset, setZoom, setOffset };
    } else {
      return activeSlot === 'left'
        ? { zoom: leftZoom, offset: leftOffset, setZoom: setLeftZoom, setOffset: setLeftOffset }
        : { zoom: rightZoom, offset: rightOffset, setZoom: setRightZoom, setOffset: setRightOffset };
    }
  };

  const { zoom: currentZoom, offset: currentOffset, setZoom: setCurrentZoom, setOffset: setCurrentOffset } = getCurrentControls();

  const handleZoomIn = () => {
    setCurrentZoom(Math.min(3, currentZoom + 0.1));
  };

  const handleZoomOut = () => {
    setCurrentZoom(Math.max(1, currentZoom - 0.1));
  };

  const handleReset = () => {
    setCurrentOffset({ x: 0, y: 0 });
    setCurrentZoom(1);
  };

  const handleSave = async () => {
    const hasPhotos = mode === 'portrait' ? !!photoDataUrl : !!(leftPhotoDataUrl && rightPhotoDataUrl);
    
    if (!hasPhotos || !frameSrc) {
      toast({
        title: "Error",
        description: mode === 'portrait' ? "No photo or frame selected" : "Both photos and frame must be selected",
        variant: "destructive",
      });
      return;
    }

    try {
      if (mode === 'portrait') {
        await exportImage(photoDataUrl!, frameSrc, mode, zoom, offset, {
          format: 'png',
          quality: 0.9
        });
      } else {
        await exportImage(rightPhotoDataUrl!, frameSrc, mode, rightZoom, rightOffset, {
          format: 'png',
          quality: 0.9,
          leftPhoto: leftPhotoDataUrl!,
          leftZoom,
          leftOffset
        });
      }
      
      toast({
        title: "Saved!",
        description: "Your photo has been downloaded successfully",
        variant: "default",
      });

      onSave?.();
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to save your photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onBack?.();
    }
  };

  return (
    <div className="bg-background/95 backdrop-blur-sm border shadow-md rounded-lg">
      {/* Mobile-first: stack controls vertically on small screens */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3">
        {/* Back button - always visible */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="shrink-0 justify-start sm:justify-center"
          aria-label="Go back to previous step"
        >
          <ArrowLeft className="h-4 w-4 sm:mr-2" />
          <span className="sm:hidden ml-2">Back</span>
          <span className="hidden sm:inline">Back</span>
        </Button>
        
        <div className="hidden sm:block w-px h-6 bg-border" />
        
        {/* Zoom controls */}
        <ToolbarZoomControls
          currentZoom={currentZoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
        
        <div className="hidden sm:block w-px h-6 bg-border" />
        
        {/* Reset button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReset}
          aria-label="Reset position and zoom"
          title="Reset (0)"
          className="justify-start sm:justify-center"
        >
          <RotateCcw className="h-4 w-4 sm:mr-2" />
          <span className="sm:hidden ml-2">Reset</span>
          <span className="hidden sm:inline">Reset</span>
        </Button>
        
        <div className="hidden sm:block w-px h-6 bg-border" />
        
        {/* Save button */}
        <Button 
          variant="gradient" 
          size="sm" 
          onClick={handleSave}
          aria-label="Save and download photo"
          className="shrink-0 justify-start sm:justify-center"
        >
          <Download className="h-4 w-4 sm:mr-2" />
          <span className="sm:hidden ml-2">Save Photo</span>
          <span className="hidden sm:inline">Save</span>
        </Button>

        {/* Mobile indicator */}
        <div className="sm:hidden flex items-center justify-center text-xs text-muted-foreground py-1">
          <Smartphone className="h-3 w-3 mr-1" />
          Mobile View
        </div>
      </div>
    </div>
  );
};