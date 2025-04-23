
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import WaterTank from './WaterTank';
import { DebugCube } from './scene/DebugCube';
import { ErrorBoundary } from './ErrorBoundary';
import { Lighting } from './Lighting';

export function FishTankDemo() {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <ErrorBoundary>
        <Canvas
          className="absolute inset-0"
          style={{ background: '#1A1F2C' }}
          camera={{ position: [0, 0, 12], fov: 60 }}
          gl={{ 
            antialias: true, 
            alpha: false,
            stencil: false,
            depth: true,
            powerPreference: 'default'
          }}
          dpr={[0.6, 1]}
          onCreated={({ gl, camera }) => {
            const resize = () => {
              gl.setSize(window.innerWidth, window.innerHeight);
              camera.aspect = window.innerWidth / window.innerHeight;
              camera.updateProjectionMatrix();
            };
            window.addEventListener('resize', resize);
            resize();
            return () => window.removeEventListener('resize', resize);
          }}
          onContextLost={(e) => {
            console.warn('WebGL context lost', e);
            toast({
              title: "Rendering Issue",
              description: "WebGL context was lost. Trying to recover...",
              variant: "destructive"
            });
          }}
        >
          <Lighting />
          <DebugCube />
          
          <Suspense fallback={null}>
            <WaterTank size={[5, 4, 5]} useSimpleMaterial={true} />
          </Suspense>
          
          <OrbitControls enableDamping dampingFactor={0.1} />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}

FishTankDemo.displayName = 'FishTankDemo';
