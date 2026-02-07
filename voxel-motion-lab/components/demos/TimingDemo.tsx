import React from 'react';
import { useSpring, animated } from '@react-spring/three';
import { IsometricCanvas } from '../3d/IsometricCanvas';
import { Voxel } from '../3d/Voxel';
import { DemoProps } from '../../types';

const AnimatedVoxel = animated(Voxel);

const Scene: React.FC<DemoProps> = ({ speed }) => {
  // Piston Animation
  const { pistonX } = useSpring({
    from: { pistonX: -4 },
    to: async (next) => {
      while(true) {
        // Retract
        await next({ pistonX: -4, immediate: true });
        await new Promise(r => setTimeout(r, 500 / speed));
        // Punch
        await next({ pistonX: -2, config: { duration: 100 / speed, tension: 500, friction: 20 } });
        // Hold
        await new Promise(r => setTimeout(r, 2000 / speed));
      }
    },
  });

  // Light Object (Ping Pong Ball)
  const { lightX } = useSpring({
    from: { lightX: -1.5 },
    to: async (next) => {
      while(true) {
        await next({ lightX: -1.5, immediate: true });
        await new Promise(r => setTimeout(r, 600 / speed)); // Wait for punch
        // Fly fast
        await next({ lightX: 4, config: { duration: 400 / speed, easing: t => 1 - Math.pow(1 - t, 2) } });
        // Bounce back slightly
        await next({ lightX: 3, config: { duration: 300 / speed } });
        await new Promise(r => setTimeout(r, 1200 / speed));
      }
    }
  });

  // Heavy Object (Bowling Ball)
  const { heavyX } = useSpring({
    from: { heavyX: -1.5 },
    to: async (next) => {
      while(true) {
        await next({ heavyX: -1.5, immediate: true });
        await new Promise(r => setTimeout(r, 600 / speed)); // Wait for punch
        // Slide slow (heavy friction)
        await next({ lightX: 4, config: { duration: 1500 / speed, easing: t => 1 - Math.pow(1 - t, 4) } });
        // Move partial distance
        await next({ heavyX: 1.5, config: { duration: 1500 / speed, easing: t => 1 - Math.pow(1 - t, 5) } });
        await new Promise(r => setTimeout(r, 400 / speed));
      }
    }
  });

  return (
    <>
      <Voxel position={[0, -1, 0]} size={[10, 0.2, 5]} color="#111" />
      
      {/* Lanes */}
      <Voxel position={[0, -0.9, -1.5]} size={[8, 0.1, 1]} color="#222" />
      <Voxel position={[0, -0.9, 1.5]} size={[8, 0.1, 1]} color="#222" />

      {/* Pistons */}
      <AnimatedVoxel position={pistonX.to(x => [x, 0, -1.5])} size={[1, 0.8, 0.8]} color="#555" />
      <AnimatedVoxel position={pistonX.to(x => [x, 0, 1.5])} size={[1, 0.8, 0.8]} color="#555" />

      {/* Light Object */}
      <AnimatedVoxel 
        position={lightX.to(x => [x, 0, -1.5])} 
        size={[0.6, 0.6, 0.6]} 
        color="#00f2ff" 
        emissive
      />

      {/* Heavy Object */}
      <AnimatedVoxel 
        position={heavyX.to(x => [x, 0, 1.5])} 
        size={[0.9, 0.9, 0.9]} 
        color="#333" 
      />
    </>
  );
};

export const TimingDemo: React.FC<DemoProps> = (props) => (
  <IsometricCanvas>
    <Scene {...props} />
  </IsometricCanvas>
);