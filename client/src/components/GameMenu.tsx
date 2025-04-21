import { useState } from "react";
import { useHighScores } from "@/lib/useHighScores";
import { useSound } from "@/lib/useSound";
import { CrtEffect } from "@/components/ui/CrtEffect";
import { motion } from "framer-motion";

interface Game {
  id: string;
  name: string;
  highScore: number;
  difficulty: string;
  color: string;
  borderColor: string;
  textColor: string;
}

interface GameMenuProps {
  onSelectGame: (gameId: string) => void;
}

export function GameMenu({ onSelectGame }: GameMenuProps) {
  const { getHighScore } = useHighScores();
  const { playSound } = useSound();
  const [isHighScoresVisible, setIsHighScoresVisible] = useState(false);

  const games: Game[] = [
    {
      id: "snake",
      name: "SNAKE",
      highScore: getHighScore("snake") || 0,
      difficulty: "MEDIUM",
      color: "primary",
      borderColor: "border-primary",
      textColor: "text-primary",
    },
    {
      id: "tetris",
      name: "TETRIS",
      highScore: getHighScore("tetris") || 0,
      difficulty: "HARD",
      color: "blue-500",
      borderColor: "border-blue-500",
      textColor: "text-blue-500",
    },
    {
      id: "pong",
      name: "PONG",
      highScore: getHighScore("pong") || 0,
      difficulty: "EASY",
      color: "accent",
      borderColor: "border-accent",
      textColor: "text-accent",
    }
  ];

  const handleGameClick = (gameId: string) => {
    playSound('select');
    onSelectGame(gameId);
  };

  return (
    <CrtEffect>
      <div className="mb-8 text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl text-accent mb-2">SELECT GAME</h2>
        <p className="text-xs sm:text-sm text-gray-400">INSERT COIN TO PLAY</p>
      </div>
      
      {/* Game Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {games.map((game) => (
          <motion.div
            key={game.id}
            className={`game-card bg-black border-2 ${game.borderColor} rounded-lg overflow-hidden pixel-corners cursor-pointer`}
            onClick={() => handleGameClick(game.id)}
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="aspect-video bg-black relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
              </div>
              <h3 className={`text-xl ${game.textColor} z-10 font-bold`}>{game.name}</h3>
            </div>
            <div className="p-3 bg-black">
              <div className="text-xs text-gray-400 mb-2">HIGH SCORE: <span className="text-yellow-400">{game.highScore}</span></div>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${game.textColor}`}>DIFFICULTY: {game.difficulty}</span>
                <button className={`arcade-btn bg-arcade-dark px-2 py-1 text-xs ${game.borderColor} ${game.textColor}`}>PLAY</button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <div className="text-center text-xs animate-blink">
        <p>PRESS SPACEBAR TO START - ARROWS TO NAVIGATE</p>
      </div>
    </CrtEffect>
  );
}
