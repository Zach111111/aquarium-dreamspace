
import { Settings } from 'lucide-react';
import { useAquariumStore } from '../store/aquariumStore';
import { Button } from '@/components/ui/button';

export function MenuButton() {
  const { isMenuOpen, toggleMenu } = useAquariumStore();
  
  return (
    <Button 
      variant="outline"
      size="icon"
      className="fixed top-5 right-5 z-20 rounded-full bg-black/40 backdrop-blur-sm border border-aquarium-blue/30 text-aquarium-white hover:bg-black/60"
      onClick={toggleMenu}
      aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
    >
      <Settings size={20} className="text-aquarium-blue" />
    </Button>
  );
}
