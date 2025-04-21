import { useState, useEffect, useRef, useCallback } from "react";
import { useHighScores } from "@/lib/useHighScores";
import { useSound } from "@/lib/useSound";
import { CrtEffect } from "@/components/ui/CrtEffect";
import { GameOver } from "@/components/GameOver";

// Constants
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const CELL_SIZE = 30;
const INITIAL_SPEED = 500; // ms
const SPEED_DECREASE_FACTOR = 0.9;
const LINES_PER_LEVEL = 5;
const MAX_LEVEL = 10;

// Add these type definitions at the top of the file
type Cell = "cyan-500" | "blue-500" | "orange-500" | "yellow-400" | "green-500" | "purple-500" | "red-500" | null;
type Grid = Cell[][];

type Tetromino = {
  shape: number[][];
  color: Cell;
};

// Tetrominoes
const TETROMINOES: Tetromino[] = [
  // I
  {
    shape: [
      [1, 1, 1, 1]
    ],
    color: "cyan-500"
  },
  // J
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: "blue-500"
  },
  // L
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: "orange-500"
  },
  // O
  {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: "yellow-400"
  },
  // S
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: "green-500"
  },
  // T
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: "purple-500"
  },
  // Z
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: "red-500"
  }
];

// Create empty grid
const createEmptyGrid = (rows: number = GRID_HEIGHT, cols: number = GRID_WIDTH) => {
  return Array.from({ length: rows }, () => 
    Array.from({ length: cols }, () => null)
  );
};

interface TetrisGameProps {
  onExit: () => void;
}

