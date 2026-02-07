import React, { useEffect } from 'react';
import { useSprings, animated } from '@react-spring/three';
import { IsometricCanvas } from '../3d/IsometricCanvas';
import { Voxel } from '../3d/Voxel';
import { DemoProps } from '../../types';

const AnimatedVoxel = animated(Voxel);

const GRID_LAYOUT = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0],  [0, 0],  [1, 0],
  [-1, 1],  [0, 1],  [1, 1]
];

const Scene: React.FC<DemoProps> = ({ speed }) => {
  const getDelay = (x: number, z: number) => {
    const dist = Math.sqrt(x*x + z*z);
    return dist * 150; 
  };

  const [springs, api] = useSprings(GRID_LAYOUT.length, (i) => ({
    scaleY: 0.5,
    posY: -0.25,
    config: { mass: 1, tension: 180, friction: 12 },
  }));

  useEffect(() => {
    let isActive = false;
    const loop = async () => {
       isActive = !isActive;
       api.start((i) => {
          const [x, z] = GRID_LAYOUT[i];
          return {
              scaleY: isActive ? 2.5 : 0.5,
              posY: isActive ? 0.75 : -0.25,
              delay: getDelay(x, z) / speed,
              config: { 
                  mass: 1, 
                  tension: 180 * speed, 
                  friction: 12 
              }
          };
       });
    };

    const interval = setInterval(loop, 2000 / speed);
    loop(); // start immediately
    return () => clearInterval(interval);
  }, [speed, api]);

  return (
    <>
       <Voxel position={[0, -1.5, 0]} size={[4, 0.2, 4]} color="#111" />

      {springs.map((props, i) => {
        const [x, z] = GRID_LAYOUT[i];
        return (
          <AnimatedVoxel
            key={i}
            position={props.posY.to(y => [x * 1.2, y, z * 1.2])}
            scale={props.scaleY.to(s => [1, s, 1])}
            color={i === 4 ? "#ffffff" : "#333"}
            emissive={i === 4}
            size={[1, 1, 1]}
          />
        );
      })}
    </>
  );
};

export const StaggerDemo: React.FC<DemoProps> = (props) => (
  <IsometricCanvas>
    <Scene {...props} />
  </IsometricCanvas>
);