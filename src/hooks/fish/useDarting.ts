
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface UseDartingProps {
  fishPosition: THREE.Vector3;
  crystalPositions: THREE.Vector3[];
  dartingChance: number;
  dartingForce: number;
  dartingDuration: number;
}

export const useDarting = ({
  fishPosition,
  crystalPositions,
  dartingChance,
  dartingForce,
  dartingDuration
}: UseDartingProps) => {
  const [isDarting, setIsDarting] = useState(false);
  const dartDirectionRef = useRef(new THREE.Vector3());
  
  useEffect(() => {
    if (!isDarting && Math.random() < dartingChance) {
      setIsDarting(true);
      
      if (crystalPositions.length > 0) {
        // Find closest crystal and dart away from it
        let closestDist = Infinity;
        let closestCrystal = crystalPositions[0];
        
        crystalPositions.forEach(crystal => {
          const dist = fishPosition.distanceTo(crystal);
          if (dist < closestDist) {
            closestDist = dist;
            closestCrystal = crystal;
          }
        });
        
        dartDirectionRef.current.copy(fishPosition)
          .sub(closestCrystal)
          .normalize()
          .multiplyScalar(dartingForce);
      } else {
        // Random darting direction
        dartDirectionRef.current.set(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize().multiplyScalar(dartingForce);
      }
      
      setTimeout(() => setIsDarting(false), dartingDuration * 1000);
    }
  }, [isDarting, dartingChance, dartingForce, dartingDuration, fishPosition, crystalPositions]);
  
  return {
    isDarting,
    dartDirection: dartDirectionRef.current
  };
};
