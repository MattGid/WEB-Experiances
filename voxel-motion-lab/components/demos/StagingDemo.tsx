import React, { useEffect, useState } from 'react';
import { useSprings, animated } from '@react-spring/three';
import { IsometricCanvas } from '../3d/IsometricCanvas';
import { Voxel } from '../3d/Voxel';
import { DemoProps } from '../../types';

const AnimatedVoxel = animated(Voxel);

const Scene: React.FC<DemoProps> = ({ speed }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % 5);
    }, 1500 / speed);
    return () => clearInterval(interval);
  }, [speed]);

  const [springs] = useSprings(5, (i) => ({
    scale: activeIdx === i ? 1.5 : 1,
    y: activeIdx === i ? 1 : 0,
    color: activeIdx === i ? '#ffffff' : '#333333',
    emissiveIntensity: activeIdx === i ? 2 : 0,
    config: { tension: 200 * speed, friction: 15 },
  }), [activeIdx, speed]);

  return (
    <>
      <Voxel position={[0, -1, 0]} size={[8, 0.2, 4]} color="#111" />
      
      {/* Background Crowd (Static/Idle) to show contrast */}
      <Voxel position={[0, -0.5, -2]} size={[8, 0.5, 0.5]} color="#1a1a1a" />

      {/* Actors */}
      {springs.map((props, i) => (
        <AnimatedVoxel
          key={i}
          position={props.y.to(y => [(i - 2) * 1.2, y, 0])}
          size={[0.8, 0.8, 0.8]}
          scale={props.scale.to(s => [s, s, s])}
          // @ts-ignore
          color={props.color}
          emissive={i === activeIdx}
          emissiveIntensity={props.emissiveIntensity}
        />
      ))}
    </>
  );
};

export const StagingDemo: React.FC<DemoProps> = (props) => (
  <IsometricCanvas>
    <Scene {...props} />
  </IsometricCanvas>
);