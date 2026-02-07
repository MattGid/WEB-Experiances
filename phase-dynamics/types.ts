
export enum ParticleType {
  EMPTY = 0,
  WALL = 1,
  ICE = 2,    // Solid Phase
  WATER = 3,  // Liquid Phase
  STEAM = 4,  // Gaseous Phase
  ACID = 5,   // Chemical: Acidic Liquid
  BASE = 6,   // Chemical: Basic Liquid
  SALT = 7,   // Chemical: Neutralized Solid
  IRON = 8,   // Magnetic: Ferromagnetic Dust
  GRAPHITE = 9, // Conductive: Electrical path
  GOLD = 10,    // Filtration: Heavy particle (Large)
  SILT = 11,    // Filtration: Light particle (Small)
  MEMBRANE = 12, // Filtration: Selective barrier
  CLAY = 13,    // Erosion: Soft strata
  GRANITE = 14, // Erosion: Hard strata
  GLASS = 15,   // Optics: Refractive medium
  MIRROR = 16,  // Optics: Reflective surface
  PHOTON = 17,  // Optics: Light particle
  COPPER = 18,  // Electricity: High conductor
  SILICON = 19, // Electricity: Semiconductor
  ELECTRON = 20, // Electricity: Flowing charge
  ISOTOPE = 21, // Nuclear: Radioactive particle
  LEAD = 22,    // Nuclear: Stable decay product
  NEUTRON = 23  // Nuclear: Fast-moving radiation
}

export interface Point {
  x: number;
  y: number;
}

export interface SimulationConfig {
  gravity: number;
  brushSize: number;
  globalTemp: number;
  pressure: number;
  latentHeatRatio: number;
  molecularMotion: number;
  trailIntensity: number;
  magneticPolarity: number; // 1 for N-S, -1 for S-N
  electricalConductivity: number; // Speed of charge propagation
  backgroundColor: string; // Hex color for the canvas background
}
