import { FRAME_ASSETS } from "@/lib/assets";
import { useStudioStore } from "@/stores/useStudioStore";
import { useNavigate } from "react-router-dom";
import { FrameCard } from "./frame/FrameCard";

interface FramePickerProps {
  onFrameSelect?: (frameId: string) => void;
}

const FramePicker = ({ onFrameSelect }: FramePickerProps) => {
  const navigate = useNavigate();
  const { 
    setMode, 
    setFrameSrc, 
    setPhotoDataUrl, 
    setLeftPhotoDataUrl, 
    setRightPhotoDataUrl 
  } = useStudioStore();

  const handleFrameSelect = (frameId: string) => {
    const frame = FRAME_ASSETS.find(f => f.id === frameId);
    if (!frame) return;

    // Set frame & mode
    setMode(frame.mode);
    setFrameSrc(frame.src);

    // Reset photos for clean start
    setPhotoDataUrl(undefined);
    setLeftPhotoDataUrl(undefined);
    setRightPhotoDataUrl(undefined);

    // Call callback if provided
    onFrameSelect?.(frameId);

    // Navigate to studio
    navigate("/studio");
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Mobile-first: single column on mobile, grid on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
        {FRAME_ASSETS.map((frame) => (
          <FrameCard 
            key={frame.id} 
            frame={frame} 
            onSelect={handleFrameSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default FramePicker;