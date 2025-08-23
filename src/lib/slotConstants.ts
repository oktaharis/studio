/**
 * Slot constants for photo positioning
 * All coordinates are normalized (0-1) relative to frame dimensions
 */

export interface SlotRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Landscape slots
export const LEFT_SLOT: SlotRect = { 
  x: 0.0, 
  y: 0.0, 
  width: 0.5, 
  height: 1.0 
};

export const RIGHT_SAFE: SlotRect = { 
  x: 0.575, 
  y: 0.06, 
  width: 0.40, 
  height: 0.84 
};

// Portrait slot
export const PORTRAIT_FULL: SlotRect = { 
  x: 0.0, 
  y: 0.0, 
  width: 1.0, 
  height: 1.0 
};

// Camera overlay guides
export const CAMERA_OVERLAYS = {
  portrait: { x: 0.09, y: 0.08, width: 0.82, height: 0.78 },
  left: LEFT_SLOT,
  right: RIGHT_SAFE,
} as const;