import React from 'react';
import { useSpring, animated } from '@react-spring/three';
import { IsometricCanvas } from '../3d/IsometricCanvas';
import { Voxel } from '../3d/Voxel';
import { DemoProps } from '../../types';

const AnimatedVoxel = animated(Voxel);

const Scene: React.FC<DemoProps> = ({ speed }) => {
  // Main Action: Sliding back and forth
  const { x } = useSpring({
    from: { x: -3 },
    to: async (next) => {
        while(true) {
            await next({ x: 3, config: { duration: 1500 / speed, easing: t => -(Math.cos(Math.PI * t) - 1) / 2 } });
            await next({ x: -3, config: { duration: 1500 / speed, easing: t => -(Math.cos(Math.PI * t) - 1) / 2 } });
        }
    }
  });

  // Secondary Action: Radar spinning continuously
  // This adds visual interest and reinforces that the object is "active" or a machine
  // independent of its movement state.
  const { rot } = useSpring({
    from: { rot: 0 },
    to: async (next) => {
        while(true) {
            await next({ rot: Math.PI * 2, config: { duration: 1000 / speed } });
            await next({ rot: 0, immediate: true });
        }
    }
  });

  return (
    <>
      <Voxel position={[0, -1, 0]} size={[10, 0.2, 4]} color="#111" />

      <animated.group position={x.to(v => [v, 0, 0])}>
        {/* Main Body */}
        <Voxel position={[0, 0, 0]} size={[2, 1, 1.5]} color="#444" />
        
        {/* Secondary Action: Spinning Radar */}
        <group position={[0, 0.6, 0]}>
             <AnimatedVoxel 
                position={[0, 0.2, 0]}
                rotation-y={rot}
                size={[1.2, 0.2, 0.2]} 
                color="#ffffff" 
                emissive
            />
            <Voxel position={[0, 0, 0]} size={[0.2, 0.4, 0.2]} color="#222" />
        </group>

        {/* Another Secondary: Antenna bobbing */}
        <AnimatedVoxel 
            position={rot.to(r => [-0.8, 0.5 + Math.sin(r * 2) * 0.1, 0.5])}
            size={[0.1, 0.8, 0.1]}
            color="#666"
        />
      </animated.group>
    </>
  );
};

export const SecondaryActionDemo: React.FC<DemoProps> = (props) => (
  <IsometricCanvas>
    <Scene {...props} />
  </IsometricCanvas>
);