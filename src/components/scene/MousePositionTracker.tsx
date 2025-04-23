
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { toast } from "@/components/ui/use-toast";

interface MouseTrackerProps {
  setMousePosition: (position: THREE.Vector3 | null) => void;
}

export function MousePositionTracker({ setMousePosition }: MouseTrackerProps) {
  const { camera, mouse, raycaster, scene } = useThree();
  const planeXZ = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const intersectionPoint = new THREE.Vector3();
  
  // Add WebGL context loss handler
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.error('WebGL context lost');
      toast({
        title: "Graphics Error",
        description: "WebGL context lost. Try refreshing the page.",
        variant: "destructive"
      });
      setMousePosition(null);
    };
    
    canvas.addEventListener('webglcontextlost', handleContextLost);
    return () => canvas.removeEventListener('webglcontextlost', handleContextLost);
  }, [setMousePosition]);

  // Update mouse position
  useEffect(() => {
    const updateMousePosition = () => {
      try {
        raycaster.setFromCamera(mouse, camera);
        if (raycaster.ray.intersectPlane(planeXZ, intersectionPoint)) {
          setMousePosition(intersectionPoint.clone());
        } else {
          setMousePosition(null);
        }
      } catch (error) {
        console.error("MouseTracker error:", error);
        setMousePosition(null);
      }
    };

    // Initial update
    updateMousePosition();

    // Add to render loop
    scene.onBeforeRender = updateMousePosition;
    
    return () => {
      scene.onBeforeRender = null;
    };
  }, [camera, mouse, raycaster, scene, setMousePosition]);
  
  return null;
}

