import React from 'react';
import { useSpring, animated } from '@react-spring/three';
import { IsometricCanvas } from '../3d/IsometricCanvas';
import { Voxel } from '../3d/Voxel';
import { DemoProps } from '../../types';

const AnimatedVoxel = animated(Voxel);

const Scene: React.FC<DemoProps> = ({ speed }) => {
  // Pose-to-Pose: Sequential Movement
  // 1. Rotate Base, 2. Rotate Elbow
  const { rotBaseP, rotElbowP } = useSpring({
    from: { rotBaseP: 0, rotElbowP: 0 },
    to: async (next) => {
      while(true) {
        // Reset
        await next({ rotBaseP: 0, rotElbowP: 0, config: { duration: 500 / speed } });
        await new Promise(r => setTimeout(r, 500 / speed));

        // Step 1: Base
        await next({ rotBaseP: Math.PI / 2, config: { tension: 200 * speed, friction: 15 } });
        await new Promise(r => setTimeout(r, 200 / speed));
        
        // Step 2: Elbow
        await next({ rotElbowP: Math.PI / 4, config: { tension: 200 * speed, friction: 15 } });
        await new Promise(r => setTimeout(r, 1000 / speed));
      }
    },
  });

  // Straight Ahead: Fluid Concurrent Movement
  const { rotBaseS, rotElbowS } = useSpring({
    from: { rotBaseS: 0, rotElbowS: 0 },
    to: async (next) => {
      while(true) {
        // Reset
        await next({ rotBaseS: 0, rotElbowS: 0, config: { duration: 500 / speed } });
        await new Promise(r => setTimeout(r, 500 / speed));

        // Move Together in an arc
        await next({ 
            rotBaseS: Math.PI / 2, 
            rotElbowS: Math.PI / 4, 
            config: { duration: 1000 / speed, easing: t => -(Math.cos(Math.PI * t) - 1) / 2 } 
        });
        await new Promise(r => setTimeout(r, 1000 / speed));
      }
    },
  });

  return (
    <>
      <Voxel position={[0, -1, 0]} size={[8, 0.2, 5]} color="#111" />
      
      {/* --- Pose to Pose (Sequential/Robotic) --- */}
      <group position={[-2, -0.5, 0]}>
         <Voxel position={[0, -0.4, 1.5]} size={[2, 0.1, 1]} color="#222" /> {/* Label Plate */}
         <Voxel position={[0, 0, 0]} size={[1, 0.2, 1]} color="#333" /> {/* Base */}
         
         <animated.group rotation-y={rotBaseP}>
            <Voxel position={[0, 0.6, 0]} size={[0.6, 1.2, 0.6]} color="#555" /> {/* Lower Arm */}
            <animated.group position={[0, 1.1, 0]} rotation-z={rotElbowP}>
                 <Voxel position={[0, 0.6, 0]} size={[0.5, 1.2, 0.5]} color="#777" /> {/* Upper Arm */}
                 <Voxel position={[0, 1.3, 0]} size={[0.3, 0.3, 0.3]} color="#fff" emissive /> {/* Hand */}
            </animated.group>
         </animated.group>
      </group>

      {/* --- Straight Ahead (Fluid/Organic) --- */}
      <group position={[2, -0.5, 0]}>
         <Voxel position={[0, -0.4, 1.5]} size={[2, 0.1, 1]} color="#222" />
         <Voxel position={[0, 0, 0]} size={[1, 0.2, 1]} color="#333" />
         
         <animated.group rotation-y={rotBaseS}>
            <Voxel position={[0, 0.6, 0]} size={[0.6, 1.2, 0.6]} color="#004444" />
            <animated.group position={[0, 1.1, 0]} rotation-z={rotElbowS}>
                 <Voxel position={[0, 0.6, 0]} size={[0.5, 1.2, 0.5]} color="#00aaaa" />
                 <Voxel position={[0, 1.3, 0]} size={[0.3, 0.3, 0.3]} color="#00f2ff" emissive />
            </animated.group>
         </animated.group>
      </group>
    </>
  );
};

export const PoseToPoseDemo: React.FC<DemoProps> = (props) => (
  <IsometricCanvas>
    <Scene {...props} />
  </IsometricCanvas>
);