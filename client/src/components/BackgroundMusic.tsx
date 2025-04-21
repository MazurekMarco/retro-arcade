import { useEffect, useRef, useState } from 'react';
import { useSound } from '@/lib/useSound';

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isMuted } = useSound();
  const [isReady, setIsReady] = useState(false);

  // Initialize the audio on first user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!isReady && audioRef.current) {
        setIsReady(true);
        audioRef.current.volume = 0.15; // Lower volume for background music
        audioRef.current.play().catch(err => {
          console.error("Failed to play audio:", err);
        });
      }
    };

    // Listen for user interactions
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, [isReady]);

  // Toggle mute/unmute when isMuted changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <audio 
      ref={audioRef}
      src="/src/assets/music/background-music.mp3" 
      loop 
      preload="auto"
      className="hidden"
    />
  );
}