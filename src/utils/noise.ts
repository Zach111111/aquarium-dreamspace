
import { createNoise2D, createNoise3D } from 'simplex-noise';

// Create 2D and 3D noise generators
export const noise2D = createNoise2D();
export const noise3D = createNoise3D();

// Generate random number between min and max
export const random = (min: number, max: number) => Math.random() * (max - min) + min;

// Lerp function for smooth transitions
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Clamp function
export const clamp = (value: number, min: number, max: number) => 
  Math.max(min, Math.min(max, value));

// Perlin noise-based movement for fish
export function perlinMovement(
  x: number, 
  y: number, 
  z: number, 
  time: number, 
  speed: number = 1, 
  scale: number = 1
): [number, number, number] {
  const nx = noise3D(x * scale, y * scale, time * speed) * 0.1;
  const ny = noise3D(x * scale, y * scale, time * speed + 100) * 0.1;
  const nz = noise3D(x * scale, y * scale, time * speed + 200) * 0.1;
  
  return [nx, ny, nz];
}

// Generate a position within the tank bounds
export function generatePositionInTank(width: number, height: number, depth: number): [number, number, number] {
  const x = random(-width / 2, width / 2);
  const y = random(-height / 2, height / 2);
  const z = random(-depth / 2, depth / 2);
  return [x, y, z];
}

// Calculate direction between two points (for fish to look where they're going)
export function calculateDirection(
  current: [number, number, number], 
  target: [number, number, number]
): [number, number, number] {
  const [x1, y1, z1] = current;
  const [x2, y2, z2] = target;
  
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dz = z2 - z1;
  
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  if (length === 0) return [0, 0, 0];
  
  return [dx / length, dy / length, dz / length];
}
