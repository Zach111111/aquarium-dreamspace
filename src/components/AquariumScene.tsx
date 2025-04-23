
import React, { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { Lighting } from './Lighting';
import { AudioReactiveElements } from './AudioReactiveElements';
import { LoadingFallback } from './LoadingFallback';

import { PerspectiveCamera, Stats } from '@react-three/drei';
import { useAquariumStore } from '../store/aquariumStore';
import { audioManager } from '../utils/audio';
import { random } from '../utils/noise';
import { toast } from "@/components/ui/use-toast";

// Mouse position tracker for particle interaction
function MouseTracker({ setMousePosition }: { setMousePosition: (position: THREE.Vector3 | null) => void }) {
  const { camera } = useThree();
  const [mousePosition, setMousePos] = useState<THREE.Vector3 | null>(null);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const planeXZ = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const intersectionPoint = useMemo(() => new THREE.Vector3(), []);
  
  useThree(({ gl }) => {
    // Add WebGL context loss handler
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      console.error('WebGL context lost');
      toast({
        title: "Graphics Error",
        description: "WebGL context lost. Try refreshing the page.",
        variant: "destructive"
      });
    });
  });
  
  // Set mouse position to null to avoid unnecessary calculations
  useEffect(() => {
    setMousePosition(null);
  }, [setMousePosition]);
  
  return null;
}

export function AquariumScene() {
  const [mousePosition, setMousePosition] = useState<THREE.Vector3 | null>(null);
  const tankSize: [number, number, number] = [10, 6, 10]; // Width, height, depth
  
  // Generate minimal fish data
  const fishData = useMemo(() => {
    return [{
      scale: 1,
      speed: 1,
      color: '#A5F3FF'
    }];
  }, []);
  
  // Generate minimal plant positions
  const plantPositions = useMemo(() => {
    return [[0, -3, 0]] as [number, number, number][];
  }, []);
  
  // Generate minimal crystal data
  const crystalData = useMemo(() => {
    return [{
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      color: '#C9B7FF',
      height: 1
    }];
  }, []);
  
  return (
    <Canvas 
      className="w-full h-full"
      style={{ background: '#1A1F2C' }}
      gl={{ 
        antialias: false,
        depth: true,
        alpha: false,
        stencil: false,
        powerPreference: 'default',
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        {/* Debug cube to verify canvas is working */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="hotpink" />
        </mesh>
        
        <MouseTracker setMousePosition={setMousePosition} />
        
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={60} />
        <Lighting />

        {/* Main aquarium scene with minimal components */}
        <AudioReactiveElements
          mousePosition={mousePosition}
          tankSize={tankSize}
          fishData={fishData}
          plantPositions={plantPositions}
          crystalData={crystalData}
        />
      </Suspense>
    </Canvas>
  );
}
