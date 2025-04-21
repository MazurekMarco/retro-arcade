import { ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useHighScores } from "@/lib/useHighScores";
import { useSound } from "@/lib/useSound";
import { BackgroundMusic } from "@/components/BackgroundMusic";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isMuted, toggleMute, playSound } = useSound();
  const { toggleHighScores } = useHighScores();

  const handleHighScoreClick = () => {
    playSound('select');
    toggleHighScores();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between font-arcade text-white bg-arcade-cabinet relative p-2 sm:p-6 overflow-hidden">
      {/* Background Music */}
      <BackgroundMusic />
      
      {/* Cabinet Lights */}
      <div className="hidden md:block absolute top-0 left-0 w-2 h-full bg-primary opacity-70 cabinet-light"></div>
      <div className="hidden md:block absolute top-0 right-0 w-2 h-full bg-primary opacity-70 cabinet-light"></div>
      
      {/* Header */}
      <header className="relative z-10">
        <div className="container mx-auto py-2 sm:py-4 px-4 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl text-primary mb-2 sm:mb-0 animate-glow">RETRO ARCADE</h1>
          <div className="flex items-center space-x-4">
            <button 
              className="arcade-btn bg-arcade-dark px-3 py-1 border-2 border-yellow-400 text-yellow-400 text-xs sm:text-sm"
              onClick={handleHighScoreClick}
            >
              HIGH SCORES
            </button>
            <button 
              className="text-primary text-xs sm:text-sm"
              onClick={() => {
                playSound('select');
                toggleMute();
              }}
            >
              {isMuted ? <VolumeX /> : <Volume2 />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center p-2 sm:p-4 md:p-8 z-10">
        <div className="w-full max-w-6xl">
          {children}
        </div>
      </main>

      {/* Controls/Footer */}
      <footer className="bg-black bg-opacity-80 border-t-2 border-gray-800 p-4 z-10">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="flex space-x-6 mb-4 sm:mb-0">
            <button 
              className="arcade-btn w-12 h-12 rounded-full bg-destructive border-4 border-gray-800 flex items-center justify-center shadow-lg"
              onClick={() => playSound('select')}
            >
              A
            </button>
            <button 
              className="arcade-btn w-12 h-12 rounded-full bg-primary border-4 border-gray-800 flex items-center justify-center shadow-lg"
              onClick={() => playSound('select')}
            >
              B
            </button>
          </div>
          
          <div className="flex flex-col items-center text-xs text-gray-400">
            <p>USE ARROW KEYS TO MOVE</p>
            <p>PRESS SPACE TO START/PAUSE</p>
          </div>
          
          <div className="hidden sm:flex space-x-4 mt-4 sm:mt-0">
            <button 
              className="arcade-btn border border-blue-500 px-3 py-1 text-xs text-blue-500"
              onClick={() => playSound('coin')}
            >
              INSERT COIN
            </button>
            <div className="arcade-btn border border-primary px-3 py-1 text-xs text-primary">PLAYER 1</div>
          </div>
        </div>
      </footer>
      
      {/* Cabinet Decorations */}
      <div className="hidden lg:block absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-r from-accent to-transparent opacity-20 rounded-full blur-xl"></div>
      <div className="hidden lg:block absolute top-20 right-10 w-16 h-16 bg-gradient-to-l from-primary to-transparent opacity-20 rounded-full blur-xl"></div>
    </div>
  );
}
