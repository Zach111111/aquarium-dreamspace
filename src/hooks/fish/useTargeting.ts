import { useRef } from 'react';
import { Vector3, Group } from 'three';

interface FishTarget {
  position: Vector3;
  weight: number;
  type: 'crystal' | 'group' | 'random';
}

interface UseTargetingProps {
  fishPosition: Vector3;
  crystalPositions: Vector3[];
  groupFishRefs: React.MutableRefObject<Group | null>[];
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
  const targets: FishTarget[] = [];
  
  // Add crystal targets
  crystalPositions.forEach(crystalPos => {
    const distToCrystal = fishPosition.distanceTo(crystalPos);
    const attractionZone = 4.0;
    
    if (distToCrystal < attractionZone) {
      const weight = crystalAttraction * 
        Math.max(0.1, Math.min(1.0, (attractionZone - distToCrystal) / attractionZone));
      
      if (distToCrystal < 1.5) {
        // Orbital movement around crystal
        const orbitPos = new Vector3().copy(crystalPos);
        const angle = Date.now() * 0.001;
        const orbitRadius = 1.0;
        orbitPos.x += Math.sin(angle) * orbitRadius;
        orbitPos.z += Math.cos(angle) * orbitRadius;
        
        targets.push({
          position: orbitPos,
          weight: weight * 1.5,
          type: 'crystal'
        });
      } else {
        targets.push({
          position: crystalPos,
          weight,
          type: 'crystal'
        });
      }
    }
  });
  
  // Add group cohesion
  if (groupFishRefs.length > 1) {
    let groupCenter = new Vector3();
    let fishCount = 0;
    
    groupFishRefs.forEach(ref => {
      if (ref.current && fishPosition.distanceTo(ref.current.position) < 4) {
        groupCenter.add(ref.current.position);
        fishCount++;
      }
    });
    
    if (fishCount > 0) {
      groupCenter.divideScalar(fishCount);
      targets.push({
        position: groupCenter,
        weight: groupCohesion,
        type: 'group'
      });
    }
  }
  
  return targets;
};