export function TetrisGame({ onExit }: TetrisGameProps) {
  // Get high score from localStorage
  const { getHighScore, setHighScore } = useHighScores();
  const highScore = getHighScore("tetris") || 0;
  
  // Sound effects
  const { playSound } = useSound();
  
  // Game state
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [activeTetromino, setActiveTetromino] = useState<Tetromino | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [gameStarted, setGameStarted] = useState(false);
  const [nextTetromino, setNextTetromino] = useState<Tetromino | null>(null);
  
  // Refs for game loop
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const gridRef = useRef(grid);
  const activeTetrominoRef = useRef<Tetromino | null>(activeTetromino);
  const positionRef = useRef(position);
  const pausedRef = useRef(paused);
  const gameOverRef = useRef(gameOver);
  
  // Update refs when state changes
  useEffect(() => {
    gridRef.current = grid;
    activeTetrominoRef.current = activeTetromino;
    positionRef.current = position;
    pausedRef.current = paused;
    gameOverRef.current = gameOver;
  }, [grid, activeTetromino, position, paused, gameOver]);
  
  // Generate a random tetromino
  const generateRandomTetromino = useCallback(() => {
    return TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
  }, []);
  
  // Spawn a new tetromino
  const spawnTetromino = useCallback(() => {
    // Use the next tetromino if available, otherwise generate a new one
    const newTetromino = nextTetromino || generateRandomTetromino();
    setActiveTetromino(newTetromino);
    
    // Generate the next tetromino
    setNextTetromino(generateRandomTetromino());
    
    // Set initial position (center top)
    const newX = Math.floor((GRID_WIDTH - newTetromino.shape[0].length) / 2);
    setPosition({ x: newX, y: 0 });
    
    // Check if the new tetromino can be placed
    if (!isValidPosition(newTetromino, { x: newX, y: 0 })) {
      // Game over
      setGameOver(true);
      playSound('gameOver');
      
      // Update high score if needed
      if (score > highScore) {
        setHighScore("tetris", score);
      }
    }
  }, [nextTetromino, generateRandomTetromino, score, highScore, setHighScore, playSound]);
  
  // Check if a position is valid for the active tetromino
  const isValidPosition = useCallback((tetromino: Tetromino | null, pos: { x: number, y: number }) => {
    if (!tetromino) return false;
    
    // Check each block of the tetromino
    for (let y = 0; y < tetromino.shape.length; y++) {
      for (let x = 0; x < tetromino.shape[y].length; x++) {
        if (tetromino.shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          
          // Check if the position is out of bounds
          if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) {
            return false;
          }
          
          // Check if the position is already occupied (and not out of bounds at the top)
          if (newY >= 0 && gridRef.current[newY][newX]) {
            return false;
          }
        }
      }
    }
    
    return true;
  }, []);
  
  // Rotate the active tetromino
  const rotateTetromino = useCallback(() => {
    if (!activeTetrominoRef.current) return;
    
    // Create a new rotated shape
    const shape = activeTetrominoRef.current.shape;
    const rotatedShape = Array.from({ length: shape[0].length }, () => 
      Array.from({ length: shape.length }, () => 0)
    );
    
    // Perform the rotation
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        rotatedShape[x][shape.length - 1 - y] = shape[y][x];
      }
    }
    
    // Create a new tetromino with the rotated shape
    const rotatedTetromino = {
      ...activeTetrominoRef.current,
      shape: rotatedShape
    };
    
    // Check if the rotation is valid
    if (isValidPosition(rotatedTetromino, positionRef.current)) {
      setActiveTetromino(rotatedTetromino);
      playSound('select');
    }
  }, [isValidPosition, playSound]);
  
  // Move the active tetromino
  const moveTetromino = useCallback((dx: number, dy: number) => {
    const newPos = { x: positionRef.current.x + dx, y: positionRef.current.y + dy };
    
    if (activeTetrominoRef.current && isValidPosition(activeTetrominoRef.current, newPos)) {
      setPosition(newPos);
      return true;
    }
    
    return false;
  }, [isValidPosition]);
  
  // Move tetromino down
  const moveDown = useCallback(() => {
    // If can't move down, lock the tetromino
    if (!moveTetromino(0, 1)) {
      lockTetromino();
      playSound('eat');
      return false;
    }
    return true;
  }, [moveTetromino, playSound]);
  
  // Drop tetromino instantly (hard drop)
  const hardDrop = useCallback(() => {
    let distance = 0;
    let newPos = { ...positionRef.current };
    
    // Find the furthest possible position
    while (isValidPosition(activeTetrominoRef.current, { x: newPos.x, y: newPos.y + 1 })) {
      newPos.y++;
      distance++;
    }
    
    // Update position
    if (distance > 0) {
      setPosition(newPos);
      setScore(prev => prev + distance);
    }
    
    // Lock tetromino
    lockTetromino();
    playSound('eat');
  }, [isValidPosition, playSound]);
  
  // Check for completed lines
  const checkLines = useCallback((grid: Grid) => {
    let completedLines = 0;
    const newGrid: Grid = [...grid];
    
    // Check each row
    for (let y = 0; y < GRID_HEIGHT; y++) {
      // Check if the row is full
      if (newGrid[y].every((cell: Cell) => cell !== null)) {
        // Remove the row
        newGrid.splice(y, 1);
        // Add an empty row at the top
        newGrid.unshift(Array(GRID_WIDTH).fill(null));
        // Increment counter
        completedLines++;
      }
    }
    
    // Update the grid if lines were completed
    if (completedLines > 0) {
      setGrid(newGrid);
      
      // Award points (more points for more lines)
      const pointsPerLine = [0, 100, 300, 500, 800];
      const points = pointsPerLine[completedLines] * level;
      setScore(prev => prev + points);
      
      // Play sound
      playSound('coin');
      
      // Update lines cleared
      setLines(prev => {
        const newLines = prev + completedLines;
        
        // Check for level up
        if (Math.floor(newLines / LINES_PER_LEVEL) > Math.floor(prev / LINES_PER_LEVEL) && level < MAX_LEVEL) {
          setLevel(prev => {
            const newLevel = prev + 1;
            // Increase speed
            setSpeed(INITIAL_SPEED * Math.pow(SPEED_DECREASE_FACTOR, newLevel - 1));
            return newLevel;
          });
        }
        
        return newLines;
      });
    }
  }, [level, playSound]);
  
  // Lock the current tetromino onto the grid
  const lockTetromino = useCallback(() => {
    if (!activeTetrominoRef.current) return;
    
    // Create a new grid
    const newGrid: Grid = gridRef.current.map(row => [...row]);
    
    // Add the tetromino to the grid
    for (let y = 0; y < activeTetrominoRef.current.shape.length; y++) {
      for (let x = 0; x < activeTetrominoRef.current.shape[y].length; x++) {
        if (activeTetrominoRef.current.shape[y][x]) {
          const newY = positionRef.current.y + y;
          const newX = positionRef.current.x + x;
          
          // Only place blocks within the grid
          if (newY >= 0 && newY < GRID_HEIGHT && newX >= 0 && newX < GRID_WIDTH) {
            newGrid[newY][newX] = activeTetrominoRef.current.color;
          }
        }
      }
    }
    
    // Update the grid
    setGrid(newGrid);
    
    // Check for completed lines
    checkLines(newGrid);
    
    // Spawn a new tetromino
    spawnTetromino();
  }, [spawnTetromino, checkLines]);
  
  // Set up keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (gameOver || !gameStarted) return;

      switch (e.key) {
        case "ArrowLeft":
          moveTetromino(-1, 0);
          break;
        case "ArrowRight":
          moveTetromino(1, 0);
          break;
        case "ArrowDown":
          moveDown();
          break;
        case "ArrowUp":
          rotateTetromino();
          break;
        case " ":
          if (!gameStarted) {
            setGameStarted(true);
            playSound('select');
          } else {
            setPaused(prev => !prev);
          }
          break;
        case "Enter":
          hardDrop();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOver, gameStarted, moveTetromino, moveDown, rotateTetromino, hardDrop, playSound]);
  
  // Game loop
  useEffect(() => {
    if (paused || gameOver || !gameStarted) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }
    
    // Initialize game if not already started
    if (!activeTetromino && !nextTetromino) {
      setNextTetromino(generateRandomTetromino());
      spawnTetromino();
    }
    
    // Set up game loop
    gameLoopRef.current = setInterval(() => {
      moveDown();
    }, speed);
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [paused, gameOver, gameStarted, activeTetromino, nextTetromino, moveDown, spawnTetromino, generateRandomTetromino, speed]);
  
  // Restart game
  const restartGame = () => {
    // Reset game state
    setGrid(createEmptyGrid());
    setActiveTetromino(null);
    setNextTetromino(null);
    setPosition({ x: 0, y: 0 });
    setGameOver(false);
    setPaused(false);
    setScore(0);
    setLevel(1);
    setLines(0);
    setSpeed(INITIAL_SPEED);
    setGameStarted(true);
    playSound('select');
  };
  
  // Render the game board with the active tetromino
  const renderBoard = () => {
    return (
      <div className="grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)` }}>
        {grid.map((row: Cell[], rowIndex: number) => (
          row.map((cell: Cell, colIndex: number) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${cell || ''}`}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: cell || 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            />
          ))
        ))}
      </div>
    );
  };
  
  // Render the next tetromino preview
  const renderNextTetromino = () => {
    if (!nextTetromino) return null;
    
    return (
      <div className="bg-black p-2 border border-gray-800">
        <div className="grid grid-flow-col auto-cols-min gap-1">
          {nextTetromino.shape.map((row, y) => (
            <div key={y} className="flex flex-col">
              {row.map((cell, x) => (
                <div 
                  key={`${y}-${x}`} 
                  className={`border border-gray-900 ${cell ? `bg-${nextTetromino.color}` : 'bg-transparent'}`}
                  style={{ width: CELL_SIZE / 1.5, height: CELL_SIZE / 1.5 }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Handle exit
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
        <h2 className="text-xl text-blue-500 font-bold">TETRIS</h2>
        <div className="text-right">
          <div className="text-xs text-gray-400">SCORE</div>
          <div className="font-score text-yellow-400 text-xl">{score}</div>
        </div>
      </div>
      
      {/* Game Container */}
      <div className="w-full flex flex-col md:flex-row items-center justify-center bg-black p-4">
        {/* Game Board */}
        <div className="relative flex-shrink-0" style={{ width: GRID_WIDTH * CELL_SIZE }}>
          {renderBoard()}
          
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
              <div className="bg-black border-2 border-blue-500 p-8 rounded-md w-11/12 max-w-md mb-8">
                <h3 className="text-blue-500 text-2xl text-center mb-6 font-arcade">TETRIS</h3>
                <p className="text-gray-300 mb-4 text-center">Use arrow keys to move and rotate pieces.</p>
                <p className="text-gray-300 mb-6 text-center">Clear lines to score points and level up!</p>
                <div className="flex justify-between items-center border-t border-gray-800 pt-4">
                  <div>
                    <p className="text-xs text-gray-400">CURRENT HIGH SCORE</p>
                    <p className="text-yellow-400 font-score text-xl">{highScore}</p>
                  </div>
                  <button
                    className="arcade-btn bg-arcade-dark px-6 py-3 border-2 border-blue-500 text-blue-500 animate-pulse"
                    onClick={() => {
                      setGameStarted(true);
                      playSound('select');
                    }}
                  >
                    PRESS START
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">PRESS SPACE OR ENTER TO START</p>
            </div>
          )}
        </div>
        
        {/* Game Info */}
        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-4 h-full">
          {/* Next Piece */}
          <div className="bg-black p-3 border-2 border-gray-800">
            <div className="text-sm text-gray-400 mb-2">NEXT PIECE</div>
            {renderNextTetromino()}
          </div>
          
          {/* Stats */}
          <div className="bg-black p-3 border-2 border-gray-800">
            <div className="flex justify-between mb-2">
              <div className="text-sm text-gray-400">LEVEL</div>
              <div className="text-blue-500 font-score">{level}</div>
            </div>
            <div className="flex justify-between mb-2">
              <div className="text-sm text-gray-400">LINES</div>
              <div className="text-green-500 font-score">{lines}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-gray-400">HIGH</div>
              <div className="text-yellow-400 font-score">{highScore}</div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="bg-black p-3 border-2 border-gray-800">
            <div className="text-sm text-gray-400 mb-2">CONTROLS</div>
            <div className="text-xs text-gray-300">
              <p className="mb-1">← → : MOVE</p>
              <p className="mb-1">↑ or Z : ROTATE</p>
              <p className="mb-1">↓ : SOFT DROP</p>
              <p className="mb-1">SPACE : PAUSE</p>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex space-x-2">
            <button 
              className="arcade-btn bg-arcade-dark flex-1 py-2 border border-blue-500 text-blue-500 text-xs"
              onClick={() => {
                setPaused(prev => !prev);
                playSound('select');
              }}
              disabled={gameOver}
            >
              {paused ? "RESUME" : "PAUSE"}
            </button>
            <button 
              className="arcade-btn bg-arcade-dark flex-1 py-2 border border-primary text-primary text-xs"
              onClick={restartGame}
            >
              RESTART
            </button>
          </div>
        </div>
      </div>
    </CrtEffect>
  );
}