import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHighScoreSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for high scores
  const api = express.Router();

  // Get high scores for a game
  api.get("/highscores/:gameId", async (req, res) => {
    try {
      const { gameId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const highScores = await storage.getHighScores(gameId, limit);
      
      res.json({ highScores });
    } catch (error) {
      res.status(500).json({ message: "Failed to get high scores" });
    }
  });

  // Create or update high score
  api.post("/highscores", async (req, res) => {
    try {
      const validationResult = insertHighScoreSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid high score data",
          errors: validationResult.error.format() 
        });
      }
      
      const { userId, gameId, score } = validationResult.data;
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if high score already exists for this user and game
      const existingHighScore = await storage.getHighScore(gameId, userId);
      
      let highScore;
      
      if (existingHighScore) {
        // Only update if new score is higher than existing score
        if (score > existingHighScore.score) {
          highScore = await storage.updateHighScore(existingHighScore.id, score);
        } else {
          highScore = existingHighScore;
        }
      } else {
        // Create new high score
        highScore = await storage.createHighScore({
          userId,
          gameId,
          score,
        });
      }
      
      res.json({ highScore });
    } catch (error) {
      res.status(500).json({ message: "Failed to save high score" });
    }
  });

  app.use("/api", api);

  const httpServer = createServer(app);

  return httpServer;
}
