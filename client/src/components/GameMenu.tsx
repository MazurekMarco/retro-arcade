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

  // Available games that can be played
  const availableGames: Game[] = [
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
    },
  ];
  
  // Coming soon games (placeholders)
  const comingSoonGames: Game[] = [
    {
      id: "pacman",
      name: "PACMAN",
      highScore: 0,
      difficulty: "MEDIUM",
      color: "yellow-400",
      borderColor: "border-yellow-400",
      textColor: "text-yellow-400",
    },
    {
      id: "spacewar",
      name: "SPACE WAR",
      highScore: 0,
      difficulty: "HARD",
      color: "red-500",
      borderColor: "border-red-500",
      textColor: "text-red-500",
    },
    {
      id: "frogger",
      name: "FROGGER",
      highScore: 0,
      difficulty: "MEDIUM",
      color: "green-400",
      borderColor: "border-green-400",
      textColor: "text-green-400",
    }
  ];

  const handleGameClick = (gameId: string) => {
    playSound('select');
    onSelectGame(gameId);
  };

  return (
    <CrtEffect>
      <div className="flex flex-col justify-center min-h-[80vh] px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl text-accent mb-4 animate-glow">SELECT GAME</h2>
          <p className="text-sm sm:text-base text-yellow-400 mb-8">CHOOSE A GAME TO PLAY</p>
        </div>
        
        {/* Game Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.15 }}
        >
          {/* Available games */}
          {availableGames.map((game) => (
            <motion.div
              key={game.id}
              className={`game-card bg-black border-2 ${game.borderColor} rounded-lg overflow-hidden pixel-corners cursor-pointer shadow-lg`}
              onClick={() => handleGameClick(game.id)}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="aspect-video bg-black relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
                </div>
                <div className={`absolute top-0 left-0 w-full h-1 bg-${game.color} opacity-70`}></div>
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-${game.color} opacity-70`}></div>
                <h3 className={`text-2xl ${game.textColor} z-10 font-bold`}>{game.name}</h3>
              </div>
              <div className="p-4 bg-black">
                <div className="text-sm text-gray-400 mb-3">HIGH SCORE: <span className="text-yellow-400 font-score text-lg">{game.highScore}</span></div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${game.textColor}`}>DIFFICULTY: {game.difficulty}</span>
                  <button className={`arcade-btn bg-arcade-dark px-4 py-2 text-sm ${game.borderColor} ${game.textColor} hover:bg-${game.color} hover:bg-opacity-20 transition-colors`}>PLAY</button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Coming soon games */}
          {comingSoonGames.map((game) => (
            <motion.div
              key={game.id}
              className={`game-card coming-soon bg-black border-2 border-gray-700 rounded-lg overflow-hidden pixel-corners shadow-lg`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="aspect-video bg-gradient-to-b from-gray-900 to-black relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
                </div>
                <div className={`absolute top-0 left-0 w-full h-1 bg-${game.color} opacity-30`}></div>
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-${game.color} opacity-30`}></div>
                <h3 className={`text-2xl ${game.textColor} z-10 font-bold opacity-80`}>{game.name}</h3>
              </div>
              <div className="p-4 bg-black">
                <div className="text-sm text-gray-400 mb-3 opacity-80">DIFFICULTY: {game.difficulty}</div>
                <div className="flex justify-center items-center">
                  <span className="text-xs text-gray-500 animate-blink">MORE COMING SOON</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="text-center text-sm animate-blink mt-auto">
          <p className="p-2 border border-gray-700 inline-block bg-black bg-opacity-70">
            PRESS SPACEBAR TO START - ARROWS TO NAVIGATE
          </p>
        </div>
      </div>
    </CrtEffect>
  );
}
