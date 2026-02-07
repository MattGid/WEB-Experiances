import React from 'react';
import { useSpring, animated } from '@react-spring/three';
import { IsometricCanvas } from '../3d/IsometricCanvas';
import { Voxel } from '../3d/Voxel';
import { DemoProps } from '../../types';

const AnimatedVoxel = animated(Voxel);

const Scene: React.FC<DemoProps> = ({ speed }) => {
  const baseDuration = 600 / speed;

  const { y, scale } = useSpring({
    from: { y: 3, scale: [1, 1, 1] },
    to: async (next) => {
      while(true) {
        // Fall
        await next({ 
          y: 0, 
          scale: [0.7, 1.3, 0.7], 
          config: { duration: baseDuration, easing: t => t * t }
        });
        // Impact Squash
        await next({ 
          y: -0.4, 
          scale: [1.4, 0.6, 1.4],
          config: { duration: 100 / speed, tension: 500, friction: 10 } 
        });
        // Rebound
        await next({ 
          y: 3, 
          scale: [1, 1, 1],
          config: { duration: baseDuration, easing: t => 1 - Math.pow(1 - t, 2) }
        });
        // Pause at top
        await new Promise(r => setTimeout(r, 200 / speed));
      }
    },
  });

  return (
    <>
      <Voxel position={[0, -1, 0]} size={[4, 0.2, 4]} color="#111" />
      <Voxel position={[0, -0.9, 0]} size={[1.5, 0.05, 1.5]} color="#000" opacity={0.5} transparent />

      <AnimatedVoxel 
        position={y.to(y => [0, y, 0])} 
        scale={scale as any}
        color="#ffffff" 
        emissive
      />
    </>
  );
};

export const SquashStretchDemo: React.FC<DemoProps> = (props) => (
  <IsometricCanvas>
    <Scene {...props} />
  </IsometricCanvas>
);