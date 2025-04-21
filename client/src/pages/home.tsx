import { useState } from "react";
import { GameMenu } from "@/components/GameMenu";
import { SnakeGame } from "@/components/SnakeGame";
import { useSound } from "@/lib/useSound";

export default function Home() {
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const { playSound } = useSound();

  const handleSelectGame = (gameId: string) => {
    setCurrentGame(gameId);
    playSound('select');
  };

  const handleExitGame = () => {
    setCurrentGame(null);
  };

  return (
    <>
      {currentGame === null && (
        <GameMenu onSelectGame={handleSelectGame} />
      )}
      
      {currentGame === "snake" && (
        <SnakeGame onExit={handleExitGame} />
      )}
      
      {currentGame === "tetris" && (
        <div className="text-center text-white py-8">
          <h2 className="text-2xl mb-4">Tetris Coming Soon!</h2>
          <button 
            onClick={handleExitGame}
            className="arcade-btn bg-arcade-dark px-6 py-2 border-2 border-primary text-primary"
          >
            BACK TO MENU
          </button>
        </div>
      )}
      
      {currentGame === "pong" && (
        <div className="text-center text-white py-8">
          <h2 className="text-2xl mb-4">Pong Coming Soon!</h2>
          <button 
            onClick={handleExitGame}
            className="arcade-btn bg-arcade-dark px-6 py-2 border-2 border-primary text-primary"
          >
            BACK TO MENU
          </button>
        </div>
      )}
    </>
  );
}
