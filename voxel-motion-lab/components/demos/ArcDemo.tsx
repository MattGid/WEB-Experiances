import React from 'react';
import { useSpring, animated } from '@react-spring/three';
import { IsometricCanvas } from '../3d/IsometricCanvas';
import { Voxel } from '../3d/Voxel';
import { DemoProps } from '../../types';

const AnimatedVoxel = animated(Voxel);

const Scene: React.FC<DemoProps> = ({ speed }) => {
  const { t } = useSpring({
    from: { t: 0 },
    to: async (next) => {
      while(true) {
        // Jump
        await next({ 
            t: 1, 
            config: { duration: 1500 / speed } 
        });
        // Reset immediate
        await next({ t: 0, immediate: true });
        await new Promise(r => setTimeout(r, 500 / speed));
      }
    },
  });

  // Calculate parabolic arc
  const position = t.to(t => {
      const x = (t * 8) - 4; // -4 to 4
      // Parabola: y = -a(x-h)^2 + k
      // Peak at x=0 (t=0.5).
      // Let's use Sine for a smoother "cartoon" arc feel
      const y = Math.sin(t * Math.PI) * 4; 
      return [x, y, 0];
  });

  const rotation = t.to(t => [0, 0, -t * Math.PI * 2]);

  return (
    <>
      {/* Floor */}
      <Voxel position={[0, -1, 0]} size={[10, 0.2, 2]} color="#111" />
      
      {/* Obstacle */}
      <Voxel position={[0, -0.4, 0]} size={[1, 1, 1]} color="#222" />

      {/* Arcing Object */}
      <AnimatedVoxel 
        position={position as any} 
        rotation={rotation as any}
        size={[0.8, 0.8, 0.8]} 
        color="#ffffff" 
        emissive
      />
      
      {/* Trajectory Markers (Static) */}
      {[0.1, 0.3, 0.5, 0.7, 0.9].map((val, i) => (
          <Voxel 
            key={i}
            position={[(val * 8) - 4, Math.sin(val * Math.PI) * 4, -0.5]} 
            size={[0.1, 0.1, 0.1]} 
            color="#333" 
          />
      ))}
    </>
  );
};

export const ArcDemo: React.FC<DemoProps> = (props) => (
  <IsometricCanvas>
    <Scene {...props} />
  </IsometricCanvas>
);