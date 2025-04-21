import { motion } from "framer-motion";

interface GameOverProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
}

export function GameOver({ score, highScore, isNewHighScore, onRestart }: GameOverProps) {
  return (
    <motion.div 
      className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-black border-2 border-destructive p-8 rounded-md shadow-lg max-w-md w-full">
        <motion.h3 
          className="text-destructive text-3xl font-arcade mb-6 text-center animate-blink"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          GAME OVER
        </motion.h3>
        
        <div className="border-t-2 border-b-2 border-gray-800 py-4 mb-6">
          <motion.div 
            className="flex justify-between items-center mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-gray-400">YOUR SCORE:</span>
            <span className="text-yellow-400 font-score text-2xl">{score}</span>
          </motion.div>
          
          <motion.div
            className="flex justify-between items-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-gray-400">HIGH SCORE:</span>
            <span className="text-primary font-score text-2xl">{highScore}</span>
          </motion.div>
        </div>
        
        {isNewHighScore && (
          <motion.div 
            className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-black p-3 mb-6 text-center font-bold"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, scale: [1, 1.05, 1] }}
            transition={{ 
              delay: 0.4,
              scale: { repeat: Infinity, repeatType: "reverse", duration: 0.8 }
            }}
          >
            NEW HIGH SCORE!
          </motion.div>
        )}
        
        <div className="flex justify-center">
          <motion.button 
            className="arcade-btn bg-arcade-dark px-8 py-3 border-2 border-primary text-primary text-lg shadow-lg"
            onClick={onRestart}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgb(0, 255, 0)" }}
            whileTap={{ scale: 0.95 }}
          >
            PLAY AGAIN
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
