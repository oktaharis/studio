import { useRef, useState } from "react";
import { useStudioStore } from "@/stores/useStudioStore";
import { cn } from "@/lib/utils";
import { useCanvasLogic } from "@/hooks/useCanvasLogic";
import { useCanvasInteractions } from "./canvas/CanvasInteractions";
import { CanvasControls } from "./canvas/CanvasControls";
import { SlotSwitcher } from "./SlotSwitcher";

type CanvasComposerProps = { 
  className?: string;
  onPhotoChange?: () => void;
};

export default function CanvasComposer({ className = "", onPhotoChange }: CanvasComposerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showMasks, setShowMasks] = useState(false);
  
  const {
    mode,
    photoDataUrl,
    leftPhotoDataUrl,
    rightPhotoDataUrl,
    activeSlot,
    zoom,
    leftZoom,
    rightZoom,
  } = useStudioStore();

  const {
    getCurrentSlotControls,
    getCurrentSafeRect,
    getCurrentImage,
    handleDeleteCurrent,
    handleUndo,
    canDelete,
    canUndo,
    isDragging,
    lastPointer,
    lastTouchDistance,
    setLastTouchDistance,
    initialZoom,
    setInitialZoom,
  } = useCanvasLogic({ 
    canvasRef, 
    showMasks, 
    onPhotoDelete: onPhotoChange,
    onPhotoRestore: onPhotoChange 
  });

  const interactions = useCanvasInteractions({
    canvasRef,
    getCurrentSlotControls,
    getCurrentSafeRect,
    getCurrentImage,
    isDragging,
    lastPointer,
    lastTouchDistance,
    setLastTouchDistance,
    initialZoom,
    setInitialZoom,
  });

  // Mobile-first responsive classes
  const aspectClass = mode === "portrait" ? "aspect-[3/4]" : "aspect-[4/3]";
  const maxByViewport = mode === "portrait"
    ? "max-w-[min(100%,calc((100vh-16rem)*3/4))] max-h-[calc(100vh-16rem)]"
    : "max-w-[min(100%,calc((100vh-16rem)*4/3))] max-h-[calc(100vh-16rem)]";

  // Check if we have photos to display
  const hasPhotos = mode === "portrait" ? !!photoDataUrl : !!(leftPhotoDataUrl && rightPhotoDataUrl);

  if (!hasPhotos) {
    return (
      <div className="space-y-4">
        <SlotSwitcher />
        <div
          className={cn(
            "flex items-center justify-center bg-muted rounded-lg",
            aspectClass,
            maxByViewport,
            className
          )}
        >
          <p className="text-muted-foreground text-center px-4">
            {mode === "portrait"
              ? "No photo to edit"
              : "Capture both photos to start editing"}
          </p>
        </div>
      </div>
    );
  }

  // Get current zoom for display
  const getCurrentZoom = () => {
    if (mode === "portrait") return zoom;
    return activeSlot === "left" ? leftZoom : rightZoom;
  };

  return (
    <div className="space-y-4">
      {/* Slot Switcher for Landscape - Mobile stack, desktop inline */}
      <div className="block">
        <SlotSwitcher />
      </div>

      {/* Canvas Container - Mobile-first responsive */}
      <div
        className={cn(
          "relative mx-auto w-full",
          aspectClass,
          maxByViewport,
          "rounded-2xl overflow-hidden bg-black/5",
          className
        )}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block cursor-move active:cursor-grabbing"
          onPointerDown={interactions.handlePointerDown}
          onPointerMove={interactions.handlePointerMove}
          onPointerUp={interactions.handlePointerUp}
          onWheel={interactions.handleWheel}
          onTouchStart={interactions.handleTouchStart}
          onTouchMove={interactions.handleTouchMove}
          onTouchEnd={interactions.handleTouchEnd}
          onKeyDown={interactions.handleKeyDown}
          tabIndex={0}
          role="img"
          aria-label="Photo composition canvas. Use arrow keys to move, +/- to zoom, 0 to reset"
        />

        <CanvasControls
          showMasks={showMasks}
          onToggleMasks={setShowMasks}
          canDelete={canDelete}
          canUndo={canUndo}
          onDelete={handleDeleteCurrent}
          onUndo={handleUndo}
          currentZoom={getCurrentZoom()}
          activeSlot={activeSlot}
          mode={mode}
        />
      </div>
    </div>
  );
}