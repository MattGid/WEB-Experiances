import React from 'react';
import { Mesh } from 'three';
import { RoundedBox } from '@react-three/drei';
import { animated } from '@react-spring/three';

// Wrap RoundedBox so it can accept SpringValues for position/scale/etc.
const AnimatedRoundedBox = animated(RoundedBox);

interface VoxelProps {
  position?: any; // Allow SpringValue or array
  rotation?: any; 
  scale?: any;
  color?: string;
  size?: [number, number, number];
  opacity?: number;
  transparent?: boolean;
  emissive?: boolean;
  [key: string]: any; // Allow other spring props
}

export const Voxel = React.forwardRef<Mesh, VoxelProps>(({ 
  position = [0, 0, 0], 
  color = '#333333', 
  size = [1, 1, 1],
  opacity = 1,
  transparent = false,
  emissive = false,
  ...props
}, ref) => {
  return (
    <AnimatedRoundedBox 
      ref={ref}
      args={size} 
      radius={0.05} 
      smoothness={4} 
      position={position}
      {...props}
    >
      <meshStandardMaterial 
        color={color} 
        roughness={0.2} 
        metalness={0.5} 
        transparent={transparent}
        opacity={opacity}
        emissive={emissive ? "#ffffff" : "#000000"}
        emissiveIntensity={emissive ? 2 : 0}
      />
    </AnimatedRoundedBox>
  );
});

Voxel.displayName = 'Voxel';