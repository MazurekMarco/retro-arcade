import { useState, useCallback } from "react";

interface HighScore {
  score: number;
  timestamp: number;
}

type GameId = 'snake' | 'tetris' | 'pong';

// Initialize high scores from localStorage
const getInitialHighScores = (): Record<GameId, HighScore> => {
  const storedScores = localStorage.getItem("arcadeHighScores");
  if (storedScores) {
    return JSON.parse(storedScores);
  } else {
    // Default empty high scores
    return {
      snake: { score: 0, timestamp: 0 },
      tetris: { score: 0, timestamp: 0 },
      pong: { score: 0, timestamp: 0 },
    };
  }
};

export function useHighScores() {
  const [highScores, setHighScores] = useState<Record<GameId, HighScore>>(getInitialHighScores);
  const [showHighScores, setShowHighScores] = useState<boolean>(false);

  // Get high score for a specific game
  const getHighScore = useCallback((gameId: string): number => {
    return highScores[gameId as GameId]?.score || 0;
  }, [highScores]);

  // Set high score for a specific game
  const setHighScore = useCallback((gameId: string, score: number) => {
    if (score > (highScores[gameId as GameId]?.score || 0)) {
      const updatedScores = {
        ...highScores,
        [gameId]: {
          score,
          timestamp: Date.now(),
        },
      };
      
      setHighScores(updatedScores);
      localStorage.setItem("arcadeHighScores", JSON.stringify(updatedScores));
      return true; // New high score
    }
    
    return false; // Not a new high score
  }, [highScores]);

  // Toggle high scores visibility
  const toggleHighScores = useCallback(() => {
    setShowHighScores(prev => !prev);
  }, []);

  // Get all high scores with dates
  const getAllHighScores = useCallback(() => {
    return Object.entries(highScores).map(([gameId, data]) => ({
      gameId,
      score: data.score,
      date: new Date(data.timestamp).toLocaleDateString(),
    }));
  }, [highScores]);

  return {
    getHighScore,
    setHighScore,
    showHighScores,
    toggleHighScores,
    getAllHighScores,
  };
}
