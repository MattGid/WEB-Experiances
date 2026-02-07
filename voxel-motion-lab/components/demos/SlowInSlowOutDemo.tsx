import React from 'react';
import { useSpring, animated } from '@react-spring/three';
import { IsometricCanvas } from '../3d/IsometricCanvas';
import { Voxel } from '../3d/Voxel';
import { DemoProps } from '../../types';

const AnimatedVoxel = animated(Voxel);

const Scene: React.FC<DemoProps> = ({ speed }) => {
  // Pendulum physics simulation via simple harmonic motion approximation
  const { t } = useSpring({
    from: { t: 0 },
    to: async (next) => {
      while(true) {
        await next({ t: 2 * Math.PI, config: { duration: 2000 / speed, easing: t => t } });
        await next({ t: 0, immediate: true });
      }
    },
  });

  // Oscillation from -45deg to 45deg
  // Cosine creates the Slow-In (at ends) and Fast-Out (at center) natural movement
  const rotationZ = t.to(val => Math.sin(val) * (Math.PI / 4));

  return (
    <>
      <Voxel position={[0, -2, 0]} size={[8, 0.2, 4]} color="#111" />
      
      {/* Ceiling / Support */}
      <Voxel position={[0, 3, 0]} size={[4, 0.5, 1]} color="#222" />
      <Voxel position={[0, 2.8, 0]} size={[0.5, 0.5, 0.5]} color="#444" />

      {/* Pendulum Assembly */}
      <animated.group position={[0, 2.8, 0]} rotation-z={rotationZ}>
          {/* Rod */}
          <Voxel position={[0, -2, 0]} size={[0.1, 4, 0.1]} color="#666" />
          
          {/* Bob (Weight) */}
          <Voxel position={[0, -4, 0]} size={[1.2, 1.2, 0.4]} color="#ffffff" emissive />
          
          {/* Decor */}
          <Voxel position={[0, -4, 0.3]} size={[0.8, 0.8, 0.2]} color="#00f2ff" />
      </animated.group>

      {/* Markers for apexes to visualize the "Slow" zones */}
      <Voxel position={[-2.8, -1, 0]} size={[0.1, 0.5, 0.1]} color="#333" />
      <Voxel position={[2.8, -1, 0]} size={[0.1, 0.5, 0.1]} color="#333" />
      <Voxel position={[0, -1, 0]} size={[0.1, 0.2, 0.1]} color="#111" />
    </>
  );
};

export const SlowInSlowOutDemo: React.FC<DemoProps> = (props) => (
  <IsometricCanvas>
    <Scene {...props} />
  </IsometricCanvas>
);