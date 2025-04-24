
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { calculateBoundedPosition } from '../../utils/geometryUtils';
import { noise3D } from '../../utils/noise';

interface UseMovementProps {
  fishRef: React.MutableRefObject<THREE.Group | null>;
  speed: number;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
  isDarting: boolean;
  dartDirection: THREE.Vector3;
  targetPosition: THREE.Vector3;
}

export const useMovement = ({
  fishRef,
  speed,
  bounds,
  isDarting,
  dartDirection,
  targetPosition
}: UseMovementProps) => {
  // Create reusable vectors to avoid creating new ones every frame
  const targetVelocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const lookAtPosition = new THREE.Vector3();

  useFrame(({ clock }) => {
    if (!fishRef.current) return;
    
    const deltaTime = clock.getDelta();
    const time = clock.getElapsedTime();
    
    const maxSpeed = isDarting ? speed * 1.5 : speed;
    
    // Reset target velocity
    targetVelocity.set(0, 0, 0);
    
    if (isDarting) {
      // Simply copy the dart direction during darting
      targetVelocity.copy(dartDirection);
    } else {
      // Calculate direction to target
      direction.subVectors(targetPosition, fishRef.current.position)
        .normalize()
        .multiplyScalar(maxSpeed);
      
      targetVelocity.copy(direction);
    }
    
    // Add noise for natural movement - use existing vector
    targetVelocity.x += noise3D(time * 0.5, 0, 0) * 0.1;
    targetVelocity.y += noise3D(time * 0.5, 100, 0) * 0.1;
    targetVelocity.z += noise3D(time * 0.5, 200, 0) * 0.1;
    
    // Apply movement
    const frameSpeed = targetVelocity.length() * deltaTime;
    if (frameSpeed > 0.001) {
      // Apply the velocity
      fishRef.current.position.addScaledVector(targetVelocity, deltaTime);
      
      // Check bounds and adjust position if needed
      fishRef.current.position.copy(
        calculateBoundedPosition(fishRef.current.position, bounds)
      );
      
      // Update fish orientation - use existing lookAt vector
      if (targetVelocity.length() > 0.1) {
        lookAtPosition.copy(fishRef.current.position).add(targetVelocity.normalize());
        fishRef.current.lookAt(lookAtPosition);
        
        // Add roll based on vertical velocity for more natural fish movement
        fishRef.current.rotation.z = targetVelocity.y * 0.7;
      }
    }
  });
};
