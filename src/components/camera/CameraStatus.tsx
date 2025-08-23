interface CameraStatusProps {
  ready: boolean;
  error: string | null;
  hasPhoto: boolean;
  captureSlot: 'single' | 'left' | 'right' | 'complete';
}

export const CameraStatus = ({ ready, error, hasPhoto, captureSlot }: CameraStatusProps) => {
  if (!ready && !error) {
    return (
      <div className="text-center" role="status" aria-live="polite">
        <p className="text-muted-foreground">Initializing camera...</p>
      </div>
    );
  }

  if (ready && !hasPhoto) {
    return (
      <div className="text-center space-y-1" role="status" aria-live="polite">
        <p className="text-muted-foreground">
          {captureSlot === 'left' 
            ? 'Position yourself for the left side photo'
            : captureSlot === 'right'
            ? 'Position yourself within the dashed area'
            : 'Position yourself within the dashed area'}
        </p>
        <p className="text-xs text-muted-foreground">
          Press G to toggle grid • Enter/Space to capture
        </p>
      </div>
    );
  }

  if (hasPhoto) {
    return (
      <div className="text-center" role="status" aria-live="polite">
        <p className="text-success">
          {captureSlot === 'left' 
            ? 'Left side photo captured!' 
            : captureSlot === 'right'
            ? 'Right side photo captured!'
            : 'Photo captured successfully!'}
        </p>
      </div>
    );
  }

  return null;
};