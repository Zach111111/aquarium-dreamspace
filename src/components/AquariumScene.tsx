
import React, { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { Lighting } from './Lighting';
import { AudioReactiveElements } from './AudioReactiveElements';
import { ErrorBoundary } from './ErrorBoundary';
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
  
  useFrame(({ gl, scene }) => {
    if (mousePosition) {
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(planeXZ, intersectionPoint);
      setMousePosition(intersectionPoint.clone());
    } else {
      setMousePosition(null);
    }
  });
  
  return (
    <mesh
      visible={false}
      onPointerMove={(e) => {
        mouse.set(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1
        );
        setMousePos(new THREE.Vector3(e.point.x, e.point.y, e.point.z));
      }}
      onPointerLeave={() => {
        setMousePos(null);
      }}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

export function AquariumScene() {
  const [mousePosition, setMousePosition] = useState<THREE.Vector3 | null>(null);
  const tankSize: [number, number, number] = [10, 6, 10]; // Width, height, depth
  const [fishCount] = useState(8);
  const [plantCount] = useState(4);
  const [crystalCount] = useState(3);
  
  // Generate fish data
  const fishData = useMemo(() => {
    return Array.from({ length: fishCount }, (_, i) => ({
      scale: random(0.5, 1.2),
      speed: random(0.5, 1.5),
      color: [
        '#C9B7FF', // Purple
        '#A5F3FF', // Blue
        '#FFB1DC', // Pink
        '#B9FFCE', // Green
      ][Math.floor(Math.random() * 4)],
    }));
  }, [fishCount]);
  
  // Generate plant positions
  const plantPositions = useMemo(() => {
    return Array.from({ length: plantCount }, () => {
      const tankWidth = tankSize[0];
      const tankDepth = tankSize[2];
      const x = (Math.random() - 0.5) * tankWidth * 0.8;
      const z = (Math.random() - 0.5) * tankDepth * 0.8;
      // Place plants on tank floor
      return [x, -tankSize[1]/2, z] as [number, number, number];
    });
  }, [plantCount, tankSize]);
  
  // Generate crystal positions
  const crystalData = useMemo(() => {
    return Array.from({ length: crystalCount }, () => {
      const tankWidth = tankSize[0];
      const tankHeight = tankSize[1];
      const tankDepth = tankSize[2];
      const x = (Math.random() - 0.5) * tankWidth * 0.7;
      const y = (Math.random() - 0.5) * tankHeight * 0.7;
      const z = (Math.random() - 0.5) * tankDepth * 0.7;
      return {
        position: [x, y, z] as [number, number, number],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ] as [number, number, number],
        color: [
          '#C9B7FF', // Purple
          '#A5F3FF', // Blue
          '#FFB1DC', // Pink
          '#B9FFCE', // Green
        ][Math.floor(Math.random() * 4)],
        height: random(0.8, 1.5),
      };
    });
  }, [crystalCount, tankSize]);
  
  // Initialize audio
  useEffect(() => {
    // Setup error handler for WebGL context loss
    const handleContextLoss = () => {
      toast({
        title: "Graphics Error",
        description: "WebGL context lost. Try refreshing the page.",
        variant: "destructive"
      });
    };
    
    window.addEventListener('webglcontextlost', handleContextLoss);

    const handleClick = () => {
      try {
        audioManager.play();
      } catch (error) {
        console.error('Audio play error:', error);
        toast({
          title: "Audio Error",
          description: "Couldn't play audio. Try refreshing the page.",
          variant: "destructive"
        });
      }
      document.removeEventListener('click', handleClick);
    };

    try {
      audioManager.initialize('/audio/main_theme.wav');
      document.addEventListener('click', handleClick);
    } catch (error) {
      console.error('Audio initialization error:', error);
    }
    
    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('webglcontextlost', handleContextLoss);
      try {
        audioManager.pause();
      } catch (error) {
        console.error('Audio pause error:', error);
      }
    };
  }, []);
  
  return (
    <Canvas 
      className="w-full h-full"
      style={{ background: 'linear-gradient(to bottom, #1A1F2C, #222744)' }}
      gl={{ 
        antialias: true,
        depth: true,
        alpha: false,
        stencil: false,
      }}
    >
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <MouseTracker setMousePosition={setMousePosition} />
          
          <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={60} />
          <Lighting />

          <AudioReactiveElements
            mousePosition={mousePosition}
            tankSize={tankSize}
            fishData={fishData}
            plantPositions={plantPositions}
            crystalData={crystalData}
          />
          
          {process.env.NODE_ENV === 'development' && <Stats />}
        </Suspense>
      </ErrorBoundary>
    </Canvas>
  );
}
