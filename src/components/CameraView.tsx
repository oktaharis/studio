import Webcam from 'react-webcam';
import { cn } from '@/lib/utils';
import { useCameraLogic } from '@/hooks/useCameraLogic';
import { CameraControls } from './camera/CameraControls';
import { CameraStatus } from './camera/CameraStatus';
import { CameraDeviceSelector } from './camera/CameraDeviceSelector';

interface CameraViewProps {
  onCapture?: (dataUrl: string) => void;
  onRetake?: () => void;
  className?: string;
  captureSlot?: 'single' | 'left' | 'right' | 'complete';
}

const CameraView = ({ onCapture, onRetake, className = '', captureSlot = 'single' }: CameraViewProps) => {
  const {
    ready,
    error,
    mirrored,
    toggleMirror,
    webcamRef,
    isCountingDown,
    countdown,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    stageRef,
    showGrid,
    setShowGrid,
    currentPhoto,
    overlayRect,
    handleCapture,
    handleRetake,
    handleUploadFile,
  } = useCameraLogic({ captureSlot, onCapture, onRetake });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!currentPhoto && ready && !isCountingDown) handleCapture();
      else if (currentPhoto) handleRetake();
    }
    if (e.key === 'g' || e.key === 'G') setShowGrid((v) => !v);
  };

  return (
    <div className={cn("relative w-full h-full bg-background", className)} onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Camera Stage */}
      <div
        ref={stageRef}
        className="relative w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden"
      >
        {!currentPhoto ? (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              muted
              playsInline
              screenshotFormat="image/jpeg"
              videoConstraints={{
                deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                facingMode: "user",
                width: { ideal: 1280 },
                height: { ideal: 720 },
              }}
              className="w-full h-full object-cover"
              mirrored={mirrored}
            />

            {/* Overlay Guide */}
            {ready && overlayRect && (
              <div
                className="absolute border-2 border-primary border-dashed opacity-50 pointer-events-none"
                style={{
                  left: `${overlayRect.x * 100}%`,
                  top: `${overlayRect.y * 100}%`,
                  width: `${overlayRect.width * 100}%`,
                  height: `${overlayRect.height * 100}%`,
                  boxSizing: 'border-box',
                }}
                aria-hidden="true"
              />
            )}

            {/* Grid Overlay */}
            {showGrid && ready && (
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute left-1/3 top-0 w-px h-full bg-white/30" />
                <div className="absolute left-2/3 top-0 w-px h-full bg-white/30" />
                <div className="absolute top-1/3 left-0 h-px w-full bg-white/30" />
                <div className="absolute top-2/3 left-0 h-px w-full bg-white/30" />
              </div>
            )}

            {/* Countdown Overlay */}
            {isCountingDown && countdown > 0 && (
              <div 
                className="absolute inset-0 bg-black/50 flex items-center justify-center"
                role="alert"
                aria-live="assertive"
              >
                <div className="text-6xl font-bold text-white animate-pulse">
                  {countdown}
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {error && (
              <div 
                className="absolute inset-0 bg-destructive/10 flex items-center justify-center"
                role="alert"
                aria-live="polite"
              >
                <div className="text-destructive text-center p-4">
                  <p className="font-semibold mb-2">Camera Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <img
            src={currentPhoto}
            alt={`Captured photo preview${captureSlot !== 'single' ? ` (${captureSlot} side)` : ''}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Mobile-first responsive layout */}
      <div className="space-y-4 mt-4">
        {/* Device Selector */}
        <CameraDeviceSelector
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          onDeviceChange={setSelectedDeviceId}
          show={!currentPhoto}
        />

        {/* Controls */}
        <CameraControls
          hasPhoto={!!currentPhoto}
          ready={ready}
          isCountingDown={isCountingDown}
          showGrid={showGrid}
          onCapture={handleCapture}
          onRetake={handleRetake}
          onToggleMirror={toggleMirror}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onUpload={handleUploadFile}
        />

        {/* Status */}
        <CameraStatus
          ready={ready}
          error={error}
          hasPhoto={!!currentPhoto}
          captureSlot={captureSlot}
        />
      </div>
    </div>
  );
};

export default CameraView;