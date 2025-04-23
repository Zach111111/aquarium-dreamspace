
import { useState, useEffect } from 'react';
import { AquariumScene } from '../components/AquariumScene';
import { VHSOverlay } from '../components/VHSOverlay';
import { ExploreMenu } from '../components/ExploreMenu';
import { MenuButton } from '../components/MenuButton';
import { WinScreen } from '../components/WinScreen';
import { useAquariumStore } from '../store/aquariumStore';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isMenuOpen = useAquariumStore(state => state.isMenuOpen);
  const gameWon = useAquariumStore(state => state.gameWon);
  const [debugMode] = useState(false);

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
      setLoadingProgress(progress);
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  if (debugMode) {
    return <div style={{color:'red', padding: '20px', fontSize: '24px'}}>HELLO WORLD DEBUG MODE</div>;
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full bg-[#1A1F2C] text-aquarium-white">
          <div className="w-32 h-32 mb-8 relative">
            <div className="absolute inset-0 rounded-full bg-aquarium-blue/20"></div>
            <div 
              className="absolute inset-0 rounded-full bg-aquarium-blue animate-pulse"
              style={{ 
                transform: `scale(${loadingProgress / 100})`,
                transition: 'transform 0.3s ease'
              }}
            ></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl font-bold text-aquarium-white">
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
        </div>
      ) : (
        <>
          <AquariumScene />
          <VHSOverlay />
          <MenuButton />
          <ExploreMenu isVisible={isMenuOpen} />
          
          {gameWon && <WinScreen />}
          
          <div className="absolute top-5 left-5 text-aquarium-white z-10">
            <h1 className="text-xl font-bold tracking-wider bg-black/30 px-3 py-1 rounded">
              AQUARIUM<span className="text-aquarium-blue">DREAMSPACE</span>
            </h1>
          </div>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-aquarium-white/80 text-center text-xs bg-black/40 px-4 py-2 rounded-full z-10">
            <p>CLICK TO INTERACT • PRESS MENU TO ADJUST SETTINGS</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
