
import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface WaterTankProps {
  size: [number, number, number];
  children: React.ReactNode;
  audioLevel?: number;
  useSimpleMaterial?: boolean;
}

export function WaterTank({ 
  size, 
  children, 
  audioLevel = 0,
  useSimpleMaterial = false
}: WaterTankProps) {
  const [width, height, depth] = size;
  const waterRef = useRef<THREE.Mesh>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();
  
  // Auto-detect if we need to use simple materials
  const [shouldUseSimpleMaterial, setShouldUseSimpleMaterial] = useState(useSimpleMaterial);
  const [materialFailure, setMaterialFailure] = useState(false);
  
  // Performance monitoring
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;
    
    const checkPerformance = () => {
      frameCount++;
      const now = performance.now();
      
      if (now - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = now;
        
        // If FPS drops below threshold, switch to simple materials
        if (fps < 30 && !shouldUseSimpleMaterial) {
          console.log('Low performance detected, switching to simple materials');
          setShouldUseSimpleMaterial(true);
        }
      }
      
      requestAnimationFrame(checkPerformance);
    };
    
    const handle = requestAnimationFrame(checkPerformance);
    
    return () => cancelAnimationFrame(handle);
  }, [shouldUseSimpleMaterial]);

  // Material creation with error handling
  const waterMaterial = useMemo(() => {
    try {
      if (shouldUseSimpleMaterial || materialFailure) {
        return new THREE.MeshBasicMaterial({
          color: "#66ccff",
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide
        });
      } else {
        return new THREE.MeshPhysicalMaterial({
          color: "#66ccff",
          transparent: true,
          opacity: 0.2,
          transmission: 0.95,
          thickness: 0.5,
          roughness: 0.1,
          ior: 1.33,
          side: THREE.DoubleSide
        });
      }
    } catch (error) {
      console.error("Failed to create water material:", error);
      setMaterialFailure(true);
      return new THREE.MeshBasicMaterial({
        color: "#66ccff",
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
      });
    }
  }, [shouldUseSimpleMaterial, materialFailure]);

  const glassMaterial = useMemo(() => {
    try {
      if (shouldUseSimpleMaterial || materialFailure) {
        return new THREE.MeshBasicMaterial({
          color: "#F6F7FF",
          transparent: true,
          opacity: 0.2,
          side: THREE.BackSide
        });
      } else {
        return new THREE.MeshPhysicalMaterial({
          color: "#F6F7FF",
          transparent: true,
          opacity: 0.2,
          transmission: 0.95,
          thickness: 0.25,
          roughness: 0.05,
          ior: 1.52,
          side: THREE.BackSide
        });
      }
    } catch (error) {
      console.error("Failed to create glass material:", error);
      setMaterialFailure(true);
      return new THREE.MeshBasicMaterial({
        color: "#F6F7FF",
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
      });
    }
  }, [shouldUseSimpleMaterial, materialFailure]);

  useFrame(({ clock }) => {
    if (!waterRef.current) return;
    
    try {
      // Simple water animation
      const time = clock.getElapsedTime();
      waterRef.current.rotation.y = Math.sin(time * 0.1) * 0.05;
      
      // Audio-reactive water movement
      if (audioLevel > 0.1) {
        waterRef.current.position.y = Math.sin(time * 2) * audioLevel * 0.2;
      }
    } catch (error) {
      console.error("Water animation error:", error);
    }
  });

  // thickness for the glass walls
  const wallThickness = 0.25;

  return (
    <group>
      {/* Water volume */}
      <mesh
        ref={waterRef}
        position={[0, 0, 0]}
      >
        <boxGeometry args={[width * 0.98, height * 0.98, depth * 0.98]} />
        <primitive object={waterMaterial} attach="material" />
      </mesh>
      
      {/* Glass walls */}
      <mesh 
        ref={glassRef}
        position={[0, 0, 0]}
      >
        <boxGeometry
          args={[
            width + wallThickness,
            height + wallThickness,
            depth + wallThickness,
          ]}
        />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      
      {/* Tank contents */}
      <group position={[0, 0, 0]}>
        {children}
      </group>
    </group>
  );
}

WaterTank.displayName = 'WaterTank';
