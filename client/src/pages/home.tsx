import { useState } from "react";
import { GameMenu } from "@/components/GameMenu";
import { SnakeGame } from "@/components/SnakeGame";
import { TetrisGame } from "@/components/TetrisGame";
import { PongGame } from "@/components/PongGame";
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
        <TetrisGame onExit={handleExitGame} />
      )}
      
      {currentGame === "pong" && (
        <PongGame onExit={handleExitGame} />
      )}
    </>
  );
}
