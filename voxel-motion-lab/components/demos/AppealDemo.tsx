import React from 'react';
import { useSpring, animated } from '@react-spring/three';
import { IsometricCanvas } from '../3d/IsometricCanvas';
import { Voxel } from '../3d/Voxel';
import { DemoProps } from '../../types';

const AnimatedVoxel = animated(Voxel);

const Scene: React.FC<DemoProps> = ({ speed }) => {
  const { bodyY, headRot, scale } = useSpring({
    from: { bodyY: 0, headRot: 0, scale: 1 },
    to: async (next) => {
      while(true) {
        // Idle Breath
        await next({ bodyY: 0, headRot: 0, scale: 1, config: { duration: 1000 / speed } });
        
        // Look Left
        await next({ headRot: 0.5, config: { duration: 500 / speed } });
        await new Promise(r => setTimeout(r, 300 / speed));
        
        // Look Right
        await next({ headRot: -0.5, config: { duration: 500 / speed } });
        await new Promise(r => setTimeout(r, 300 / speed));

        // Center & Anticipate
        await next({ headRot: 0, bodyY: -0.2, scale: 0.8, config: { duration: 300 / speed } });

        // Happy Jump!
        await next({ 
          bodyY: 1.5, 
          scale: 1.2, 
          config: { mass: 1, tension: 200 * speed, friction: 10 } 
        });
        
        // Land
        await next({ bodyY: 0, scale: 1, config: { mass: 1, tension: 200 * speed, friction: 15 } });
        await new Promise(r => setTimeout(r, 800 / speed));
      }
    }
  });

  return (
    <>
      <Voxel position={[0, -1, 0]} size={[6, 0.2, 6]} color="#111" />

      <animated.group position={bodyY.to(y => [0, y, 0])}>
        {/* Feet/Base */}
        <AnimatedVoxel 
            position={[0, -0.4, 0]} 
            size={[1.2, 0.2, 0.8]} 
            color="#333" 
            scale={scale.to(s => [s, 1/s, s])}
        />
        
        {/* Body */}
        <AnimatedVoxel 
            position={[0, 0.2, 0]} 
            size={[1, 1, 0.8]} 
            color="#ffffff" 
            emissive
            scale={scale.to(s => [s, s, s])}
        />

        {/* Head Group */}
        <animated.group rotation-y={headRot} position={[0, 0.8, 0]}>
             {/* Head Mesh */}
            <Voxel position={[0, 0, 0]} size={[0.6, 0.5, 0.6]} color="#ccc" />
            
            {/* Eyes */}
            <Voxel position={[-0.15, 0, 0.31]} size={[0.1, 0.1, 0.05]} color="#000" />
            <Voxel position={[0.15, 0, 0.31]} size={[0.1, 0.1, 0.05]} color="#000" />
            
            {/* Antenna */}
            <Voxel position={[0, 0.4, 0]} size={[0.05, 0.4, 0.05]} color="#555" />
            <AnimatedVoxel 
                position={[0, 0.6, 0]} 
                size={[0.15, 0.15, 0.15]} 
                color="#f00" 
                emissive
            />
        </animated.group>
      </animated.group>
    </>
  );
};

export const AppealDemo: React.FC<DemoProps> = (props) => (
  <IsometricCanvas>
    <Scene {...props} />
  </IsometricCanvas>
);