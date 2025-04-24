
import { useFrame } from '@react-three/fiber';
import { RefObject } from 'react';
import * as THREE from 'three';
import { noise2D, gerstnerWave } from '../utils/noise';

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
        
        const noiseScale = 0.3;
        const waveSpeed = 0.4;
        const nx = noise2D(x * noiseScale + time * waveSpeed, z * noiseScale + time * waveSpeed * 0.8);
        const waveHeight = 0.05 * nx;
        
        const audioFactor = audioLevel * 0.15;
        const audioWave = audioFactor * Math.sin(time * 5 + x * 2 + z * 2);
        
        const y = waveHeight + audioWave;
        position.setY(i, y + height * 0.95 / 2);
      }
      
      position.needsUpdate = true;
    }
  });
};
