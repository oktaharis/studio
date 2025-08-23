import { useRef, useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useStudioStore } from '@/stores/useStudioStore';
import { CAMERA_OVERLAYS, RIGHT_SAFE } from '@/lib/slotConstants';

interface UseCameraLogicProps {
  captureSlot?: 'single' | 'left' | 'right' | 'complete';
  onCapture?: (dataUrl: string) => void;
  onRetake?: () => void;
}

export const useCameraLogic = ({ captureSlot = 'single', onCapture, onRetake }: UseCameraLogicProps) => {
  const { 
    mode, photoDataUrl, leftPhotoDataUrl, rightPhotoDataUrl, 
    setPhotoDataUrl, setLeftPhotoDataUrl, setRightPhotoDataUrl,
    setLeftZoom, setLeftOffset, setRightZoom, setRightOffset,
    setZoom, setOffset
  } = useStudioStore();

  const [showGrid, setShowGrid] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const cameraHook = useCamera();
  const { webcamRef, mirrored, startCountdown } = cameraHook;

  // Video rect utilities
  const getDisplayedVideoRect = (video: HTMLVideoElement, container: HTMLElement) => {
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    
    if (!vw || !vh) return { x: 0, y: 0, w: cw, h: ch, scale: 1 };

    const scale = Math.max(cw / vw, ch / vh);
    const w = vw * scale;
    const h = vh * scale;
    const x = (cw - w) / 2;
    const y = (ch - h) / 2;

    return { x, y, w, h, scale };
  };

  const safeToPx = (safe: typeof RIGHT_SAFE, cw: number, ch: number) => {
    return { x: safe.x * cw, y: safe.y * ch, w: safe.width * cw, h: safe.height * ch };
  };

  const containerPxToVideoPx = (
    pxRect: {x:number;y:number;w:number;h:number},
    displayed: {x:number;y:number;w:number;h:number;scale:number},
    mirrored: boolean,
    sourceW: number
  ) => {
    const u = (pxRect.x - displayed.x) / displayed.scale;
    const v = (pxRect.y - displayed.y) / displayed.scale;
    const sw = pxRect.w / displayed.scale;
    const sh = pxRect.h / displayed.scale;

    const sx = mirrored ? (sourceW - (u + sw)) : u;
    const sy = v;

    return { sx, sy, sw, sh };
  };

  const handleCapture = async () => {
    await startCountdown();

    const video = webcamRef.current?.video as HTMLVideoElement | undefined;
    const stage = stageRef.current as HTMLDivElement | undefined;
    if (!video) return;

    // Right slot: crop to RIGHT_SAFE area
    if (captureSlot === 'right') {
      if (!stage) return;

      const disp = getDisplayedVideoRect(video, stage);
      const srPx = safeToPx(RIGHT_SAFE, stage.clientWidth, stage.clientHeight);
      let { sx, sy, sw, sh } = containerPxToVideoPx(srPx, disp, mirrored, video.videoWidth);

      // Clamp to source dimensions
      const maxW = video.videoWidth, maxH = video.videoHeight;
      sx = Math.max(0, Math.min(sx, maxW));
      sy = Math.max(0, Math.min(sy, maxH));
      sw = Math.max(1, Math.min(sw, maxW - sx));
      sh = Math.max(1, Math.min(sh, maxH - sy));

      const out = document.createElement('canvas');
      out.width = Math.round(sw);
      out.height = Math.round(sh);
      const octx = out.getContext('2d')!;

      if (mirrored) {
        octx.translate(out.width, 0);
        octx.scale(-1, 1);
      }

      octx.drawImage(video, sx, sy, sw, sh, 0, 0, out.width, out.height);

      const dataUrl = out.toDataURL('image/jpeg', 0.92);
      setRightPhotoDataUrl(dataUrl);
      setRightZoom(1);
      setRightOffset({ x: 0, y: 0 });
      onCapture?.(dataUrl);
      return;
    }

    // Left/single slot: capture full frame
    const out = document.createElement('canvas');
    out.width = video.videoWidth;
    out.height = video.videoHeight;
    const octx = out.getContext('2d')!;

    if (mirrored) {
      octx.translate(out.width, 0);
      octx.scale(-1, 1);
    }

    octx.drawImage(video, 0, 0, out.width, out.height);
    const dataUrl = out.toDataURL('image/jpeg', 0.92);

    if (captureSlot === 'left') {
      setLeftPhotoDataUrl(dataUrl);
      setLeftZoom(1);
      setLeftOffset({ x: 0, y: 0 });
    } else {
      setPhotoDataUrl(dataUrl);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    }
    onCapture?.(dataUrl);
  };

  const handleRetake = () => {
    if (captureSlot === 'left') {
      setLeftPhotoDataUrl(undefined);
    } else if (captureSlot === 'right') {
      setRightPhotoDataUrl(undefined);
    } else {
      setPhotoDataUrl(undefined);
    }
    onRetake?.();
  };

  const handleUploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (captureSlot === 'left') {
          setLeftPhotoDataUrl(dataUrl);
        } else if (captureSlot === 'right') {
          setRightPhotoDataUrl(dataUrl);
        } else {
          setPhotoDataUrl(dataUrl);
        }
        onCapture?.(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentPhoto = () => {
    if (captureSlot === 'left') return leftPhotoDataUrl;
    if (captureSlot === 'right') return rightPhotoDataUrl;
    return photoDataUrl;
  };

  const getOverlayRect = () => {
    if (mode === 'portrait') return CAMERA_OVERLAYS.portrait;
    if (captureSlot === 'left') return CAMERA_OVERLAYS.left;
    return CAMERA_OVERLAYS.right;
  };

  return {
    ...cameraHook,
    stageRef,
    showGrid,
    setShowGrid,
    currentPhoto: getCurrentPhoto(),
    overlayRect: getOverlayRect(),
    handleCapture,
    handleRetake,
    handleUploadFile,
  };
};