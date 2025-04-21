import { useState, useEffect, useCallback } from "react";
import { coinSound } from "@/assets/sounds/coin";
import { gameOverSound } from "@/assets/sounds/gameOver";
import { selectSound } from "@/assets/sounds/select";
import { eatSound } from "@/assets/sounds/eat";

type SoundType = 'coin' | 'gameOver' | 'select' | 'eat';

export function useSound() {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    // Get initial mute state from localStorage
    const storedMute = localStorage.getItem("arcadeMuted");
    return storedMute ? JSON.parse(storedMute) : false;
  });

  // Initialize AudioContext on first user interaction
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Audio buffers
  const [sounds, setSounds] = useState<Record<SoundType, AudioBuffer | null>>({
    coin: null,
    gameOver: null,
    select: null,
    eat: null,
  });

  // Initialize AudioContext on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContext) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
        
        // Remove listener after initialization
        window.removeEventListener('click', initAudio);
        window.removeEventListener('keydown', initAudio);
      }
    };
    
    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);
    
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, [audioContext]);

  // Create audio buffers from base64 encoded sounds
  useEffect(() => {
    if (!audioContext) return;
    
    const loadSound = async (base64Sound: string, soundName: SoundType): Promise<void> => {
      try {
        const response = await fetch(`data:audio/wav;base64,${base64Sound}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch sound: ${soundName}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Update just this sound
        setSounds(prev => ({
          ...prev,
          [soundName]: audioBuffer
        }));
        
        console.log(`Sound loaded: ${soundName}`);
      } catch (err) {
        console.error(`Failed to load sound: ${soundName}`, err);
      }
    };
    
    // Load each sound independently, don't rely on Promise.all
    // This way if one sound fails, the others can still load
    loadSound(coinSound, 'coin');
    loadSound(gameOverSound, 'gameOver');
    loadSound(selectSound, 'select');
    loadSound(eatSound, 'eat');
    
    // Cleanup function
    return () => {
      if (audioContext.state !== 'closed') {
        audioContext.close().catch(err => {
          console.error("Error closing audio context:", err);
        });
      }
    };
  }, [audioContext]);

  // Save mute state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("arcadeMuted", JSON.stringify(isMuted));
  }, [isMuted]);

  // Toggle mute function
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Play sound function with error handling and forced initialization
  const playSound = useCallback((soundType: SoundType) => {
    if (isMuted) return;
    
    try {
      // Create AudioContext if it doesn't exist
      if (!audioContext) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
        console.log("Audio context created on demand");
        // Can't play now but will be ready for next sound
        return;
      }
      
      // Resume audio context if it's suspended (needed for some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // Check if sound buffer exists
      if (!sounds[soundType]) {
        console.log(`Sound buffer for ${soundType} not loaded yet`);
        return;
      }
      
      // Create and play sound
      const source = audioContext.createBufferSource();
      source.buffer = sounds[soundType];
      
      // Add a gain node to control volume
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.2; // Set volume to 20%
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Play sound
      source.start(0);
      console.log(`Playing sound: ${soundType}`);
    } catch (err) {
      console.error("Error playing sound:", err);
    }
  }, [isMuted, audioContext, sounds]);

  return {
    isMuted,
    toggleMute,
    playSound,
  };
}
