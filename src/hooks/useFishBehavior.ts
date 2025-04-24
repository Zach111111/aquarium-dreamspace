import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Group, Vector3, MathUtils } from 'three';
import { noise3D } from '../utils/noise';
import { calculateBoundedPosition } from '../utils/geometryUtils';
import { useAquariumStore } from '../store/aquariumStore';

interface FishTarget {
  position: Vector3;
  weight: number;
  type: 'crystal' | 'group' | 'random';
}

interface FishBehaviorProps {
  initialPosition: Vector3;
  fishSize: number;
  speed: number;
  personalityFactor: number;
  tankSize: [number, number, number];
  groupIndex: number;
  fishIndex: number;
  crystalPositions?: Vector3[];
  fishRefs?: React.MutableRefObject<Group | null>[];
  isFishLeader?: boolean;
}

export const useFishBehavior = ({
  initialPosition,
  fishSize,
  speed,
  personalityFactor,
  tankSize,
  groupIndex,
  fishIndex,
  crystalPositions = [],
  fishRefs = [],
  isFishLeader = false
}: FishBehaviorProps) => {
  const fishRef = useRef<Group>(null);
  const targetRef = useRef<Vector3>(new Vector3().copy(initialPosition));
  const velocityRef = useRef<Vector3>(new Vector3(0, 0, 0));
  const personalityRef = useRef({
    wanderlust: 0.5 + Math.random() * 0.5 * personalityFactor,
    crystalAttraction: 0.7 + Math.random() * 0.3,
    groupCohesion: isFishLeader ? 0.3 : 0.6 + Math.random() * 0.4,
    dartingChance: 0.005 * personalityFactor,
    dartingForce: 1.5 + Math.random() * 1.0,
    dartingDuration: 0.5 + Math.random() * 0.5, // seconds
  });
  const [isDarting, setIsDarting] = useState(false);
  const dartDirectionRef = useRef<Vector3>(new Vector3());
  const dartTimerRef = useRef<number>(0);
  
  const speedFactor = useAquariumStore(state => state.speedFactor);
  
  const [tankWidth, tankHeight, tankDepth] = tankSize;
  const bounds = useMemo(() => ({
    minX: -(tankWidth/2) * 0.8,
    maxX: (tankWidth/2) * 0.8,
    minY: -(tankHeight/2) * 0.8,
    maxY: (tankHeight/2) * 0.8,
    minZ: -(tankDepth/2) * 0.8,
    maxZ: (tankDepth/2) * 0.8
  }), [tankWidth, tankHeight, tankDepth]);

  // Handle darting behavior
  useEffect(() => {
    if (isDarting) {
      const timer = setTimeout(() => {
        setIsDarting(false);
      }, personalityRef.current.dartingDuration * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isDarting]);

  // Main movement logic
  useFrame(({ clock }) => {
    if (!fishRef.current) return;
    
    const time = clock.getElapsedTime();
    const deltaTime = clock.getDelta();
    const actualSpeed = speed * speedFactor;
    
    // Manage darting behavior
    if (!isDarting && Math.random() < personalityRef.current.dartingChance) {
      setIsDarting(true);
      // Dart away from closest crystal or in random direction if no crystals
      if (crystalPositions.length > 0) {
        const closestCrystal = findClosestTarget(fishRef.current.position, crystalPositions);
        dartDirectionRef.current.copy(fishRef.current.position)
          .sub(closestCrystal)
          .normalize()
          .multiplyScalar(personalityRef.current.dartingForce);
      } else {
        dartDirectionRef.current.set(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize().multiplyScalar(personalityRef.current.dartingForce);
      }
    }
    
    const targets: FishTarget[] = [];
    
    // Add crystal attraction targets
    crystalPositions.forEach(crystalPos => {
      const distToCrystal = fishRef.current!.position.distanceTo(crystalPos);
      const attractionZone = 4.0; // Attraction radius around crystals
      
      if (distToCrystal < attractionZone) {
        // Closer to crystal = stronger pull but with boundaries to prevent collision
        const weight = personalityRef.current.crystalAttraction * 
          Math.max(0.1, Math.min(1.0, (attractionZone - distToCrystal) / attractionZone));
        
        // If very close, add gentle circular motion
        if (distToCrystal < 1.5) {
          const orbitPos = new Vector3().copy(crystalPos);
          const angle = time * actualSpeed * 0.5 + fishIndex * 2;
          const orbitRadius = 1.0 + fishSize * 0.5;
          orbitPos.x += Math.sin(angle) * orbitRadius;
          orbitPos.z += Math.cos(angle) * orbitRadius;
          orbitPos.y += Math.sin(time + fishIndex) * 0.3;
          
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
    
    // Add group cohesion target (follow other fish)
    if (fishRefs.length > 1 && !isFishLeader) {
      // Find center of nearby fish in same group
      let groupCenter = new Vector3();
      let fishCount = 0;
      
      fishRefs.forEach(otherFishRef => {
        if (otherFishRef.current && otherFishRef.current !== fishRef.current) {
          const dist = fishRef.current.position.distanceTo(otherFishRef.current.position);
          if (dist < 4) { // Only consider nearby fish
            groupCenter.add(otherFishRef.current.position);
            fishCount++;
          }
        }
      });
      
      if (fishCount > 0) {
        groupCenter.divideScalar(fishCount);
        targets.push({
          position: groupCenter,
          weight: personalityRef.current.groupCohesion,
          type: 'group'
        });
      }
    }
    
    // Add wandering behavior if fish is not sufficiently attracted elsewhere
    if (targets.length === 0 || Math.random() < personalityRef.current.wanderlust * deltaTime) {
      // Create a new random target every so often
      if (Math.random() < 0.01 || targetRef.current.distanceTo(fishRef.current.position) < 0.5) {
        const randomOffset = 3;
        const newTarget = new Vector3(
          fishRef.current.position.x + (Math.random() - 0.5) * randomOffset,
          fishRef.current.position.y + (Math.random() - 0.5) * randomOffset,
          fishRef.current.position.z + (Math.random() - 0.5) * randomOffset
        );
        
        targetRef.current.copy(calculateBoundedPosition(newTarget, bounds, 1.0));
      }
      
      targets.push({
        position: targetRef.current,
        weight: 0.5,
        type: 'random'
      });
    }
    
    // Calculate blended target based on all influences
    const blendedTarget = calculateBlendedTarget(targets);
    
    // Calculate smooth movement using a velocity-based approach
    const maxSpeed = isDarting ? actualSpeed * personalityRef.current.dartingForce : actualSpeed;
    const targetVelocity = new Vector3();
    
    if (isDarting) {
      targetVelocity.copy(dartDirectionRef.current);
    } else {
      targetVelocity.subVectors(blendedTarget, fishRef.current.position).normalize().multiplyScalar(maxSpeed);
    }
    
    // Add some noise for natural movement
    targetVelocity.x += noise3D(time * 0.5, fishIndex, groupIndex) * 0.1;
    targetVelocity.y += noise3D(time * 0.5, fishIndex + 100, groupIndex) * 0.1;
    targetVelocity.z += noise3D(time * 0.5, fishIndex + 200, groupIndex) * 0.1;
    
    // Smoothly blend current velocity with target velocity
    const blendFactor = isDarting ? 0.2 : 0.05;
    velocityRef.current.lerp(targetVelocity, blendFactor);
    
    // Apply velocity
    const frameSpeed = velocityRef.current.length() * deltaTime;
    if (frameSpeed > 0.001) {
      fishRef.current.position.addScaledVector(velocityRef.current, deltaTime);
      
      // Keep within bounds
      fishRef.current.position.copy(
        calculateBoundedPosition(fishRef.current.position, bounds)
      );
      
      // Orient fish in direction of movement
      const direction = velocityRef.current.clone().normalize();
      if (direction.length() > 0.1) {
        const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(1, 0, 0), // Forward vector (local)
          direction
        );
        fishRef.current.quaternion.slerp(targetQuaternion, 0.1);
        
        // Add slight roll based on turning
        const turnIntensity = velocityRef.current.y * 0.7;
        fishRef.current.rotation.z = MathUtils.lerp(
          fishRef.current.rotation.z,
          turnIntensity,
          0.1
        );
      }
    }
  });
  
  return { fishRef };
};

// Helper function to find the closest target from a list
function findClosestTarget(position: Vector3, targets: Vector3[]): Vector3 {
  let closestTarget = targets[0];
  let minDistance = Infinity;
  
  targets.forEach(target => {
    const dist = position.distanceTo(target);
    if (dist < minDistance) {
      minDistance = dist;
      closestTarget = target;
    }
  });
  
  return closestTarget;
}

// Calculate blended target from multiple weighted influences
function calculateBlendedTarget(targets: FishTarget[]): Vector3 {
  if (targets.length === 0) return new Vector3();
  
  const blendedTarget = new Vector3();
  let totalWeight = 0;
  
  targets.forEach(target => {
    blendedTarget.add(target.position.clone().multiplyScalar(target.weight));
    totalWeight += target.weight;
  });
  
  if (totalWeight > 0) {
    blendedTarget.divideScalar(totalWeight);
  }
  
  return blendedTarget;
}
