import { useCallback, useEffect, useRef, useState } from 'react';
import { useStudioStore } from '@/stores/useStudioStore';
import { calculateSafeArea } from '@/lib/frameUtils';
import { calculateCoverFit, clampOffset } from '@/lib/frameDetection';
import { LEFT_SLOT, RIGHT_SAFE, PORTRAIT_FULL } from '@/lib/slotConstants';
import type { SafeRect } from '@/lib/frameDetection';

interface UseCanvasLogicProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  showMasks?: boolean;
  onPhotoDelete?: () => void;
  onPhotoRestore?: () => void;
}

export const useCanvasLogic = ({ canvasRef, showMasks = false, onPhotoDelete, onPhotoRestore }: UseCanvasLogicProps) => {
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
    setRightOffset,
    setPhotoDataUrl,
    setLeftPhotoDataUrl,
    setRightPhotoDataUrl
  } = useStudioStore();

  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState(1);

  // Image refs
  const photoImage = useRef<HTMLImageElement | null>(null);
  const leftPhotoImage = useRef<HTMLImageElement | null>(null);
  const rightPhotoImage = useRef<HTMLImageElement | null>(null);
  const frameImage = useRef<HTMLImageElement | null>(null);

  // Undo stack
  const undoStack = useRef<any[]>([]);

  // Load images
  useEffect(() => {
    if (photoDataUrl) {
      const img = new Image();
      img.onload = () => { photoImage.current = img; redraw(); };
      img.src = photoDataUrl;
    }
  }, [photoDataUrl]);

  useEffect(() => {
    if (leftPhotoDataUrl) {
      const img = new Image();
      img.onload = () => { leftPhotoImage.current = img; redraw(); };
      img.src = leftPhotoDataUrl;
    }
  }, [leftPhotoDataUrl]);

  useEffect(() => {
    if (rightPhotoDataUrl) {
      const img = new Image();
      img.onload = () => { rightPhotoImage.current = img; redraw(); };
      img.src = rightPhotoDataUrl;
    }
  }, [rightPhotoDataUrl]);

  useEffect(() => {
    if (frameSrc) {
      const img = new Image();
      img.onload = () => { frameImage.current = img; redraw(); };
      img.src = frameSrc;
    }
  }, [frameSrc]);

  const getCurrentSlotControls = () => {
    if (mode === 'portrait') {
      return { zoom, offset, setZoom, setOffset };
    }
    return activeSlot === 'left'
      ? { zoom: leftZoom, offset: leftOffset, setZoom: setLeftZoom, setOffset: setLeftOffset }
      : { zoom: rightZoom, offset: rightOffset, setZoom: setRightZoom, setOffset: setRightOffset };
  };

  const getCurrentSafeRect = () => {
    if (mode === 'portrait') return PORTRAIT_FULL;
    return activeSlot === 'left' ? LEFT_SLOT : RIGHT_SAFE;
  };

  const getCurrentImage = () => {
    if (mode === 'portrait') return photoImage.current;
    return activeSlot === 'left' ? leftPhotoImage.current : rightPhotoImage.current;
  };

  const drawPhotoInSlot = (
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    safeArea: SafeRect,
    slotZoom: number,
    slotOffset: { x: number; y: number }
  ) => {
    ctx.save();

    const { width: photoWidth, height: photoHeight } = calculateCoverFit(
      image.width, image.height, safeArea, slotZoom
    );

    const clampedOffset = clampOffset(slotOffset, photoWidth, photoHeight, safeArea);

    const photoX = safeArea.x + (safeArea.width  - photoWidth)  / 2 + clampedOffset.x;
    const photoY = safeArea.y + (safeArea.height - photoHeight) / 2 + clampedOffset.y;

    ctx.beginPath();
    ctx.rect(safeArea.x, safeArea.y, safeArea.width, safeArea.height);
    ctx.clip();

    ctx.drawImage(image, photoX, photoY, photoWidth, photoHeight);
    ctx.restore();
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (mode === 'portrait') {
      if (photoImage.current) {
        const safeArea = calculateSafeArea(rect.width, rect.height, PORTRAIT_FULL);
        drawPhotoInSlot(ctx, photoImage.current, safeArea, zoom, offset);
      }
    } else {
      if (leftPhotoImage.current) {
        const leftArea = calculateSafeArea(rect.width, rect.height, LEFT_SLOT);
        drawPhotoInSlot(ctx, leftPhotoImage.current, leftArea, leftZoom, leftOffset);
      }
      if (rightPhotoImage.current) {
        const rightArea = calculateSafeArea(rect.width, rect.height, RIGHT_SAFE);
        drawPhotoInSlot(ctx, rightPhotoImage.current, rightArea, rightZoom, rightOffset);
      }
    }

    if (frameImage.current) {
      ctx.drawImage(frameImage.current, 0, 0, rect.width, rect.height);
    }

    // Debug masks
    if (showMasks) {
      ctx.save();
      if (mode === 'portrait') {
        const r = calculateSafeArea(rect.width, rect.height, PORTRAIT_FULL);
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(r.x, r.y, r.width, r.height);
        ctx.globalAlpha = 1;
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(r.x, r.y, r.width, r.height);
        ctx.setLineDash([]);
      } else {
        const l = calculateSafeArea(rect.width, rect.height, LEFT_SLOT);
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(l.x, l.y, l.width, l.height);
        ctx.globalAlpha = 1;
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.strokeRect(l.x, l.y, l.width, l.height);
        ctx.setLineDash([]);

        const r = calculateSafeArea(rect.width, rect.height, RIGHT_SAFE);
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(r.x, r.y, r.width, r.height);
        ctx.globalAlpha = 1;
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.strokeRect(r.x, r.y, r.width, r.height);
        ctx.setLineDash([]);
      }
      ctx.restore();
    }
  }, [canvasRef, mode, zoom, offset, leftZoom, leftOffset, rightZoom, rightOffset, showMasks]);

  const handleDeleteCurrent = () => {
    if (mode === 'portrait') {
      if (!photoDataUrl) return;
      undoStack.current.push({
        mode: 'portrait', slot: 'single', dataUrl: photoDataUrl, zoom, offset
      });
      setPhotoDataUrl(undefined);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    } else {
      if (activeSlot === 'left') {
        if (!leftPhotoDataUrl) return;
        undoStack.current.push({
          mode: 'landscape', slot: 'left', dataUrl: leftPhotoDataUrl, zoom: leftZoom, offset: leftOffset
        });
        setLeftPhotoDataUrl(undefined);
        setLeftZoom(1);
        setLeftOffset({ x: 0, y: 0 });
      } else {
        if (!rightPhotoDataUrl) return;
        undoStack.current.push({
          mode: 'landscape', slot: 'right', dataUrl: rightPhotoDataUrl, zoom: rightZoom, offset: rightOffset
        });
        setRightPhotoDataUrl(undefined);
        setRightZoom(1);
        setRightOffset({ x: 0, y: 0 });
      }
    }
    onPhotoDelete?.();
  };

  const handleUndo = () => {
    const snap = undoStack.current.pop();
    if (!snap) return;
    if (snap.mode === 'portrait') {
      setPhotoDataUrl(snap.dataUrl);
      setZoom(snap.zoom);
      setOffset(snap.offset);
    } else {
      if (snap.slot === 'left') {
        setLeftPhotoDataUrl(snap.dataUrl);
        setLeftZoom(snap.zoom);
        setLeftOffset(snap.offset);
      } else {
        setRightPhotoDataUrl(snap.dataUrl);
        setRightZoom(snap.zoom);
        setRightOffset(snap.offset);
      }
    }
    onPhotoRestore?.();
  };

  useEffect(() => { redraw(); }, [redraw]);

  return {
    redraw,
    getCurrentSlotControls,
    getCurrentSafeRect,
    getCurrentImage,
    handleDeleteCurrent,
    handleUndo,
    canDelete: mode === 'portrait' ? !!photoDataUrl : (activeSlot === 'left' ? !!leftPhotoDataUrl : !!rightPhotoDataUrl),
    canUndo: undoStack.current.length > 0,
    isDragging,
    lastPointer,
    lastTouchDistance,
    setLastTouchDistance,
    initialZoom,
    setInitialZoom,
  };
};