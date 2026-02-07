import React from 'react';
import { useSpring, animated } from '@react-spring/three';
import { IsometricCanvas } from '../3d/IsometricCanvas';
import { Voxel } from '../3d/Voxel';
import { DemoProps } from '../../types';

const AnimatedVoxel = animated(Voxel);

const Scene: React.FC<DemoProps> = ({ speed }) => {
  const { x: xMain } = useSpring({
    from: { x: -3 },
    to: async (next) => {
      while(true) {
        await next({ x: 3 });
        await new Promise(r => setTimeout(r, 1000 / speed));
        await next({ x: -3 });
        await new Promise(r => setTimeout(r, 1000 / speed));
      }
    },
    config: { mass: 1, tension: 170 * speed, friction: 26 }
  });

  const { x: xTail, rotZ } = useSpring({
    from: { x: -3, rotZ: 0 },
    to: async (next) => {
        while(true) {
            await next({ x: 3, rotZ: -0.2 });
            await new Promise(r => setTimeout(r, 1000 / speed));
            await next({ x: -3, rotZ: 0.2 });
            await new Promise(r => setTimeout(r, 1000 / speed));
        }
    },
    config: { mass: 2, tension: 80 * speed, friction: 20 }
  });

  return (
    <>
      <Voxel position={[0, -1, 0]} size={[10, 0.2, 2]} color="#111" />

      <group>
        {/* Main Body */}
        <AnimatedVoxel 
            position={xMain.to(x => [x, 0, 0])} 
            size={[1.5, 1.5, 1.5]} 
            color="#ffffff"
            emissive
        />
        
        {/* Connector */}
        <AnimatedVoxel 
            position={xMain.to((m) => [m - 1.0, 0, 0])} 
            size={[1, 0.4, 0.4]} 
            color="#555"
        />

        {/* Tail */}
        <AnimatedVoxel 
            position={xTail.to(t => [t - 1.8, 0, 0])} 
            rotation-z={rotZ}
            size={[0.8, 0.8, 0.8]} 
            color="#ccc"
        />
      </group>
    </>
  );
};

export const FollowThroughDemo: React.FC<DemoProps> = (props) => (
  <IsometricCanvas>
    <Scene {...props} />
  </IsometricCanvas>
);