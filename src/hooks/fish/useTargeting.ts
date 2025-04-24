
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface FishTarget {
  position: THREE.Vector3;
  weight: number;
  type: 'crystal' | 'group' | 'random';
}

interface UseTargetingProps {
  fishPosition: THREE.Vector3;
  crystalPositions: THREE.Vector3[];
  groupFishRefs: React.MutableRefObject<THREE.Group | null>[];
  personalityFactor: number;
  crystalAttraction: number;
  groupCohesion: number;
}

export const useTargeting = ({
  fishPosition,
  crystalPositions,
  groupFishRefs,
  personalityFactor,
  crystalAttraction,
  groupCohesion
}: UseTargetingProps) => {
  // Store the targets in a ref to avoid recreating the array every frame
  const targetsRef = useRef<FishTarget[]>([]);
  // Create a reusable vector for calculations
  const tempVector = useMemo(() => new THREE.Vector3(), []);
  // Create a reusable group center vector
  const groupCenter = useMemo(() => new THREE.Vector3(), []);
  
  // Clear previous targets and calculate new ones
  targetsRef.current = [];
  
  // Add crystal targets - only process crystals within attraction range
  crystalPositions.forEach(crystalPos => {
    const distToCrystal = fishPosition.distanceTo(crystalPos);
    const attractionZone = 4.0;
    
    if (distToCrystal < attractionZone) {
      const weight = crystalAttraction * 
        Math.max(0.1, Math.min(1.0, (attractionZone - distToCrystal) / attractionZone));
      
      if (distToCrystal < 1.5) {
        // Orbital movement around crystal using existing orbit vector
        const orbitPos = new THREE.Vector3().copy(crystalPos);
        const angle = Date.now() * 0.001;
        const orbitRadius = 1.0;
        orbitPos.x += Math.sin(angle) * orbitRadius;
        orbitPos.z += Math.cos(angle) * orbitRadius;
        
        targetsRef.current.push({
          position: orbitPos,
          weight: weight * 1.5,
          type: 'crystal'
        });
      } else {
        targetsRef.current.push({
          position: crystalPos,
          weight,
          type: 'crystal'
        });
      }
    }
  });
  
  // Add group cohesion
  if (groupFishRefs.length > 1) {
    // Reset the group center vector
    groupCenter.set(0, 0, 0);
    let fishCount = 0;
    
    groupFishRefs.forEach(ref => {
      if (ref.current && fishPosition.distanceTo(ref.current.position) < 4) {
        tempVector.copy(ref.current.position);
        groupCenter.add(tempVector);
        fishCount++;
      }
    });
    
    if (fishCount > 0) {
      groupCenter.divideScalar(fishCount);
      targetsRef.current.push({
        position: groupCenter,
        weight: groupCohesion,
        type: 'group'
      });
    }
  }
  
  return targetsRef.current;
};
