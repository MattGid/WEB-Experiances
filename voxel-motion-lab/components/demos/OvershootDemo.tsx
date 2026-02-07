import React from 'react';
import { useSpring, animated } from '@react-spring/three';
import { IsometricCanvas } from '../3d/IsometricCanvas';
import { Voxel } from '../3d/Voxel';
import { DemoProps } from '../../types';

const AnimatedVoxel = animated(Voxel);

const Scene: React.FC<DemoProps> = ({ speed }) => {
  const { x } = useSpring({
    from: { x: -2 },
    to: async (next) => {
      while(true) {
        await next({ x: 2 });
        await new Promise(r => setTimeout(r, 1000 / speed));
        await next({ x: -2 });
        await new Promise(r => setTimeout(r, 1000 / speed));
      }
    },
    config: {
      mass: 1,
      tension: 120 * speed, 
      friction: 8, 
    },
  });

  return (
    <>
      <Voxel position={[0, -1, 0]} size={[8, 0.2, 2]} color="#111" />
      <Voxel position={[2, -1, 0]} size={[0.1, 0.3, 2.2]} color="#333" />
      <Voxel position={[-2, -1, 0]} size={[0.1, 0.3, 2.2]} color="#333" />

      <AnimatedVoxel 
        position={x.to(xVal => [xVal, 0, 0])}
        color="#ffffff" 
        emissive
      />
    </>
  );
};

export const OvershootDemo: React.FC<DemoProps> = (props) => (
  <IsometricCanvas>
    <Scene {...props} />
  </IsometricCanvas>
);