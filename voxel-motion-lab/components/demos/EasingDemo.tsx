import React from 'react';
import { useSpring, animated } from '@react-spring/three';
import { IsometricCanvas } from '../3d/IsometricCanvas';
import { Voxel } from '../3d/Voxel';
import { DemoProps } from '../../types';

const AnimatedVoxel = animated(Voxel);

const Scene: React.FC<DemoProps> = ({ speed }) => {
  const duration = 2000 / speed;

  const { position: posLinear } = useSpring({
    from: { position: [-4, 0, -1.5] },
    to: async (next) => {
      while(true) {
        await next({ position: [4, 0, -1.5] });
        await new Promise(r => setTimeout(r, 500 / speed));
        await next({ position: [-4, 0, -1.5] });
        await new Promise(r => setTimeout(r, 500 / speed));
      }
    },
    config: { duration: duration, easing: (t) => t }, 
  });

  const { position: posEase } = useSpring({
    from: { position: [-4, 0, 1.5] },
    to: async (next) => {
       while(true) {
        await next({ position: [4, 0, 1.5], config: { duration, easing: t => 1 - Math.pow(1 - t, 3) } });
        await new Promise(r => setTimeout(r, 500 / speed));
        await next({ position: [-4, 0, 1.5], config: { duration, easing: t => 1 - Math.pow(1 - t, 3) } });
        await new Promise(r => setTimeout(r, 500 / speed));
      }
    },
  });

  return (
    <>
      {/* Track Lines */}
      <Voxel position={[0, -0.6, -1.5]} size={[10, 0.2, 1]} color="#111" />
      <Voxel position={[0, -0.6, 1.5]} size={[10, 0.2, 1]} color="#111" />
      
      {/* Start/Finish Lines */}
      <Voxel position={[-4, -0.5, 0]} size={[0.2, 0.1, 5]} color="#222" />
      <Voxel position={[4, -0.5, 0]} size={[0.2, 0.1, 5]} color="#ffffff" emissive />

      {/* Racers */}
      <AnimatedVoxel 
        position={posLinear as any} 
        color="#555" 
        size={[1, 1, 1]} 
      />
      <AnimatedVoxel 
        position={posEase as any} 
        color="#ffffff" 
        size={[1, 1, 1]} 
        emissive
      />
    </>
  );
};

export const EasingDemo: React.FC<DemoProps> = (props) => (
  <IsometricCanvas>
    <Scene {...props} />
  </IsometricCanvas>
);