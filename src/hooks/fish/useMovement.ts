
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
  useFrame(({ clock }) => {
    if (!fishRef.current) return;
    
    const deltaTime = clock.getDelta();
    const time = clock.getElapsedTime();
    
    const maxSpeed = isDarting ? speed * 1.5 : speed;
    const targetVelocity = new THREE.Vector3();
    
    if (isDarting) {
      targetVelocity.copy(dartDirection);
    } else {
      targetVelocity.subVectors(targetPosition, fishRef.current.position)
        .normalize()
        .multiplyScalar(maxSpeed);
    }
    
    // Add noise for natural movement
    targetVelocity.x += noise3D(time * 0.5, 0, 0) * 0.1;
    targetVelocity.y += noise3D(time * 0.5, 100, 0) * 0.1;
    targetVelocity.z += noise3D(time * 0.5, 200, 0) * 0.1;
    
    // Apply movement
    const frameSpeed = targetVelocity.length() * deltaTime;
    if (frameSpeed > 0.001) {
      fishRef.current.position.addScaledVector(targetVelocity, deltaTime);
      fishRef.current.position.copy(
        calculateBoundedPosition(fishRef.current.position, bounds)
      );
      
      // Update fish orientation
      if (targetVelocity.length() > 0.1) {
        const direction = targetVelocity.clone().normalize();
        fishRef.current.lookAt(
          fishRef.current.position.clone().add(direction)
        );
        fishRef.current.rotation.z = targetVelocity.y * 0.7;
      }
    }
  });
};
