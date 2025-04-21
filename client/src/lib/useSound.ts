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
    
    const loadSound = async (base64Sound: string): Promise<AudioBuffer> => {
      const response = await fetch(`data:audio/wav;base64,${base64Sound}`);
      const arrayBuffer = await response.arrayBuffer();
      return await audioContext.decodeAudioData(arrayBuffer);
    };
    
    const loadAllSounds = async () => {
      try {
        const [coinBuffer, gameOverBuffer, selectBuffer, eatBuffer] = await Promise.all([
          loadSound(coinSound),
          loadSound(gameOverSound),
          loadSound(selectSound),
          loadSound(eatSound),
        ]);
        
        setSounds({
          coin: coinBuffer,
          gameOver: gameOverBuffer,
          select: selectBuffer,
          eat: eatBuffer,
        });
      } catch (err) {
        console.error("Failed to load sound effects:", err);
      }
    };
    
    loadAllSounds();
  }, [audioContext]);

  // Save mute state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("arcadeMuted", JSON.stringify(isMuted));
  }, [isMuted]);

  // Toggle mute function
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Play sound function
  const playSound = useCallback((soundType: SoundType) => {
    if (isMuted || !audioContext || !sounds[soundType]) return;
    
    const source = audioContext.createBufferSource();
    source.buffer = sounds[soundType];
    source.connect(audioContext.destination);
    source.start();
  }, [isMuted, audioContext, sounds]);

  return {
    isMuted,
    toggleMute,
    playSound,
  };
}
