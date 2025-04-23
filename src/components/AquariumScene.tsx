
import React, { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { Lighting } from './Lighting';
import { AudioReactiveElements } from './AudioReactiveElements';
import { LoadingFallback } from './LoadingFallback';
import { ErrorBoundary } from './ErrorBoundary';
import { WaterTank } from './WaterTank';
import { Fish } from './Fish';
import { Plant } from './Plant';
import { Crystal } from './Crystal';
import { Particles } from './Particles';
import { PostProcessing } from './PostProcessing';

import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { useAquariumStore } from '../store/aquariumStore';
import { audioManager } from '../utils/audio';
import { random } from '../utils/noise';
import { toast } from "@/components/ui/use-toast";

// Fallback components for dynamic imports
const FallbackFish = () => (
  <mesh>
    <boxGeometry args={[0.5, 0.3, 0.7]} />
    <meshBasicMaterial color="hotpink" />
  </mesh>
);

const FallbackPlant = () => (
  <mesh position={[0, 1, 0]}>
    <cylinderGeometry args={[0.1, 0.1, 1.5, 4]} />
    <meshBasicMaterial color="green" />
  </mesh>
);

const FallbackCrystal = () => (
  <mesh>
    <octahedronGeometry args={[0.4, 0]} />
    <meshBasicMaterial color="cyan" />
  </mesh>
);

// Mouse position tracker for particle interaction
function MouseTracker({ setMousePosition }: { setMousePosition: (position: THREE.Vector3 | null) => void }) {
  const { camera, mouse, raycaster, scene } = useThree();
  const planeXZ = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const intersectionPoint = useMemo(() => new THREE.Vector3(), []);
  
  useFrame(() => {
    try {
      // Update the mouse raycaster
      raycaster.setFromCamera(mouse, camera);
      
      // Find intersection with center XZ plane
      if (raycaster.ray.intersectPlane(planeXZ, intersectionPoint)) {
        setMousePosition(intersectionPoint.clone());
      } else {
        setMousePosition(null);
      }
    } catch (error) {
      console.error("MouseTracker error:", error);
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

// Debug cube component
function DebugCube({ visible = false }) {
  if (!visible) return null;
  
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="hotpink" wireframe />
    </mesh>
  );
}

export function AquariumScene() {
  const [mousePosition, setMousePosition] = useState<THREE.Vector3 | null>(null);
  const tankSize: [number, number, number] = [10, 6, 10]; // Width, height, depth
  const orbitSpeed = useAquariumStore(state => state.orbitSpeed);
  const [showDebugCube, setShowDebugCube] = useState(false);
  const [renderFailed, setRenderFailed] = useState(false);
  
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

  // Global debug key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' && e.ctrlKey) {
        setShowDebugCube(prev => !prev);
        toast({
          title: showDebugCube ? "Debug Mode Off" : "Debug Mode On",
          description: showDebugCube ? "Debug cube hidden" : "Debug cube visible"
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDebugCube]);
  
  // Error detection and recovery
  useEffect(() => {
    if (renderFailed) {
      const timer = setTimeout(() => {
        console.log("Attempting to recover from render failure...");
        setRenderFailed(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [renderFailed]);

  // Custom error handler for the canvas
  const handleCanvasError = (error: Error) => {
    console.error("Canvas render error:", error);
    setRenderFailed(true);
    toast({
      title: "Render Error",
      description: "There was a problem rendering the 3D scene. Attempting to recover...",
      variant: "destructive"
    });
  };
  
  return (
    <ErrorBoundary>
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
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#1A1F2C'));
        }}
        onError={handleCanvasError}
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
          
          <ErrorBoundary>
            <Lighting />
          </ErrorBoundary>

          {/* Debug cube for testing */}
          <DebugCube visible={showDebugCube} />

          {/* Main aquarium scene */}
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingFallback />}>
              <AudioReactiveElements
                mousePosition={mousePosition}
                tankSize={tankSize}
                fishData={fishData}
                plantPositions={plantPositions}
                crystalData={crystalData}
              />
            </React.Suspense>
          </ErrorBoundary>
        </React.Suspense>
      </Canvas>
    </ErrorBoundary>
  );
}
