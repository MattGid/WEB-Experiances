import React from 'react';
import { useSpring, animated } from '@react-spring/three';
import { IsometricCanvas } from '../3d/IsometricCanvas';
import { Voxel } from '../3d/Voxel';
import { DemoProps } from '../../types';

const AnimatedVoxel = animated(Voxel);

const Scene: React.FC<DemoProps> = ({ speed }) => {
  const { recoil, bulletX, scale } = useSpring({
    from: { recoil: 0, bulletX: 0, scale: 1 },
    to: async (next) => {
      while(true) {
        // Reset
        await next({ recoil: 0, bulletX: 0, scale: 1, immediate: true });
        await new Promise(r => setTimeout(r, 500 / speed));

        // Anticipation (Energy Build up)
        await next({ scale: 1.2, config: { duration: 800 / speed } });
        
        // FIRE!
        // Bullet shoots forward, Cannon recoils backward instantly
        next({ bulletX: 10, config: { duration: 600 / speed, easing: t => t } });
        await next({ 
            recoil: -1.5, 
            scale: 0.9,
            config: { tension: 800 * speed, friction: 15 } // High tension for sharp recoil
        });

        // Recovery
        await next({ 
            recoil: 0, 
            scale: 1,
            config: { mass: 2, tension: 100 * speed, friction: 20 } 
        });

        await new Promise(r => setTimeout(r, 800 / speed));
      }
    },
  });

  return (
    <>
      <Voxel position={[0, -1, 0]} size={[10, 0.2, 4]} color="#111" />
      
      {/* Target Wall */}
      <Voxel position={[4.5, 0, 0]} size={[0.5, 2, 2]} color="#222" />

      {/* Cannon Group */}
      <animated.group position={recoil.to(x => [x - 2, 0, 0])}>
        {/* Wheels/Base */}
        <Voxel position={[0, -0.6, 0.6]} size={[1.2, 0.6, 0.2]} color="#333" />
        <Voxel position={[0, -0.6, -0.6]} size={[1.2, 0.6, 0.2]} color="#333" />

        {/* Barrel */}
        <AnimatedVoxel 
            position={[0, 0, 0]} 
            size={[2, 1, 1]} 
            color="#555" 
            scale={scale.to(s => [s, 1/s, 1/s])} // Volume preservation logic slightly applied
        />
        
        {/* Fuse/Detail */}
        <Voxel position={[-0.9, 0.6, 0]} size={[0.2, 0.4, 0.2]} color="#f00" emissive />
      </animated.group>

      {/* Projectile */}
      <AnimatedVoxel 
        position={bulletX.to(x => [x - 2, 0, 0])} 
        size={[0.5, 0.5, 0.5]} 
        color="#00f2ff" 
        emissive
      />
    </>
  );
};

export const ActionReactionDemo: React.FC<DemoProps> = (props) => (
  <IsometricCanvas>
    <Scene {...props} />
  </IsometricCanvas>
);