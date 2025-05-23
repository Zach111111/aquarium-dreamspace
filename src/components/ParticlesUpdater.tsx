
import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticlesUpdaterProps {
  particlesRef: React.RefObject<THREE.Points>;
  velocities: THREE.Vector3[];
  tankSize: [number, number, number];
  mousePosition?: THREE.Vector3 | null;
  audioLevel?: number;
  size?: number;
}

export function ParticlesUpdater({ 
  particlesRef, 
  velocities, 
  tankSize,
  mousePosition,
  audioLevel = 0,
  size = 0.05
}: ParticlesUpdaterProps) {
  const [tankWidth, tankHeight, tankDepth] = tankSize;
  
  // Update particles on each frame
  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    
    const time = clock.getElapsedTime();
    const particleMesh = particlesRef.current;
    const positions = particleMesh.geometry.attributes.position.array as Float32Array;
    const count = velocities.length;
    
    // Mouse attraction force
    const mouseForce = mousePosition ? 0.02 : 0;
    
    // Audio reactivity - increase particle speed with audio level
    const speedFactor = 1 + audioLevel * 2;
    
    // Update each particle position
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let x = positions[i3];
      let y = positions[i3 + 1];
      let z = positions[i3 + 2];
      
      // Apply velocity
      const velocity = velocities[i];
      x += velocity.x * speedFactor;
      y += velocity.y * speedFactor;
      z += velocity.z * speedFactor;
      
      // Add slight wave motion
      x += Math.sin(time * 0.5 + i * 0.1) * 0.002;
      y += Math.cos(time * 0.3 + i * 0.05) * 0.001;
      
      // Mouse attraction if mouse position exists
      if (mousePosition) {
        const dx = mousePosition.x - x;
        const dy = mousePosition.y - y;
        const dz = mousePosition.z - z;
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (distance < 2) {
          // Attract particles toward mouse position
          x += (dx / distance) * mouseForce;
          y += (dy / distance) * mouseForce;
          z += (dz / distance) * mouseForce;
          
          // Update velocity to match movement direction
          velocity.set(
            velocity.x * 0.98 + (dx / distance) * 0.02,
            velocity.y * 0.98 + (dy / distance) * 0.02,
            velocity.z * 0.98 + (dz / distance) * 0.02
          );
        }
      }
      
      // Bounce off tank walls
      const boundaryX = tankWidth * 0.5 * 0.9;
      const boundaryY = tankHeight * 0.5 * 0.9;
      const boundaryZ = tankDepth * 0.5 * 0.9;
      
      if (Math.abs(x) > boundaryX) {
        velocity.x *= -1;
        x = Math.sign(x) * boundaryX;
      }
      
      if (Math.abs(y) > boundaryY) {
        velocity.y *= -1;
        y = Math.sign(y) * boundaryY;
      }
      
      if (Math.abs(z) > boundaryZ) {
        velocity.z *= -1;
        z = Math.sign(z) * boundaryZ;
      }
      
      // Store updated position
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
    }
    
    // Update particle size based on audio level
    if (particleMesh.material instanceof THREE.PointsMaterial) {
      particleMesh.material.size = size * (1 + audioLevel * 0.5);
    }
    
    particleMesh.geometry.attributes.position.needsUpdate = true;
  });

  return null; // This component doesn't render anything
}

ParticlesUpdater.displayName = 'ParticlesUpdater';
