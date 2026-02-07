
export const GRID_WIDTH = 450;
export const GRID_HEIGHT = 320;
export const CANVAS_SCALE = 2;

export const PHASE_COLORS: Record<number, string> = {
  0: '#000000', // Empty
  1: '#333333', // Wall
  2: '#B2EBF2', // Ice
  3: '#03A9F4', // Water
  4: '#CFD8DC', // Steam
  5: '#FF1744', // Acid
  6: '#3D5AFE', // Base
  7: '#FFFFFF', // Salt
  8: '#78909C', // Iron
  9: '#263238', // Graphite
  10: '#FFD700', // Gold
  11: '#D7CCC8', // Silt
  12: '#546E7A', // Membrane
  13: '#A1887F', // Clay
  14: '#424242', // Granite
  15: 'rgba(129, 212, 250, 0.3)', // Glass
  16: '#B0BEC5', // Mirror
  17: '#FFFFFF', // Photon
  18: '#B87333', // Copper (Metallic Brown)
  19: '#4A4A4A', // Silicon (Dark Gray)
  20: '#FFFF00', // Electron (Bright Yellow)
  21: '#4AF626', // Isotope (Bright Green)
  22: '#546E7A', // Lead (Grey Blue)
  23: '#FFFC00', // Neutron (Bright Yellow/White)
};

export const GLOW_COLORS: Record<number, string> = {
  4: 'rgba(207, 216, 220, 0.3)',
  5: 'rgba(255, 23, 68, 0.5)',
  6: 'rgba(61, 90, 254, 0.5)',
  7: 'rgba(255, 255, 255, 0.4)',
  8: 'rgba(144, 164, 174, 0.2)',
  9: 'rgba(255, 235, 59, 0.8)',
  10: 'rgba(255, 215, 0, 0.5)',
  17: 'rgba(255, 255, 255, 0.8)',
  20: 'rgba(255, 255, 0, 0.9)',
  21: 'rgba(74, 246, 38, 0.5)', // Isotope glow
  23: 'rgba(255, 252, 0, 0.8)', // Neutron glow
};

export const INITIAL_CONFIG = {
  gravity: 0.8,
  brushSize: 12,
  globalTemp: 20,
  pressure: 1.0,
  latentHeatRatio: 0.05,
  molecularMotion: 1.2,
  trailIntensity: 1.15,
  magneticPolarity: 1,
  electricalConductivity: 0.85,
  backgroundColor: '#0d1117'
};
