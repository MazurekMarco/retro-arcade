import { useState, useEffect, useRef, useCallback } from "react";
import { CrtEffect } from "@/components/ui/CrtEffect";
import { GameOver } from "@/components/GameOver";
import { useHighScores } from "@/lib/useHighScores";
import { useSound } from "@/lib/useSound";

interface Position {
  x: number;
  y: number;
}

interface SnakeGameProps {
  onExit: () => void;
}

// Game constants
const GRID_SIZE = 30; // Increased grid size for better screen utilization
const CELL_SIZE = 20; // Increased cell size for better visibility
const INITIAL_SPEED = 150;
const MAX_LEVEL = 10;
const SPEED_DECREASE_PER_LEVEL = 10;

export function SnakeGame({ onExit }: SnakeGameProps) {
  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ]);
  const [food, setFood] = useState<Position>({ x: 15, y: 5 });
  const [direction, setDirection] = useState<string>("RIGHT");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [speed, setSpeed] = useState<number>(INITIAL_SPEED);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  
  const { getHighScore, setHighScore } = useHighScores();
  const { playSound } = useSound();
  
  const highScore = getHighScore("snake") || 0;
  const gameLoopRef = useRef<number | null>(null);
  const directionRef = useRef(direction);
  const foodRef = useRef(food);
  
  // Update refs when their values change
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);
  
  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  // Generate random food position
  const generateFood = useCallback((): Position => {
    // Create a copy of the snake for comparison
    const snakeCopy = [...snake];
    
    // Generate random coordinates
    let x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
    let y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
    
    // Make sure food doesn't appear on snake
    // Using a while loop instead of recursion to avoid stack overflow
    let attempts = 0;
    while (
      snakeCopy.some(segment => segment.x === x && segment.y === y) && 
      attempts < 50
    ) {
      x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
      y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
      attempts++;
    }
    
    console.log("Food generated at", x, y);
    return { x, y };
  }, [snake]);

  // Handle key presses
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    
    if (e.code === "Space") {
      if (gameOver) {
        // Restart game
        restartGame();
      } else {
        // Pause/resume game
        setPaused(prev => !prev);
        playSound('select');
      }
      return;
    }
    
    if (paused || gameOver) return;
    
    // Update direction based on key press
    switch (e.code) {
      case "ArrowUp":
        if (directionRef.current !== "DOWN") setDirection("UP");
        break;
      case "ArrowDown":
        if (directionRef.current !== "UP") setDirection("DOWN");
        break;
      case "ArrowLeft":
        if (directionRef.current !== "RIGHT") setDirection("LEFT");
        break;
      case "ArrowRight":
        if (directionRef.current !== "LEFT") setDirection("RIGHT");
        break;
      default:
        break;
    }
  }, [paused, gameOver, playSound]);

  // Set up key event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle game start
  const startGame = useCallback(() => {
    setGameStarted(true);
    playSound('select');
  }, [playSound]);
  
  // Key event specifically for starting the game
  useEffect(() => {
    const handleStartKey = (e: KeyboardEvent) => {
      if (!gameStarted && (e.code === "Space" || e.code === "Enter")) {
        startGame();
      }
    };
    
    window.addEventListener("keydown", handleStartKey);
    return () => {
      window.removeEventListener("keydown", handleStartKey);
    };
  }, [gameStarted, startGame]);
  
  // Game loop
  useEffect(() => {
    if (paused || gameOver || !gameStarted) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }
    
    let lastTime = 0;
    let deltaTime = 0;
    
    const gameLoop = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      deltaTime += timestamp - lastTime;
      lastTime = timestamp;
      
      if (deltaTime >= speed) {
        moveSnake();
        deltaTime = 0;
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [paused, gameOver, gameStarted, speed]);

  // Move snake
  const moveSnake = () => {
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      
      // Update head position based on direction
      switch (directionRef.current) {
        case "UP":
          head.y -= 1;
          break;
        case "DOWN":
          head.y += 1;
          break;
        case "LEFT":
          head.x -= 1;
          break;
        case "RIGHT":
          head.x += 1;
          break;
        default:
          break;
      }
      
      // Check for collision with walls
      if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE
      ) {
        handleGameOver();
        return prevSnake;
      }
      
      // Check for collision with self
      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        handleGameOver();
        return prevSnake;
      }
      
      // Check for food collision
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        playSound('eat');
        
        // Generate new food outside of the state update
        const newFood = generateFood();
        setTimeout(() => setFood(newFood), 0);
        
        setScore(prevScore => {
          const newScore = prevScore + 10;
          
          // Level up every 50 points
          if (newScore % 50 === 0 && level < MAX_LEVEL) {
            setLevel(prevLevel => prevLevel + 1);
            setSpeed(prevSpeed => prevSpeed - SPEED_DECREASE_PER_LEVEL);
          }
          
          return newScore;
        });
        
        // Add new head without removing tail (snake grows)
        return [head, ...prevSnake];
      }
      
      // Regular movement - add new head and remove tail
      return [head, ...prevSnake.slice(0, -1)];
    });
  };

  // Handle game over
  const handleGameOver = () => {
    setGameOver(true);
    playSound('gameOver');
    
    // Update high score if needed
    if (score > highScore) {
      setHighScore("snake", score);
    }
  };

  // Restart game
  const restartGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 },
    ]);
    
    // Generate new food
    const newFood = generateFood();
    setFood(newFood);
    foodRef.current = newFood;
    
    // Reset all game state
    setDirection("RIGHT");
    setGameOver(false);
    setPaused(false);
    setScore(0);
    setLevel(1);
    setSpeed(INITIAL_SPEED);
    setGameStarted(true);
    playSound('select');
  };

  // Handle exit to main menu
  const handleExit = () => {
    playSound('select');
    onExit();
  };

  return (
    <CrtEffect>
      {/* Game Header */}
      <div className="bg-black p-3 flex justify-between items-center border-b-2 border-gray-800">
        <button 
          className="arcade-btn bg-arcade-dark px-3 py-1 border-2 border-destructive text-destructive text-xs"
          onClick={handleExit}
        >
          MAIN MENU
        </button>
        <h2 className="text-xl text-primary font-bold">SNAKE</h2>
        <div className="text-right">
          <div className="text-xs text-gray-400">SCORE</div>
          <div className="font-score text-yellow-400 text-xl">{score}</div>
        </div>
      </div>
      
      {/* Game Board */}
      <div className="w-full h-full aspect-video max-w-4xl mx-auto bg-black relative overflow-hidden p-4">
        <div className="w-full h-full relative border-2 border-gray-800 flex items-center justify-center">
          <div className="relative" style={{ 
            width: `${GRID_SIZE * CELL_SIZE}px`, 
            height: `${GRID_SIZE * CELL_SIZE}px`,
            maxWidth: '100%',
            maxHeight: '100%'
          }}>
            {/* Snake */}
            {snake.map((segment, index) => (
              <div 
                key={index}
                className="snake-pixel absolute"
                style={{
                  left: `${segment.x * CELL_SIZE}px`,
                  top: `${segment.y * CELL_SIZE}px`,
                  width: `${CELL_SIZE}px`,
                  height: `${CELL_SIZE}px`,
                }}
              />
            ))}
            
            {/* Food */}
            <div 
              className="food-pixel absolute"
              style={{
                left: `${food.x * CELL_SIZE}px`,
                top: `${food.y * CELL_SIZE}px`,
                width: `${CELL_SIZE}px`,
                height: `${CELL_SIZE}px`,
              }}
            />
          </div>
        </div>
        
        {/* Game Over Overlay */}
        {gameOver && (
          <GameOver 
            score={score} 
            highScore={highScore} 
            onRestart={restartGame} 
            isNewHighScore={score > highScore}
          />
        )}
        
        {/* Pause Overlay */}
        {paused && !gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
            <h3 className="text-yellow-400 text-2xl animate-blink">PAUSED</h3>
          </div>
        )}
        
        {/* Start Game Overlay */}
        {!gameStarted && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-20">
            <div className="bg-black border-2 border-primary p-8 rounded-md w-11/12 max-w-md mb-8">
              <h3 className="text-primary text-2xl text-center mb-6 font-arcade">SNAKE</h3>
              <p className="text-gray-300 mb-4 text-center">Use arrow keys to move the snake.</p>
              <p className="text-gray-300 mb-6 text-center">Collect food to grow and earn points, but don't hit the walls or yourself!</p>
              <div className="flex justify-between items-center border-t border-gray-800 pt-4">
                <div>
                  <p className="text-xs text-gray-400">CURRENT HIGH SCORE</p>
                  <p className="text-yellow-400 font-score text-xl">{highScore}</p>
                </div>
                <button
                  className="arcade-btn bg-arcade-dark px-6 py-3 border-2 border-primary text-primary animate-pulse"
                  onClick={startGame}
                >
                  PRESS START
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">PRESS SPACE OR ENTER TO START</p>
          </div>
        )}
      </div>
      
      {/* Game Controls */}
      <div className="bg-black p-3 border-t-2 border-gray-800 flex justify-between items-center">
        <div className="text-xs text-gray-400">LEVEL: <span className="text-blue-500">{level.toString().padStart(2, '0')}</span></div>
        <div className="flex space-x-4">
          <button 
            className="arcade-btn bg-arcade-dark px-3 py-1 border border-accent text-accent text-xs"
            onClick={() => {
              setPaused(prev => !prev);
              playSound('select');
            }}
            disabled={gameOver}
          >
            {paused ? "RESUME" : "PAUSE"}
          </button>
          <button 
            className="arcade-btn bg-arcade-dark px-3 py-1 border border-primary text-primary text-xs"
            onClick={restartGame}
          >
            RESTART
          </button>
        </div>
        <div className="text-xs text-gray-400">HIGH: <span className="text-yellow-400">{highScore}</span></div>
      </div>
    </CrtEffect>
  );
}
