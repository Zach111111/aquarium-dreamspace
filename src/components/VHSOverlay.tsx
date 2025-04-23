
import { useState, useEffect } from 'react';

export function VHSOverlay() {
  const [glitchActive, setGlitchActive] = useState(false);
  
  // Randomly trigger glitch effects
  useEffect(() => {
    const triggerGlitch = () => {
      // Random chance to trigger a glitch
      if (Math.random() > 0.7) {
        setGlitchActive(true);
        
        // Glitch duration between 100-500ms
        const duration = Math.random() * 400 + 100;
        
        setTimeout(() => {
          setGlitchActive(false);
        }, duration);
      }
    };
    
    // Trigger glitch check every 2-5 seconds
    const interval = setInterval(() => {
      triggerGlitch();
    }, Math.random() * 3000 + 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {/* Scanlines effect - always visible */}
      <div className="absolute inset-0 bg-scanlines opacity-15"></div>
      
      {/* VHS tracking lines - always visible */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 animate-scanline opacity-10 bg-gradient-to-b from-transparent via-white to-transparent" style={{ height: '5px' }}></div>
      </div>
      
      {/* Random glitch effects */}
      {glitchActive && (
        <>
          {/* Horizontal color shift */}
          <div className="absolute inset-0 opacity-30 mix-blend-screen bg-aquarium-pink" style={{ transform: 'translateX(5px)' }}></div>
          <div className="absolute inset-0 opacity-30 mix-blend-screen bg-aquarium-blue" style={{ transform: 'translateX(-5px)' }}></div>
          
          {/* Random vertical glitch lines */}
          <div className="absolute inset-y-0 w-[2px] bg-white opacity-70" style={{ left: `${Math.random() * 100}%`, height: `${Math.random() * 50 + 10}%`, top: `${Math.random() * 50}%` }}></div>
          <div className="absolute inset-y-0 w-[2px] bg-white opacity-70" style={{ left: `${Math.random() * 100}%`, height: `${Math.random() * 50 + 10}%`, top: `${Math.random() * 50}%` }}></div>
        </>
      )}
      
      {/* CRT edge darkening */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-20"></div>
    </div>
  );
}
