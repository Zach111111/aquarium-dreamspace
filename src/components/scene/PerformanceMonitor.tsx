
import { useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";

interface PerformanceMonitorProps {
  onPerformanceChange: (useSimpleMaterials: boolean) => void;
}

export function PerformanceMonitor({ onPerformanceChange }: PerformanceMonitorProps) {
  const [simpleMaterials, setSimpleMaterials] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let isMounted = true;
    
    const checkPerformance = () => {
      if (!isMounted) return;
      
      frameCount++;
      const now = performance.now();
      
      if (now - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = now;
        
        if (fps < 30 && !simpleMaterials) {
          console.log('Low FPS detected, switching to simple materials');
          setSimpleMaterials(true);
          onPerformanceChange(true);
          toast({
            title: "Performance Mode Enabled",
            description: "Switched to simpler materials for better performance.",
          });
        } else if (fps > 50 && simpleMaterials) {
          console.log('Performance improved, using advanced materials');
          setSimpleMaterials(false);
          onPerformanceChange(false);
        }
      }
      
      requestAnimationFrame(checkPerformance);
    };
    
    const handle = requestAnimationFrame(checkPerformance);
    return () => {
      isMounted = false;
      cancelAnimationFrame(handle);
    };
  }, [simpleMaterials, onPerformanceChange]);

  return null;
}
