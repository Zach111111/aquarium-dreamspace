
import { useFrame } from '@react-three/fiber';
import { RefObject } from 'react';
import * as THREE from 'three';

interface UseBubbleAnimationProps {
  bubblesRef: RefObject<THREE.Points>;
  bubbleVelocitiesRef: RefObject<THREE.Vector3[]>;
  bubbleCount: number;
  width: number;
  height: number;
  depth: number;
}

export const useBubbleAnimation = ({ 
  bubblesRef, 
  bubbleVelocitiesRef, 
  bubbleCount,
  width,
  height,
  depth
}: UseBubbleAnimationProps) => {
  useFrame(() => {
    if (bubblesRef.current && bubblesRef.current.geometry) {
      const positions = bubblesRef.current.geometry.attributes.position;
      
      for (let i = 0; i < bubbleCount; i++) {
        positions.setX(i, positions.getX(i) + bubbleVelocitiesRef.current[i].x);
        positions.setY(i, positions.getY(i) + bubbleVelocitiesRef.current[i].y);
        positions.setZ(i, positions.getZ(i) + bubbleVelocitiesRef.current[i].z);
        
        bubbleVelocitiesRef.current[i].x += (Math.random() - 0.5) * 0.001;
        bubbleVelocitiesRef.current[i].z += (Math.random() - 0.5) * 0.001;
        
        if (Math.abs(positions.getX(i)) > width * 0.45) {
          bubbleVelocitiesRef.current[i].x *= -0.8;
        }
        
        if (Math.abs(positions.getZ(i)) > depth * 0.45) {
          bubbleVelocitiesRef.current[i].z *= -0.8;
        }
        
        if (positions.getY(i) > height * 0.45) {
          positions.setY(i, -height * 0.45 + Math.random() * 0.1);
          positions.setX(i, (Math.random() - 0.5) * width * 0.8);
          positions.setZ(i, (Math.random() - 0.5) * depth * 0.8);
        }
      }
      
      positions.needsUpdate = true;
    }
  });
};
