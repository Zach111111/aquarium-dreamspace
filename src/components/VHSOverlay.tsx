
import { useState, useEffect } from 'react';

export function VHSOverlay() {
  const [glitchActive, setGlitchActive] = useState(false);
  
  // Reduce random glitch triggers to improve performance
  useEffect(() => {
    const triggerGlitch = () => {
      // Random chance to trigger a glitch - reduced probability
      if (Math.random() > 0.85) {
        setGlitchActive(true);
        
        // Shorter glitch duration 
        const duration = Math.random() * 300 + 100;
        
        setTimeout(() => {
          setGlitchActive(false);
        }, duration);
      }
    };
    
    // Less frequent glitch checks
    const interval = setInterval(() => {
      triggerGlitch();
    }, Math.random() * 5000 + 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Simplified overlay with fewer dynamic elements
  return (
    <div className="pointer-events-none fixed inset-0 z-10 opacity-80">
      {/* Scanlines effect - always visible but with reduced opacity */}
      <div className="absolute inset-0 bg-scanlines opacity-10"></div>
      
      {/* Simplified VHS tracking lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 animate-scanline opacity-5 bg-gradient-to-b from-transparent via-white to-transparent" style={{ height: '4px' }}></div>
      </div>
      
      {/* Minimal glitch effects */}
      {glitchActive && (
        <div className="absolute inset-0 opacity-20 mix-blend-screen bg-aquarium-pink" style={{ transform: 'translateX(3px)' }}></div>
      )}
      
      {/* Simplified CRT edge darkening */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-15"></div>
    </div>
  );
}
