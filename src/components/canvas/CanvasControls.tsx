import { IconButton } from "@/components/ui/icon-button";
import { Switch } from "@/components/ui/switch";
import { Trash2, Undo2 } from "lucide-react";

interface CanvasControlsProps {
  showMasks: boolean;
  onToggleMasks: (show: boolean) => void;
  canDelete: boolean;
  canUndo: boolean;
  onDelete: () => void;
  onUndo: () => void;
  currentZoom: number;
  activeSlot?: string;
  mode: 'portrait' | 'landscape';
}

export const CanvasControls = ({
  showMasks,
  onToggleMasks,
  canDelete,
  canUndo,
  onDelete,
  onUndo,
  currentZoom,
  activeSlot,
  mode
}: CanvasControlsProps) => {
  return (
    <>
      {/* Help Text Overlay */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/80 text-white text-xs px-3 py-2 rounded-md backdrop-blur-sm">
        <div className="hidden sm:block">
          Drag to move • Pinch/Scroll to zoom • 0 to reset
        </div>
        <div className="sm:hidden">Drag • Pinch zoom</div>
      </div>

      {/* Zoom Indicator */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/80 text-white text-xs px-3 py-2 rounded-md backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span>{Math.round(currentZoom * 100)}%</span>
          {mode === "landscape" && activeSlot && (
            <span className="text-muted-foreground">({activeSlot})</span>
          )}
        </div>
      </div>

      {/* Delete/Undo Controls */}
      <div className="absolute top-12 right-2 sm:top-16 sm:right-4 flex items-center gap-2">
        <IconButton
          aria-label="Delete current photo"
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={!canDelete}
          title="Delete current photo"
        >
          <Trash2 />
        </IconButton>
        <IconButton
          aria-label="Undo last delete"
          variant="secondary"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo last delete"
        >
          <Undo2 />
        </IconButton>
      </div>

      {/* Debug Toggle */}
      <div className="absolute bottom-12 right-2 sm:bottom-16 sm:right-4 flex items-center gap-2 bg-black/80 text-white text-xs px-3 py-2 rounded-md backdrop-blur-sm">
        <span>Show Slot Masks</span>
        <Switch checked={showMasks} onCheckedChange={onToggleMasks} />
      </div>

      {/* Keyboard Instructions (Desktop only) */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/80 text-white text-xs px-3 py-2 rounded-md backdrop-blur-sm hidden lg:block">
        ←→↑↓: Move • +/-: Zoom • 0: Reset
      </div>
    </>
  );
};