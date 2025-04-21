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
      className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3 
        className="text-destructive text-2xl mb-4 animate-blink"
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        GAME OVER
      </motion.h3>
      
      <motion.p 
        className="text-white mb-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        YOUR SCORE: <span className="text-yellow-400">{score}</span>
      </motion.p>
      
      {isNewHighScore && (
        <motion.p 
          className="text-yellow-400 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          NEW HIGH SCORE!
        </motion.p>
      )}
      
      <motion.button 
        className="arcade-btn bg-arcade-dark px-6 py-2 border-2 border-primary text-primary"
        onClick={onRestart}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        PLAY AGAIN
      </motion.button>
    </motion.div>
  );
}
