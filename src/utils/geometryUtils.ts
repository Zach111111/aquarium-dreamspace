
import * as THREE from 'three';
import { noise2D, noise3D } from './noise';

// Create wave pattern for water surface
export function createWaterWave(
  x: number, 
  z: number, 
  time: number, 
  noiseScale: number = 0.3, 
  waveSpeed: number = 0.4
): number {
  return 0.05 * noise2D(
    x * noiseScale + time * waveSpeed, 
    z * noiseScale + time * waveSpeed * 0.8
  );
}

// Create audio-reactive wave
export function createAudioWave(
  x: number, 
  z: number, 
  time: number, 
  audioLevel: number = 0
): number {
  const audioFactor = audioLevel * 0.15;
  return audioFactor * Math.sin(time * 5 + x * 2 + z * 2);
}

// Calculate 3D vector within tank bounds
export function calculateBoundedPosition(
  position: THREE.Vector3,
  bounds: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number },
  buffer: number = 0.1
): THREE.Vector3 {
  const clampedX = THREE.MathUtils.clamp(
    position.x, 
    bounds.minX + buffer, 
    bounds.maxX - buffer
  );
  
  const clampedY = THREE.MathUtils.clamp(
    position.y, 
    bounds.minY + buffer, 
    bounds.maxY - buffer
  );
  
  const clampedZ = THREE.MathUtils.clamp(
    position.z, 
    bounds.minZ + buffer, 
    bounds.maxZ - buffer
  );
  
  return new THREE.Vector3(clampedX, clampedY, clampedZ);
}

// Generate a position inside tank with margin
export function generatePositionInTank(
  tankSize: [number, number, number], 
  marginFactor: number = 0.8
): THREE.Vector3 {
  const [width, height, depth] = tankSize;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const halfDepth = depth / 2;
  
  return new THREE.Vector3(
    THREE.MathUtils.randFloatSpread(halfWidth * 2 * marginFactor),
    THREE.MathUtils.randFloatSpread(halfHeight * 2 * marginFactor),
    THREE.MathUtils.randFloatSpread(halfDepth * 2 * marginFactor)
  );
}
