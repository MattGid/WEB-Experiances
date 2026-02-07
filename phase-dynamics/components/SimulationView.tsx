
import React, { useRef, useEffect, useState } from 'react';
import { SimulationEngine } from '../engine/SimulationEngine';
import { GRID_WIDTH, GRID_HEIGHT, CANVAS_SCALE, PHASE_COLORS, GLOW_COLORS } from '../constants';
import { SimulationConfig, ParticleType, Point } from '../types';
import { sounds } from '../utils/SoundEngine';

interface SimulationViewProps {
  config: SimulationConfig;
  isSimulating: boolean;
  activeTool: 'ice' | 'heat' | 'cold' | 'pressure' | 'eraser' | 'wall' | 'acid' | 'base' | 'neutralize' | 'iron' | 'magnet' | 'graphite' | 'power' | 'gold' | 'silt' | 'membrane' | 'water' | 'clay' | 'granite' | 'glass' | 'mirror' | 'photon' | 'copper' | 'silicon' | 'electron' | 'salt' | 'isotope' | 'lead' | 'neutron' | 'radiation';
  onCountsUpdate?: (counts: { isotope: number, lead: number, water: number, salt: number }) => void;
}

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const SimulationView: React.FC<SimulationViewProps> = ({ config, isSimulating, activeTool, onCountsUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<SimulationEngine>(new SimulationEngine());
  const [activePointers, setActivePointers] = useState<Map<number, Point>>(new Map());

  const stateRef = useRef({ isSimulating, config, activeTool, frameCount: 0 });

  useEffect(() => {
    stateRef.current.isSimulating = isSimulating;
    stateRef.current.config = config;
    stateRef.current.activeTool = activeTool;
  }, [isSimulating, config, activeTool]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); if (!ctx) return;
    
    if (!trailCanvasRef.current) {
      const tc = document.createElement('canvas');
      tc.width = GRID_WIDTH * CANVAS_SCALE; tc.height = GRID_HEIGHT * CANVAS_SCALE;
      trailCanvasRef.current = tc;
    }
    const tCtx = trailCanvasRef.current.getContext('2d', { alpha: true });

    if (!glowCanvasRef.current) {
      const gc = document.createElement('canvas');
      gc.width = (GRID_WIDTH * CANVAS_SCALE) / 4; gc.height = (GRID_HEIGHT * CANVAS_SCALE) / 4;
      glowCanvasRef.current = gc;
    }
    const gCtx = glowCanvasRef.current.getContext('2d', { alpha: true });

    let animationId: number;
    const render = () => {
      const { isSimulating: active, config: currConfig, activeTool: currTool } = stateRef.current;
      stateRef.current.frameCount++;
      const time = stateRef.current.frameCount;

      engineRef.current.update(currConfig, active);
      
      if (time % 30 === 0 && onCountsUpdate) {
        onCountsUpdate(engineRef.current.getCounts());
      }

      tCtx!.globalCompositeOperation = 'source-over';
      const isBeam = ['photon', 'electron', 'neutron'].includes(currTool);
      const trailAlpha = isBeam ? 0.08 : Math.max(0.1, 1.3 - currConfig.trailIntensity);
      
      tCtx!.fillStyle = hexToRgba(currConfig.backgroundColor, trailAlpha);
      tCtx!.fillRect(0, 0, GRID_WIDTH * CANVAS_SCALE, GRID_HEIGHT * CANVAS_SCALE);
      
      gCtx!.clearRect(0, 0, glowCanvasRef.current!.width, glowCanvasRef.current!.height);

      const grid = engineRef.current.getGrid(); 
      const charges = engineRef.current.getChargeGrid();
      const glowScale = 0.25;

      for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          const idx = y * GRID_WIDTH + x;
          const val = grid[idx];
          if (val === 0) continue;

          const charge = charges[idx];

          if (charge > 0.1) {
            const r = val === ParticleType.COPPER ? 184 : 100;
            const g = val === ParticleType.COPPER ? 115 : 100;
            const b = val === ParticleType.COPPER ? 51 : 255;
            tCtx!.fillStyle = `rgb(${r + 71 * charge}, ${g + 140 * charge}, ${b + 204 * charge})`;
            gCtx!.fillStyle = 'rgba(255, 235, 59, 0.4)';
            gCtx!.fillRect(x * CANVAS_SCALE * glowScale, y * CANVAS_SCALE * glowScale, CANVAS_SCALE * glowScale * 3, CANVAS_SCALE * glowScale * 3);
          } else if (val === ParticleType.MEMBRANE) {
            tCtx!.fillStyle = (x + y) % 4 === 0 ? '#37474F' : '#546E7A';
          } else if (val === ParticleType.CLAY) {
            tCtx!.fillStyle = (x * 7 + y * 3) % 11 < 4 ? '#8D6E63' : '#A1887F';
          } else if (val === ParticleType.GRANITE) {
            tCtx!.fillStyle = (x * 13 + y * 5) % 7 === 0 ? '#616161' : '#424242';
          } else if (val === ParticleType.GLASS) {
            tCtx!.fillStyle = 'rgba(129, 212, 250, 0.4)';
          } else if (val === ParticleType.PHOTON || val === ParticleType.NEUTRON) {
            tCtx!.fillStyle = val === ParticleType.PHOTON ? '#FFFFFF' : '#FFFC00';
            gCtx!.fillStyle = GLOW_COLORS[val];
            gCtx!.fillRect(x * CANVAS_SCALE * glowScale, y * CANVAS_SCALE * glowScale, CANVAS_SCALE * glowScale * 2, CANVAS_SCALE * glowScale * 2);
          } else if (val === ParticleType.ELECTRON) {
            tCtx!.fillStyle = '#FFFF00';
            gCtx!.fillStyle = GLOW_COLORS[20];
            gCtx!.fillRect(x * CANVAS_SCALE * glowScale, y * CANVAS_SCALE * glowScale, CANVAS_SCALE * glowScale * 2, CANVAS_SCALE * glowScale * 2);
          } else if (val === ParticleType.GOLD) {
            const luster = Math.sin(time * 0.15 + x * 0.3) > 0.85 ? '#FFEB3B' : '#FFD700';
            tCtx!.fillStyle = luster;
          } else if (val === ParticleType.ISOTOPE) {
            const activity = Math.sin(time * 0.05 + idx * 0.1) > 0.9 ? '#69F0AE' : '#4AF626';
            tCtx!.fillStyle = activity;
          } else {
            tCtx!.fillStyle = PHASE_COLORS[val];
          }

          tCtx!.fillRect(x * CANVAS_SCALE, y * CANVAS_SCALE, CANVAS_SCALE, CANVAS_SCALE);
          if (GLOW_COLORS[val] && !charge && val !== ParticleType.PHOTON && val !== ParticleType.ELECTRON && val !== ParticleType.NEUTRON) {
            gCtx!.fillStyle = GLOW_COLORS[val];
            gCtx!.fillRect(x * CANVAS_SCALE * glowScale, y * CANVAS_SCALE * glowScale, CANVAS_SCALE * glowScale * 2, CANVAS_SCALE * glowScale * 2);
          }
        }
      }
      
      ctx.fillStyle = currConfig.backgroundColor;
      ctx.fillRect(0, 0, GRID_WIDTH * CANVAS_SCALE, GRID_HEIGHT * CANVAS_SCALE);
      ctx.drawImage(trailCanvasRef.current!, 0, 0);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.filter = 'blur(6px)';
      ctx.drawImage(glowCanvasRef.current!, 0, 0, GRID_WIDTH * CANVAS_SCALE, GRID_HEIGHT * CANVAS_SCALE);
      ctx.restore();

      animationId = requestAnimationFrame(render);
    };
    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [activePointers]);

  const getCoords = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return {x:0, y:0};
    return { 
      x: (e.clientX - rect.left) / (rect.width / GRID_WIDTH), 
      y: (e.clientY - rect.top) / (rect.height / GRID_HEIGHT) 
    };
  };

  const applyTool = (x: number, y: number) => {
    const { activeTool, config } = stateRef.current;
    if (activeTool === 'magnet') { engineRef.current.setMagnet(x, y); return; }
    else engineRef.current.setMagnet(0, null);

    if (activeTool === 'power') { engineRef.current.applyThermodynamics(x, y, config.brushSize, 'power'); return; }
    if (activeTool === 'radiation') { engineRef.current.applyThermodynamics(x, y, config.brushSize, 'radiation'); return; }

    const r = config.brushSize;
    const floorX = Math.floor(x), floorY = Math.floor(y);

    const particleTools: Record<string, number> = {
      ice: ParticleType.ICE,
      acid: ParticleType.ACID,
      base: ParticleType.BASE,
      iron: ParticleType.IRON,
      graphite: ParticleType.GRAPHITE,
      gold: ParticleType.GOLD,
      silt: ParticleType.SILT,
      membrane: ParticleType.MEMBRANE,
      water: ParticleType.WATER,
      clay: ParticleType.CLAY,
      granite: ParticleType.GRANITE,
      glass: ParticleType.GLASS,
      mirror: ParticleType.MIRROR,
      photon: ParticleType.PHOTON,
      copper: ParticleType.COPPER,
      silicon: ParticleType.SILICON,
      electron: ParticleType.ELECTRON,
      salt: ParticleType.SALT,
      isotope: ParticleType.ISOTOPE,
      lead: ParticleType.LEAD,
      neutron: ParticleType.NEUTRON,
      wall: ParticleType.WALL,
      eraser: ParticleType.EMPTY
    };

    if (activeTool in particleTools) {
      const type = particleTools[activeTool];
      const isStatic = [
        ParticleType.WALL, ParticleType.MEMBRANE, ParticleType.EMPTY, 
        ParticleType.CLAY, ParticleType.GRANITE, ParticleType.GLASS, 
        ParticleType.MIRROR, ParticleType.COPPER, ParticleType.SILICON
      ].includes(type);

      const isBeam = [ParticleType.PHOTON, ParticleType.ELECTRON, ParticleType.NEUTRON].includes(type);

      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy <= r * r) {
            if (isStatic || Math.random() < 0.25) {
              const angle = isBeam ? Math.random() * Math.PI * 2 : 0;
              engineRef.current.setParticle(floorX + dx, floorY + dy, type, angle);
            }
          }
        }
      }
    } else {
      engineRef.current.applyThermodynamics(x, y, r, activeTool);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getCoords(e);
    const newPointers = new Map(activePointers); newPointers.set(e.pointerId, coords);
    setActivePointers(newPointers); applyTool(coords.x, coords.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activePointers.has(e.pointerId)) return;
    const coords = getCoords(e);
    const newPointers = new Map(activePointers); newPointers.set(e.pointerId, coords);
    setActivePointers(newPointers); applyTool(coords.x, coords.y);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const newPointers = new Map(activePointers); newPointers.delete(e.pointerId);
    setActivePointers(newPointers); engineRef.current.setMagnet(0, null);
  };

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <div 
        className="relative aspect-[450/320] w-full h-auto flex items-center justify-center" 
        style={{ backgroundColor: config.backgroundColor }}
      >
        <canvas 
          ref={canvasRef} 
          width={GRID_WIDTH * CANVAS_SCALE} 
          height={GRID_HEIGHT * CANVAS_SCALE} 
          onPointerDown={handlePointerDown} 
          onPointerMove={handlePointerMove} 
          onPointerUp={handlePointerUp} 
          onPointerLeave={handlePointerUp} 
          className="w-full h-full cursor-crosshair block" 
        />
      </div>
    </div>
  );
};
export default SimulationView;
