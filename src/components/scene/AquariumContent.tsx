
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';

import { Lighting } from '../Lighting';
import { LoadingFallback } from '../LoadingFallback';
import { ErrorBoundary } from '../ErrorBoundary';
import { WaterTank } from '../WaterTank';
import { Fish } from '../Fish';
import { Plant } from '../Plant';
import { Kelp } from '../Kelp';
import { Crystal } from '../Crystal';
import { Particles } from '../Particles';
import { PostProcessing } from '../PostProcessing';
import { useAquariumStore } from '../../store/aquariumStore';
import { random } from '../../utils/noise';

const AquariumContent = () => {
  const [mousePosition, setMousePosition] = useState<THREE.Vector3 | null>(null);
  const tankSize: [number, number, number] = [10, 6, 10];
  const orbitSpeed = useAquariumStore(state => state.orbitSpeed);
  const [fishWorldPositions, setFishWorldPositions] = useState<THREE.Vector3[]>([]);
  
  // Use Group for fish refs
  const fishRefs = useRef<Array<THREE.Group | null>>([]);
  
  // Initialize with nulls
  useMemo(() => {
    fishRefs.current = Array(7).fill(null);
  }, []);
  
  // Fish data
  const fishData = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => ({
      scale: 0.7 + Math.random() * 0.5,
      speed: 0.68 + Math.random() * 0.58,
      color: `hsl(${index * 33 + 165}, 73%, ${47 + index * 4}%)`
    }));
  }, []);

  // Plant positions
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

  // Kelp positions
  const kelpPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    positions.push([0, -tankSize[1] / 2 * 0.98, -tankSize[2] * 0.42]);
    positions.push([-tankSize[0]*0.38, -tankSize[1]/2 * 0.98, -tankSize[2]*0.39]);
    positions.push([tankSize[0]*0.38, -tankSize[1]/2 * 0.98, -tankSize[2]*0.40]);
    positions.push([random(-tankSize[0]*0.25, tankSize[0]*0.25), -tankSize[1]/2 * 0.99, -tankSize[2]*0.31]);
    positions.push([random(-tankSize[0]*0.29, tankSize[0]*0.29), -tankSize[1]/2 * 0.99, -tankSize[2]*0.36]);
    return positions;
  }, [tankSize]);

  // Crystal data
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

  // Three.js hooks with safer error handling
  const { raycaster, camera, mouse } = useThree();
  const planeXZ = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const intersectionPoint = useMemo(() => new THREE.Vector3(), []);
  
  // Track fish positions with error handling
  const updateFishPositions = useCallback(() => {
    try {
      const positions: THREE.Vector3[] = [];
      
      if (fishRefs.current) {
        for (let i = 0; i < fishRefs.current.length; i++) {
          const fishRef = fishRefs.current[i];
          if (fishRef && fishRef.position) {
            positions.push(fishRef.position.clone());
          }
        }
        
        if (positions.length > 0) {
          setFishWorldPositions(positions);
        }
      }
    } catch (error) {
      console.error("Error updating fish positions:", error);
    }
  }, []);
  
  useFrame(() => {
    try {
      // Mouse tracking
      raycaster.setFromCamera(mouse, camera);
      if (raycaster.ray.intersectPlane(planeXZ, intersectionPoint)) {
        setMousePosition(intersectionPoint.clone());
      }
      
      // Update fish positions - less frequently to improve performance
      if (Math.random() < 0.1) { // Only update 10% of frames
        updateFishPositions();
      }
    } catch (error) {
      console.error("Frame update error:", error);
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
      
      <ErrorBoundary>
        <React.Suspense fallback={<LoadingFallback />}>
          <WaterTank size={tankSize} audioLevel={0}>
            {fishData.map((fish, i) => (
              <ErrorBoundary key={`fish-${i}`}>
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
              </ErrorBoundary>
            ))}
            
            {plantPositions.map((pos, i) => (
              <ErrorBoundary key={`plant-${i}`}>
                <Plant position={pos} />
              </ErrorBoundary>
            ))}
            
            {kelpPositions.map((pos, i) => (
              <ErrorBoundary key={`kelp-${i}`}>
                <Kelp position={pos} height={2.6 + Math.random()*1.7} />
              </ErrorBoundary>
            ))}
            
            {crystalData.map((crystal, i) => (
              <ErrorBoundary key={`crystal-${i}`}>
                <Crystal {...crystal} />
              </ErrorBoundary>
            ))}
          </WaterTank>
          
          <Particles
            tankSize={tankSize}
            mousePosition={mousePosition}
            count={42}
            audioLevel={0}
          />
          
          <PostProcessing audioLevel={0} />
        </React.Suspense>
      </ErrorBoundary>
    </>
  );
};

export default AquariumContent;
