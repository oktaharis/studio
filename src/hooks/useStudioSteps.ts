import { useStudioStore } from '@/stores/useStudioStore';

export const useStudioSteps = () => {
  const { mode, frameSrc, photoDataUrl, leftPhotoDataUrl, rightPhotoDataUrl } = useStudioStore();

  const getCurrentStep = () => {
    if (!frameSrc) return 1;
    
    if (mode === 'portrait') {
      if (!photoDataUrl) return 2;
      return 3;
    } else {
      // Landscape mode - need both photos
      if (!rightPhotoDataUrl) return 2; // First capture for right slot
      if (!leftPhotoDataUrl) return 2; // Second capture for left slot
      return 3;
    }
  };

  const getCurrentCaptureSlot = () => {
    if (mode === 'portrait') return 'single';
    if (!rightPhotoDataUrl) return 'right';
    if (!leftPhotoDataUrl) return 'left';
    return 'complete';
  };

  const isStepComplete = (step: number) => {
    const currentStep = getCurrentStep();
    return step < currentStep;
  };

  const isStepActive = (step: number) => {
    return step === getCurrentStep();
  };

  return {
    currentStep: getCurrentStep(),
    captureSlot: getCurrentCaptureSlot(),
    isStepComplete,
    isStepActive,
  };
};