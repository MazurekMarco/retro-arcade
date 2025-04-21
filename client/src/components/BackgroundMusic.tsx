import { useEffect, useRef } from 'react';
import { useSound } from '@/lib/useSound';

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isMuted } = useSound();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;
      if (!isMuted) {
        audioRef.current.play().catch(() => {
          // Autoplay was prevented
          console.log('Autoplay prevented - waiting for user interaction');
        });
      }
    }
  }, [isMuted]);

  return (
    <audio
      ref={audioRef}
      src="/music/arcade-music.mp3"
      preload="auto"
    />
  );
}