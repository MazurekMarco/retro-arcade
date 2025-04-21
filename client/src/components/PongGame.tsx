import { useState, useEffect, useRef, useCallback } from "react";
import { useHighScores } from "@/lib/useHighScores";
import { useSound } from "@/lib/useSound";
import { CrtEffect } from "@/components/ui/CrtEffect";
import { GameOver } from "@/components/GameOver";

// Game constants
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 15;
const PADDLE_SPEED = 8;
const BALL_SIZE = 12;
const BALL_SPEED_INITIAL = 5;
const BALL_SPEED_INCREMENT = 0.2;
const BALL_MAX_SPEED = 15;
const AI_DIFFICULTY_EASY = 0.03;
const AI_DIFFICULTY_MEDIUM = 0.06;
const AI_DIFFICULTY_HARD = 0.1;
const MAX_SCORE = 5;

interface PongGameProps {
  onExit: () => void;
}

export function PongGame({ onExit }: PongGameProps) {
  // Game state
  const [playerY, setPlayerY] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [aiY, setAiY] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [ballX, setBallX] = useState(CANVAS_WIDTH / 2);
  const [ballY, setBallY] = useState(CANVAS_HEIGHT / 2);
  const [ballVelX, setBallVelX] = useState(BALL_SPEED_INITIAL);
  const [ballVelY, setBallVelY] = useState(BALL_SPEED_INITIAL * (Math.random() > 0.5 ? 1 : -1));
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [ballSpeed, setBallSpeed] = useState(BALL_SPEED_INITIAL);
  
  // Refs for game loop
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const keysRef = useRef({ ArrowUp: false, ArrowDown: false });
  const scoreRef = useRef(0);
  
  // Sound effects
  const { playSound } = useSound();
  
  // Get high score from localStorage
  const { getHighScore, setHighScore } = useHighScores();
  const highScore = getHighScore("pong") || 0;
  
  // Helper function to get AI difficulty value
  const getAiDifficultyValue = useCallback(() => {
    switch(difficulty) {
      case "EASY": return AI_DIFFICULTY_EASY;
      case "HARD": return AI_DIFFICULTY_HARD;
      default: return AI_DIFFICULTY_MEDIUM;
    }
  }, [difficulty]);
  
  // Draw the game
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw center line
    ctx.beginPath();
    ctx.setLineDash([10, 15]);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#333333";
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw scores
    ctx.font = "48px 'VT323', monospace";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(playerScore.toString(), CANVAS_WIDTH / 4, 60);
    ctx.fillText(aiScore.toString(), CANVAS_WIDTH * 3 / 4, 60);
    
    // Draw player paddle
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(
      PADDLE_WIDTH,
      playerY,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    );
    
    // Draw AI paddle
    ctx.fillStyle = "#FF00FF";
    ctx.fillRect(
      CANVAS_WIDTH - PADDLE_WIDTH * 2,
      aiY,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    );
    
    // Draw ball
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    
  }, [playerY, aiY, ballX, ballY, playerScore, aiScore]);
  
  // Update game state
  const update = useCallback((deltaTime: number) => {
    // Move player paddle based on key presses
    if (keysRef.current.ArrowUp && playerY > 0) {
      setPlayerY(prev => Math.max(0, prev - PADDLE_SPEED));
    }
    if (keysRef.current.ArrowDown && playerY < CANVAS_HEIGHT - PADDLE_HEIGHT) {
      setPlayerY(prev => Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, prev + PADDLE_SPEED));
    }
    
    // AI movement (follows the ball with some delay)
    const aiDifficulty = getAiDifficultyValue();
    const aiTarget = ballY - PADDLE_HEIGHT / 2;
    const aiMovement = (aiTarget - aiY) * aiDifficulty;
    
    setAiY(prev => {
      const newY = prev + aiMovement;
      // Keep AI paddle within bounds
      return Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newY));
    });
    
    // Move ball
    setBallX(prev => prev + ballVelX);
    setBallY(prev => prev + ballVelY);
    
    // Ball collision with top/bottom walls
    if (ballY <= BALL_SIZE / 2 || ballY >= CANVAS_HEIGHT - BALL_SIZE / 2) {
      setBallVelY(prev => -prev);
      playSound('select');
    }
    
    // Ball collision with paddles
    // Player paddle
    if (
      ballX <= PADDLE_WIDTH * 2 + BALL_SIZE / 2 &&
      ballX >= PADDLE_WIDTH + BALL_SIZE / 2 &&
      ballY >= playerY &&
      ballY <= playerY + PADDLE_HEIGHT
    ) {
      // Calculate normalized intersection (-0.5 to 0.5)
      const relativeIntersectY = (playerY + PADDLE_HEIGHT / 2 - ballY) / (PADDLE_HEIGHT / 2);
      // Calculate bounce angle (in radians)
      const bounceAngle = relativeIntersectY * Math.PI / 4; // max 45 degrees
      
      // Increase ball speed
      const newSpeed = Math.min(ballSpeed + BALL_SPEED_INCREMENT, BALL_MAX_SPEED);
      setBallSpeed(newSpeed);
      
      // Set new velocity based on angle
      setBallVelX(newSpeed * Math.cos(bounceAngle));
      setBallVelY(-newSpeed * Math.sin(bounceAngle));
      
      playSound('eat');
      
      // Update score
      const newScore = scoreRef.current + 1;
      scoreRef.current = newScore;
      
      // Only update state score every 5 points to improve performance
      if (newScore % 5 === 0) {
        setPlayerScore(newScore);
      }
    }
    
    // AI paddle
    if (
      ballX >= CANVAS_WIDTH - PADDLE_WIDTH * 2 - BALL_SIZE / 2 &&
      ballX <= CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE / 2 &&
      ballY >= aiY &&
      ballY <= aiY + PADDLE_HEIGHT
    ) {
      // Calculate normalized intersection (-0.5 to 0.5)
      const relativeIntersectY = (aiY + PADDLE_HEIGHT / 2 - ballY) / (PADDLE_HEIGHT / 2);
      // Calculate bounce angle (in radians)
      const bounceAngle = relativeIntersectY * Math.PI / 4; // max 45 degrees
      
      // Increase ball speed
      const newSpeed = Math.min(ballSpeed + BALL_SPEED_INCREMENT, BALL_MAX_SPEED);
      setBallSpeed(newSpeed);
      
      // Set new velocity based on angle
      setBallVelX(-newSpeed * Math.cos(bounceAngle));
      setBallVelY(-newSpeed * Math.sin(bounceAngle));
      
      playSound('eat');
    }
    
    // Ball scoring
    if (ballX < 0) {
      // AI scores
      setAiScore(prev => prev + 1);
      resetBall(true);
      playSound('gameOver');
      
      // Check for game over
      if (aiScore + 1 >= MAX_SCORE) {
        handleGameOver(false);
      }
    }
    
    if (ballX > CANVAS_WIDTH) {
      // Player scores
      setPlayerScore(prev => prev + 1);
      resetBall(false);
      playSound('coin');
      
      // Check for game over
      if (playerScore + 1 >= MAX_SCORE) {
        handleGameOver(true);
      }
    }
  }, [ballVelX, ballVelY, ballSpeed, playerScore, aiScore, playSound, getAiDifficultyValue]);
  
  // Reset ball to center
  const resetBall = useCallback((aiScored: boolean) => {
    setBallX(CANVAS_WIDTH / 2);
    setBallY(CANVAS_HEIGHT / 2);
    setBallSpeed(BALL_SPEED_INITIAL);
    
    // Randomize y direction
    const yDir = Math.random() > 0.5 ? 1 : -1;
    
    // Send ball towards player who just lost
    if (aiScored) {
      setBallVelX(BALL_SPEED_INITIAL);
      setBallVelY(BALL_SPEED_INITIAL * yDir);
    } else {
      setBallVelX(-BALL_SPEED_INITIAL);
      setBallVelY(BALL_SPEED_INITIAL * yDir);
    }
  }, []);
  
  // Game loop
  const gameLoop = useCallback((time: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = time;
    }
    
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    
    update(deltaTime);
    draw();
    
    requestIdRef.current = requestAnimationFrame(gameLoop);
  }, [update, draw]);
  
  // Start/stop game loop
  useEffect(() => {
    if (gameStarted && !paused && !gameOver) {
      requestIdRef.current = requestAnimationFrame(gameLoop);
    } else if (requestIdRef.current) {
      cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
    }
    
    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
        requestIdRef.current = null;
      }
    };
  }, [gameStarted, paused, gameOver, gameLoop]);
  
  // Handle key events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        keysRef.current[e.key] = true;
      }
      
      if (e.code === "Space") {
        if (gameOver) {
          restartGame();
        } else if (gameStarted) {
          setPaused(prev => !prev);
          playSound('select');
        } else {
          startGame();
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        keysRef.current[e.key] = false;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameOver, gameStarted, playSound]);
  
  // Handle game over
  const handleGameOver = (playerWon: boolean) => {
    setGameOver(true);
    setPlayerWon(playerWon);
    
    // Update high score
    if (playerWon && scoreRef.current > highScore) {
      setHighScore("pong", scoreRef.current);
    }
  };
  
  // Start game
  const startGame = () => {
    setGameStarted(true);
    setPaused(false);
    playSound('select');
  };
  
  // Restart game
  const restartGame = () => {
    setPlayerY(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setAiY(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setBallX(CANVAS_WIDTH / 2);
    setBallY(CANVAS_HEIGHT / 2);
    setBallVelX(BALL_SPEED_INITIAL);
    setBallVelY(BALL_SPEED_INITIAL * (Math.random() > 0.5 ? 1 : -1));
    setPlayerScore(0);
    setAiScore(0);
    setGameOver(false);
    setPaused(false);
    setGameStarted(true);
    setBallSpeed(BALL_SPEED_INITIAL);
    scoreRef.current = 0;
    playSound('select');
  };
  
  // Change difficulty
  const changeDifficulty = () => {
    setDifficulty(prev => {
      switch(prev) {
        case "EASY": return "MEDIUM";
        case "MEDIUM": return "HARD";
        case "HARD": return "EASY";
        default: return "MEDIUM";
      }
    });
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
        <h2 className="text-xl text-accent font-bold">PONG</h2>
        <div className="text-right">
          <div className="text-xs text-gray-400">SCORE</div>
          <div className="font-score text-yellow-400 text-xl">{playerScore}</div>
        </div>
      </div>
      
      {/* Game Board */}
      <div className="w-full flex flex-col items-center justify-center bg-black p-4">
        <div className="relative">
          <canvas 
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-gray-800 max-w-full h-auto"
            onClick={() => {
              if (!gameStarted) startGame();
              else if (gameOver) restartGame();
              else setPaused(prev => !prev);
            }}
          />
          
          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-center">
              <h3 className="text-3xl text-yellow-400 mb-4">{playerWon ? "YOU WIN!" : "GAME OVER"}</h3>
              <p className="text-xl text-white mb-6">{playerWon ? "Well played!" : "Better luck next time!"}</p>
              <div className="mb-8">
                <div className="text-lg text-gray-300">FINAL SCORE</div>
                <div className="text-4xl text-accent">{playerScore} : {aiScore}</div>
              </div>
              {playerWon && scoreRef.current > highScore && (
                <div className="text-xl text-yellow-400 animate-blink mb-6">NEW HIGH SCORE!</div>
              )}
              <button 
                className="arcade-btn bg-arcade-dark px-6 py-3 border-2 border-accent text-accent"
                onClick={restartGame}
              >
                PLAY AGAIN
              </button>
            </div>
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
              <div className="bg-black border-2 border-accent p-8 rounded-md w-11/12 max-w-md mb-8">
                <h3 className="text-accent text-2xl text-center mb-6 font-arcade">PONG</h3>
                <p className="text-gray-300 mb-4 text-center">Use UP and DOWN arrow keys to move your paddle.</p>
                <p className="text-gray-300 mb-6 text-center">First to {MAX_SCORE} points wins!</p>
                <div className="flex justify-between items-center border-t border-gray-800 pt-4">
                  <div>
                    <p className="text-xs text-gray-400">DIFFICULTY</p>
                    <button 
                      onClick={changeDifficulty}
                      className="text-accent hover:text-accent-foreground"
                    >
                      {difficulty}
                    </button>
                  </div>
                  <button
                    className="arcade-btn bg-arcade-dark px-6 py-3 border-2 border-accent text-accent animate-pulse"
                    onClick={startGame}
                  >
                    PRESS START
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">PRESS SPACE TO START</p>
            </div>
          )}
        </div>
        
        {/* Game Controls */}
        <div className="bg-black p-3 mt-4 flex justify-between items-center w-full max-w-xl">
          <div className="text-xs text-gray-400">DIFFICULTY: <span className="text-accent">{difficulty}</span></div>
          <div className="flex space-x-4">
            <button 
              className="arcade-btn bg-arcade-dark px-3 py-1 border border-accent text-accent text-xs"
              onClick={() => {
                setPaused(prev => !prev);
                playSound('select');
              }}
              disabled={!gameStarted || gameOver}
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
      </div>
    </CrtEffect>
  );
}