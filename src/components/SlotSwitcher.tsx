import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/stores/useStudioStore";

interface SlotSwitcherProps {
  onChange?: (slot: 'left' | 'right') => void;
}

export const SlotSwitcher = ({ onChange }: SlotSwitcherProps) => {
  const { mode, activeSlot, setActiveSlot, leftPhotoDataUrl, rightPhotoDataUrl } = useStudioStore();
  
  if (mode !== 'landscape') return null;

  const handleSlotChange = (slot: 'left' | 'right') => {
    setActiveSlot(slot);
    onChange?.(slot);
  };
  
  return (
    <div className="flex items-center justify-center">
      {/* Mobile-first: stack buttons vertically on very small screens, horizontal on mobile+ */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSlotChange('left')}
          className={cn(
            "px-4 py-2 text-xs font-medium transition-all min-w-[4rem]",
            activeSlot === 'left' 
              ? "bg-background text-foreground shadow-sm" 
              : "hover:bg-background/50"
          )}
          disabled={!leftPhotoDataUrl}
        >
          Left
          {leftPhotoDataUrl && (
            <div className="ml-2 w-2 h-2 rounded-full bg-success" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSlotChange('right')}
          className={cn(
            "px-4 py-2 text-xs font-medium transition-all min-w-[4rem]",
            activeSlot === 'right' 
              ? "bg-background text-foreground shadow-sm" 
              : "hover:bg-background/50"
          )}
          disabled={!rightPhotoDataUrl}
        >
          Right
          {rightPhotoDataUrl && (
            <div className="ml-2 w-2 h-2 rounded-full bg-success" />
          )}
        </Button>
      </div>
    </div>
  );
};