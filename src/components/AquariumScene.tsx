
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { Lighting } from './Lighting';
import { AudioReactiveElements } from './AudioReactiveElements';
import { LoadingFallback } from './LoadingFallback';

import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { useAquariumStore } from '../store/aquariumStore';
import { audioManager } from '../utils/audio';
import { random } from '../utils/noise';
import { toast } from "@/components/ui/use-toast";

// Mouse position tracker for particle interaction
function MouseTracker({ setMousePosition }: { setMousePosition: (position: THREE.Vector3 | null) => void }) {
  const { camera, mouse, raycaster, scene } = useThree();
  const planeXZ = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const intersectionPoint = useMemo(() => new THREE.Vector3(), []);
  
  useFrame(() => {
    // Update the mouse raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Find intersection with center XZ plane
    if (raycaster.ray.intersectPlane(planeXZ, intersectionPoint)) {
      setMousePosition(intersectionPoint.clone());
    } else {
      setMousePosition(null);
    }
  });
  
  // Add WebGL context loss handler
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.error('WebGL context lost');
      toast({
        title: "Graphics Error",
        description: "WebGL context lost. Try refreshing the page.",
        variant: "destructive"
      });
      setMousePosition(null);
    };
    
    canvas.addEventListener('webglcontextlost', handleContextLost);
    return () => canvas.removeEventListener('webglcontextlost', handleContextLost);
  }, []);
  
  return null;
}

export function AquariumScene() {
  const [mousePosition, setMousePosition] = useState<THREE.Vector3 | null>(null);
  const tankSize: [number, number, number] = [10, 6, 10]; // Width, height, depth
  const orbitSpeed = useAquariumStore(state => state.orbitSpeed);
  
  // Generate fish data
  const fishData = useMemo(() => {
    return Array.from({ length: 5 }, (_, index) => ({
      scale: 0.7 + Math.random() * 0.6,
      speed: 0.5 + Math.random() * 1.5,
      color: `hsl(${index * 36 + 180}, 70%, ${50 + index * 5}%)`
    }));
  }, []);
  
  // Generate plant positions
  const plantPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const count = 6;
    
    for (let i = 0; i < count; i++) {
      positions.push([
        (Math.random() - 0.5) * tankSize[0] * 0.7,
        -tankSize[1] / 2 * 0.9, // Position at bottom of tank
        (Math.random() - 0.5) * tankSize[2] * 0.7
      ]);
    }
    
    return positions;
  }, [tankSize]);
  
  // Generate crystal data
  const crystalData = useMemo(() => {
    const crystals = [];
    const count = 3;
    
    for (let i = 0; i < count; i++) {
      crystals.push({
        position: [
          (Math.random() - 0.5) * tankSize[0] * 0.6,
          -tankSize[1] / 2 * 0.7 + Math.random() * 0.5, // Position near bottom
          (Math.random() - 0.5) * tankSize[2] * 0.6
        ] as [number, number, number],
        rotation: [
          Math.random() * Math.PI * 0.2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 0.2
        ] as [number, number, number],
        color: `hsl(${Math.random() * 60 + 240}, 70%, 60%)`,
        height: 0.8 + Math.random() * 1.2
      });
    }
    
    return crystals;
  }, [tankSize]);
  
  return (
    <Canvas 
      className="w-full h-full"
      style={{ background: '#1A1F2C' }}
      gl={{ 
        antialias: true,
        powerPreference: 'default',
        alpha: false,
        stencil: false,
        depth: true,
      }}
      dpr={[1, 1.5]} // Limit pixel ratio for performance
    >
      <React.Suspense fallback={<LoadingFallback />}>
        <MouseTracker setMousePosition={setMousePosition} />
        
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={60} />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate={orbitSpeed > 0} 
          autoRotateSpeed={orbitSpeed * 2}
          maxDistance={20}
          minDistance={8}
        />
        <Lighting />

        {/* Main aquarium scene */}
        <AudioReactiveElements
          mousePosition={mousePosition}
          tankSize={tankSize}
          fishData={fishData}
          plantPositions={plantPositions}
          crystalData={crystalData}
        />
      </React.Suspense>
    </Canvas>
  );
}
