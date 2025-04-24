
import { useFrame } from '@react-three/fiber';
import { RefObject } from 'react';
import * as THREE from 'three';
import { createWaterWave, createAudioWave } from '../utils/geometryUtils';

interface UseWaterAnimationProps {
  waterRef: RefObject<THREE.Mesh>;
  waterSurfaceRef: RefObject<THREE.Mesh>;
  width: number;
  height: number;
  depth: number;
  audioLevel: number;
}

export const useWaterAnimation = ({ 
  waterRef, 
  waterSurfaceRef, 
  width, 
  height, 
  depth,
  audioLevel 
}: UseWaterAnimationProps) => {
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Animate water volume with subtle rotation
    if (waterRef.current) {
      waterRef.current.rotation.y = Math.sin(time * 0.1) * 0.02;
    }
    
    // Dynamic water surface animation
    if (waterSurfaceRef.current && waterSurfaceRef.current.geometry) {
      const geometry = waterSurfaceRef.current.geometry;
      const position = geometry.attributes.position;
      
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const z = position.getZ(i);
        
        // Use the new utility functions
        const waveHeight = createWaterWave(x, z, time);
        const audioWave = createAudioWave(x, z, time, audioLevel);
        
        const y = waveHeight + audioWave;
        position.setY(i, y + height * 0.95 / 2);
      }
      
      position.needsUpdate = true;
    }
  });
};
