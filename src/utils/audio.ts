
class AudioManager {
  private audioContext: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private audioSource: MediaElementAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array = new Uint8Array();
  private gainNode: GainNode | null = null;

  initialize(audioSrc: string): void {
    if (typeof window === 'undefined') return;

    // Create audio context
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContext();
    
    // Create audio element
    this.audioElement = new Audio(audioSrc);
    this.audioElement.loop = true;
    
    // Create audio source from element
    this.audioSource = this.audioContext.createMediaElementSource(this.audioElement);
    
    // Create analyzer for frequency data
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
    
    // Create gain node for volume control
    this.gainNode = this.audioContext.createGain();
    
    // Connect audio graph
    this.audioSource.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }
  
  play(): void {
    if (this.audioElement && this.audioContext) {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      this.audioElement.play()
        .catch(error => console.error("Audio play error:", error));
    }
  }
  
  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }
  
  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }
  
  getFrequencyData(): Uint8Array {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.dataArray);
    }
    return this.dataArray;
  }
  
  // Returns average bass, mid, and treble frequencies
  getAudioLevels(): { bass: number; mid: number; treble: number } {
    // Default to 0 if no data
    let bass = 0;
    let mid = 0;
    let treble = 0;
    
    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.dataArray);
      
      // Simple division of frequency range
      // Bass: 0-7 (low frequencies)
      // Mid: 8-23 (mid frequencies)
      // Treble: 24-31 (high frequencies)
      const bassTotal = this.dataArray.slice(0, 8).reduce((sum, val) => sum + val, 0);
      const midTotal = this.dataArray.slice(8, 24).reduce((sum, val) => sum + val, 0);
      const trebleTotal = this.dataArray.slice(24, 32).reduce((sum, val) => sum + val, 0);
      
      bass = bassTotal / 8 / 255; // Normalize to 0-1
      mid = midTotal / 16 / 255;
      treble = trebleTotal / 8 / 255;
    }
    
    return { bass, mid, treble };
  }
}

// Singleton instance
export const audioManager = new AudioManager();
export default audioManager;
