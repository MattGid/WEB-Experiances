import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

interface IsometricCanvasProps {
  children: React.ReactNode;
}

export const IsometricCanvas: React.FC<IsometricCanvasProps> = ({ children }) => {
  return (
    <Canvas>
      {/* Ensure camera looks at the center of the scene */}
      <OrthographicCamera 
        makeDefault 
        position={[20, 20, 20]} 
        zoom={35} 
        near={0.1} 
        far={1000} 
        onUpdate={(c) => c.lookAt(0, 0, 0)}
      />
      
      {/* High Contrast Lighting */}
      <ambientLight intensity={0.2} color="#ffffff" />
      <directionalLight 
        position={[-10, 20, 10]} 
        intensity={2} 
        color="#ffffff" 
        castShadow 
      />
      <pointLight position={[10, 10, -10]} intensity={1} color="#ffffff" />

      {/* Stage */}
      <Suspense fallback={null}>
        <group position={[0, -2, 0]}>
          {children}
          
          <ContactShadows 
            rotation-x={Math.PI / 2} 
            position={[0, -0.6, 0]} 
            opacity={0.5} 
            width={20} 
            height={20} 
            blur={2} 
            far={4.5} 
            color="#000000"
          />
        </group>
        
        <EffectComposer disableNormalPass>
           <Bloom 
             luminanceThreshold={0.2} 
             mipmapBlur 
             intensity={1.5} 
             radius={0.5}
           />
        </EffectComposer>
      </Suspense>
      
      <Environment preset="city" />
    </Canvas>
  );
};