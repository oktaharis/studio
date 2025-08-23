import { useCallback } from 'react';
import { calculateSafeArea } from '@/lib/frameUtils';
import { calculateCoverFit, clampOffset } from '@/lib/frameDetection';

interface CanvasInteractionsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  getCurrentSlotControls: () => any;
  getCurrentSafeRect: () => any;
  getCurrentImage: () => HTMLImageElement | null;
  isDragging: React.MutableRefObject<boolean>;
  lastPointer: React.MutableRefObject<{ x: number; y: number }>;
  lastTouchDistance: number | null;
  setLastTouchDistance: (distance: number | null) => void;
  initialZoom: number;
  setInitialZoom: (zoom: number) => void;
}

export const useCanvasInteractions = ({
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
}: CanvasInteractionsProps) => {
  
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;

    const currentSafeRect = getCurrentSafeRect();
    const currentImage = getCurrentImage();
    const { zoom: currentZoom, offset: currentOffset, setOffset: setCurrentOffset } = getCurrentSlotControls();
    if (!currentSafeRect || !currentImage) return;

    const deltaX = e.clientX - lastPointer.current.x;
    const deltaY = e.clientY - lastPointer.current.y;

    const newOffset = { x: currentOffset.x + deltaX, y: currentOffset.y + deltaY };

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const safeArea = calculateSafeArea(rect.width, rect.height, currentSafeRect);
      const { width: photoWidth, height: photoHeight } = calculateCoverFit(
        currentImage.width, currentImage.height, safeArea, currentZoom
      );
      const clampedOffset = clampOffset(newOffset, photoWidth, photoHeight, safeArea);
      setCurrentOffset(clampedOffset);
    } else {
      setCurrentOffset(newOffset);
    }

    lastPointer.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback(() => { 
    isDragging.current = false; 
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const { zoom: currentZoom, setZoom: setCurrentZoom } = getCurrentSlotControls();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(1, Math.min(3, currentZoom + delta));
    setCurrentZoom(newZoom);
  }, []);

  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return null;
    const t1 = touches[0], t2 = touches[1];
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const { zoom: currentZoom } = getCurrentSlotControls();

    if (e.touches.length === 1) {
      isDragging.current = true;
      lastPointer.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      isDragging.current = false;
      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);
      setInitialZoom(currentZoom);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();

    const currentSafeRect = getCurrentSafeRect();
    const currentImage = getCurrentImage();
    const { zoom: currentZoom, offset: currentOffset, setOffset: setCurrentOffset, setZoom: setCurrentZoom } = getCurrentSlotControls();

    if (e.touches.length === 1 && isDragging.current && currentSafeRect && currentImage) {
      const deltaX = e.touches[0].clientX - lastPointer.current.x;
      const deltaY = e.touches[0].clientY - lastPointer.current.y;

      const newOffset = { x: currentOffset.x + deltaX, y: currentOffset.y + deltaY };

      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const safeArea = calculateSafeArea(rect.width, rect.height, currentSafeRect);
        const { width: photoWidth, height: photoHeight } = calculateCoverFit(
          currentImage.width, currentImage.height, safeArea, currentZoom
        );
        const clampedOffset = clampOffset(newOffset, photoWidth, photoHeight, safeArea);
        setCurrentOffset(clampedOffset);
      } else {
        setCurrentOffset(newOffset);
      }

      lastPointer.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && lastTouchDistance) {
      const currentDistance = getTouchDistance(e.touches);
      if (currentDistance) {
        const scaleChange = currentDistance / lastTouchDistance;
        const newZoom = Math.max(1, Math.min(3, initialZoom * scaleChange));
        setCurrentZoom(newZoom);
      }
    }
  }, [lastTouchDistance, initialZoom]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    setLastTouchDistance(null);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentSafeRect = getCurrentSafeRect();
    const currentImage = getCurrentImage();
    const { zoom: currentZoom, offset: currentOffset, setZoom: setCurrentZoom, setOffset: setCurrentOffset } = getCurrentSlotControls();
    if (!currentSafeRect || !currentImage) return;

    const step = 10;
    const zoomStep = 0.1;

    const move = (dx = 0, dy = 0) => {
      const newOffset = { x: currentOffset.x + dx, y: currentOffset.y + dy };
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const safeArea = calculateSafeArea(rect.width, rect.height, currentSafeRect);
        const { width: photoWidth, height: photoHeight } = calculateCoverFit(
          currentImage.width, currentImage.height, safeArea, currentZoom
        );
        setCurrentOffset(clampOffset(newOffset, photoWidth, photoHeight, safeArea));
      } else {
        setCurrentOffset(newOffset);
      }
    };

    switch (e.key) {
      case 'ArrowLeft':  e.preventDefault(); move(-step, 0); break;
      case 'ArrowRight': e.preventDefault(); move(+step, 0); break;
      case 'ArrowUp':    e.preventDefault(); move(0, -step); break;
      case 'ArrowDown':  e.preventDefault(); move(0, +step); break;
      case '+':
      case '=': e.preventDefault(); setCurrentZoom(Math.min(3, currentZoom + zoomStep)); break;
      case '-': e.preventDefault(); setCurrentZoom(Math.max(1, currentZoom - zoomStep)); break;
      case '0': e.preventDefault(); setCurrentOffset({ x: 0, y: 0 }); setCurrentZoom(1); break;
    }
  }, []);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleKeyDown,
  };
};