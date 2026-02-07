import React from 'react';
import { useSpring, animated } from '@react-spring/three';
import { IsometricCanvas } from '../3d/IsometricCanvas';
import { Voxel } from '../3d/Voxel';
import { DemoProps } from '../../types';

const AnimatedVoxel = animated(Voxel);

const Scene: React.FC<DemoProps> = ({ speed }) => {
  const { x } = useSpring({
    from: { x: 0 },
    to: async (next) => {
      while(true) {
        // Reset
        await next({ x: 0, immediate: true });
        
        // 1. Anticipation: Pull back
        await next({ 
          x: -2, 
          config: { duration: 1000 / speed, easing: t => t * t } 
        });
        
        // 2. Pause
        await new Promise(r => setTimeout(r, 200 / speed));
        
        // 3. Action
        await next({ 
          x: 6, 
          config: { duration: 300 / speed, tension: 200, friction: 12 } 
        });

        // 4. Reset Delay
        await new Promise(r => setTimeout(r, 800 / speed));
      }
    },
  });

  const rotationZ = x.to({
    range: [-2, 0, 6],
    output: [0.2, 0, 0]
  });

  return (
    <>
      <Voxel position={[0, -1, 0]} size={[14, 0.2, 4]} color="#111" />
      <Voxel position={[-2, -0.8, -1]} size={[0.2, 0.1, 2]} color="#333" />
      <Voxel position={[0, -0.8, -1]} size={[0.2, 0.1, 2]} color="#333" />
      
      <group>
          <AnimatedVoxel 
            position={x.to(x => [x, 0, 0])} 
            rotation-z={rotationZ}
            size={[1.5, 1, 1]} 
            color="#ffffff" 
            emissive
          />
          {/* Trail / Engine */}
          <AnimatedVoxel 
            position={x.to(x => [x - 1, 0, 0])} 
            size={[0.5, 0.6, 0.6]} 
            color="#888" 
            emissive
          />
      </group>
    </>
  );
};

export const AnticipationDemo: React.FC<DemoProps> = (props) => (
  <IsometricCanvas>
    <Scene {...props} />
  </IsometricCanvas>
);