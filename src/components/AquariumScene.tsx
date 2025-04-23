
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import { Lighting } from './Lighting';
import { AudioReactiveElements } from './AudioReactiveElements';
import { LoadingFallback } from './LoadingFallback';
import { ErrorBoundary } from './ErrorBoundary';
import { WaterTank } from './WaterTank';
import { Fish } from './Fish';
import { Plant } from './Plant';
import { Kelp } from './Kelp';
import { Crystal } from './Crystal';
import { Particles } from './Particles';
import { PostProcessing } from './PostProcessing';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { useAquariumStore } from '../store/aquariumStore';
import { random } from '../utils/noise';
import { toast } from "@/components/ui/use-toast";

// Move the scene content to a separate component that will be inside the Canvas
const AquariumContent = () => {
  const [mousePosition, setMousePosition] = useState<THREE.Vector3 | null>(null);
  const tankSize: [number, number, number] = [10, 6, 10];
  const orbitSpeed = useAquariumStore(state => state.orbitSpeed);
  const [fishWorldPositions, setFishWorldPositions] = useState<THREE.Vector3[]>([]);
  const fishRefs = React.useRef<(THREE.Mesh | null)[]>([]);
  
  const fishData = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => ({
      scale: 0.7 + Math.random() * 0.5,
      speed: 0.68 + Math.random() * 0.58,
      color: `hsl(${index * 33 + 165}, 73%, ${47 + index * 4}%)`
    }));
  }, []);

  const plantPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      positions.push([
        (Math.random() - 0.5) * tankSize[0] * 0.75,
        -tankSize[1] / 2 * 0.93,
        (Math.random() - 0.5) * tankSize[2] * 0.68,
      ]);
    }
    return positions;
  }, [tankSize]);

  const kelpPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    positions.push([0, -tankSize[1] / 2 * 0.98, -tankSize[2] * 0.42]);
    positions.push([-tankSize[0]*0.38, -tankSize[1]/2 * 0.98, -tankSize[2]*0.39]);
    positions.push([tankSize[0]*0.38, -tankSize[1]/2 * 0.98, -tankSize[2]*0.40]);
    positions.push([random(-tankSize[0]*0.25, tankSize[0]*0.25), -tankSize[1]/2 * 0.99, -tankSize[2]*0.31]);
    positions.push([random(-tankSize[0]*0.29, tankSize[0]*0.29), -tankSize[1]/2 * 0.99, -tankSize[2]*0.36]);
    return positions;
  }, [tankSize]);

  const crystalData = useMemo(() => {
    const crystals = [];
    const count = 3;
    for (let i = 0; i < count; i++) {
      crystals.push({
        position: [
          (Math.random() - 0.5) * tankSize[0] * 0.6,
          -tankSize[1] / 2 * 0.7 + Math.random() * 0.5,
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

  // This is now safe to use inside the Canvas
  const { raycaster, camera, mouse } = React.useThree();
  const planeXZ = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const intersectionPoint = useMemo(() => new THREE.Vector3(), []);
  
  React.useFrame(() => {
    try {
      // Mouse tracking
      raycaster.setFromCamera(mouse, camera);
      if (raycaster.ray.intersectPlane(planeXZ, intersectionPoint)) {
        setMousePosition(intersectionPoint.clone());
      } else {
        setMousePosition(null);
      }
      
      // Fish position tracking
      if (fishRefs.current.length > 0) {
        setFishWorldPositions(
          fishRefs.current.map(mesh => (mesh ? mesh.position.clone() : new THREE.Vector3()))
        );
      }
    } catch (error) {
      console.error("Frame update error:", error);
      setMousePosition(null);
    }
  });

  return (
    <>
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
      
      {/* Debug cube would go here */}

      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <WaterTank size={tankSize} audioLevel={0}>
            {fishData.map((fish, i) => (
              <Fish
                key={i}
                color={fish.color}
                scale={fish.scale}
                speed={fish.speed}
                tankSize={tankSize}
                index={i}
                audioLevel={0}
                allFishPositions={fishWorldPositions}
                ref={el => { fishRefs.current[i] = el; }}
              />
            ))}
            {plantPositions.map((pos, i) => (
              <Plant key={i} position={pos} />
            ))}
            {kelpPositions.map((pos, i) => (
              <Kelp key={i} position={pos} height={2.6 + Math.random()*1.7} />
            ))}
            {crystalData.map((crystal, i) => (
              <Crystal key={i} {...crystal} />
            ))}
          </WaterTank>
          <Particles
            tankSize={tankSize}
            mousePosition={mousePosition}
            count={42}
            audioLevel={0}
          />
          <PostProcessing audioLevel={0} />
        </Suspense>
      </ErrorBoundary>
    </>
  );
};

// DebugCube separate component
const DebugCube = ({ visible = false }) => {
  if (!visible) return null;
  
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="hotpink" wireframe />
    </mesh>
  );
};

// Main wrapper component
export function AquariumScene() {
  const [showDebugCube, setShowDebugCube] = useState(false);
  const [renderFailed, setRenderFailed] = useState(false);

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

  useEffect(() => {
    if (renderFailed) {
      const timer = setTimeout(() => {
        console.log("Attempting to recover from render failure...");
        setRenderFailed(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [renderFailed]);

  const handleCanvasError = (event: React.SyntheticEvent) => {
    console.error("Canvas render error:", event);
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
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#1A1F2C'));
        }}
        onError={handleCanvasError}
      >
        <React.Suspense fallback={<LoadingFallback />}>
          <AquariumContent />
          {showDebugCube && <DebugCube visible={true} />}
        </React.Suspense>
      </Canvas>
    </ErrorBoundary>
  );
}
