import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

interface ToolbarZoomControlsProps {
  currentZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const ToolbarZoomControls = ({ currentZoom, onZoomIn, onZoomOut }: ToolbarZoomControlsProps) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onZoomOut}
        disabled={currentZoom <= 1}
        aria-label="Zoom out"
        title="Zoom out (-)"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <span className="text-sm text-muted-foreground min-w-[3rem] text-center px-2">
        {Math.round(currentZoom * 100)}%
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onZoomIn}
        disabled={currentZoom >= 3}
        aria-label="Zoom in"
        title="Zoom in (+)"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
    </div>
  );
};