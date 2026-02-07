import React from 'react';
import { useSpring, animated } from '@react-spring/three';
import { IsometricCanvas } from '../3d/IsometricCanvas';
import { Voxel } from '../3d/Voxel';
import { DemoProps } from '../../types';

const AnimatedVoxel = animated(Voxel);

const Scene: React.FC<DemoProps> = ({ speed }) => {
  const { scale, y, shake } = useSpring({
    from: { scale: 1, y: 0, shake: 0 },
    to: async (next) => {
      while(true) {
        // Idle
        await new Promise(r => setTimeout(r, 500 / speed));
        
        // Anticipation (Shrink)
        await next({ scale: 0.8, y: -0.1, config: { duration: 300 / speed } });
        
        // Exaggerated Action (Explode Up)
        // Scale goes way beyond normal (2.5x)
        await next({ 
            scale: 2.5, 
            y: 3, 
            shake: 1,
            config: { tension: 300 * speed, friction: 10 } 
        });

        // Shake/Vibrate at apex (simulated by rapid position changes in render or simple spring oscillation)
        // Here we just hold the pose briefly
        await new Promise(r => setTimeout(r, 100 / speed));

        // Return / Settle
        await next({ 
            scale: 1, 
            y: 0, 
            shake: 0,
            config: { mass: 2, tension: 150 * speed, friction: 12 } 
        });
        
        await new Promise(r => setTimeout(r, 800 / speed));
      }
    },
  });

  return (
    <>
      <Voxel position={[0, -1, 0]} size={[6, 0.2, 6]} color="#111" />

      {/* The Actor */}
      <AnimatedVoxel 
        position={y.to((yVal) => [0, yVal, 0])} 
        rotation-z={shake.to(s => s * (Math.random() - 0.5) * 0.5)} // Slight random shake when 'shake' is 1
        scale={scale.to(s => [s, s, s])}
        size={[1, 1, 1]} 
        color="#ffffff" 
        emissive
      />
      
      {/* Reference object for scale comparison */}
      <Voxel position={[2.5, -0.5, 0]} size={[0.5, 1, 0.5]} color="#222" />
    </>
  );
};

export const ExaggerationDemo: React.FC<DemoProps> = (props) => (
  <IsometricCanvas>
    <Scene {...props} />
  </IsometricCanvas>
);