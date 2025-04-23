
import { useState, useEffect } from 'react';
import { AquariumScene } from '../components/AquariumScene';
import { VHSOverlay } from '../components/VHSOverlay';
import { ExploreMenu } from '../components/ExploreMenu';
import { useAquariumStore } from '../store/aquariumStore';
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isMenuOpen = useAquariumStore(state => state.isMenuOpen);
  const [debugMode] = useState(false);
  
  // Simulate loading progress
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Delay to show 100% before removing loading screen
        setTimeout(() => {
          setIsLoading(false);
          console.log("Loading complete, showing aquarium scene");
          
          // Notify when scene is ready to render
          toast({
            title: "Aquarium Ready",
            description: "Welcome to the Aquarium Dreamspace!"
          });
        }, 500);
      }
      setLoadingProgress(progress);
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  // Error handling for WebGL support
  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    };
    
    if (!checkWebGL()) {
      toast({
        title: "WebGL Not Supported",
        description: "Your browser doesn't support 3D graphics. Try a different browser.",
        variant: "destructive"
      });
    }
  }, []);

  const skipLoading = () => {
    setIsLoading(false);
    console.log("Loading skipped, showing aquarium scene");
  };

  if (debugMode) {
    return <div style={{color:'red', padding: '20px', fontSize: '24px'}}>HELLO WORLD DEBUG MODE</div>;
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      {isLoading ? (
        // PS2-style loading screen
        <div className="flex flex-col items-center justify-center h-full bg-[#1A1F2C] text-aquarium-white">
          <div className="w-64 h-64 mb-8 relative">
            <div className="absolute inset-0 rounded-full border-4 border-aquarium-blue/30"></div>
            <div 
              className="absolute top-0 bottom-0 left-0 rounded-l-full border-4 border-aquarium-blue"
              style={{ 
                width: `${loadingProgress / 2}%`,
                borderRight: 'none',
                transform: `rotate(${loadingProgress * 3.6}deg)`,
                transformOrigin: 'center right',
                transition: 'all 0.2s ease'
              }}
            ></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl font-bold text-aquarium-blue animate-pulse-light">
                {Math.round(loadingProgress)}%
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-aquarium-white mb-4 tracking-wider">
            AQUARIUM<span className="text-aquarium-blue">DREAMSPACE</span>
          </h1>
          
          <div className="text-sm text-aquarium-white/70 animate-pulse">
            LOADING ASSETS...
          </div>
          
          <button 
            onClick={skipLoading}
            className="mt-8 text-xs text-aquarium-white/50 hover:text-aquarium-white/80 transition-colors"
          >
            PRESS ANY KEY TO START
          </button>
        </div>
      ) : (
        // Main aquarium scene - modified to prevent VHS overlay from causing re-renders
        <>
          <AquariumScene />
          {/* Disable VHS overlay temporarily to isolate rendering issues */}
          <div className="z-5">
            <VHSOverlay />
          </div>
          <ExploreMenu isVisible={isMenuOpen} />
          
          {/* Info text */}
          <div className="absolute top-5 left-5 text-aquarium-white z-10">
            <h1 className="text-xl font-bold tracking-wider bg-black/30 px-3 py-1 rounded">
              AQUARIUM<span className="text-aquarium-blue">DREAMSPACE</span>
            </h1>
          </div>
          
          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-aquarium-white/80 text-center text-xs bg-black/40 px-4 py-2 rounded-full z-10">
            <p>CLICK TO INTERACT • DRAG CRYSTALS • LONG-PRESS FOR MENU</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
