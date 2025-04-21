import { users, type User, type InsertUser, highScores, type HighScore, type InsertHighScore } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getHighScores(gameId: string, limit?: number): Promise<HighScore[]>;
  getHighScore(gameId: string, userId: number): Promise<HighScore | undefined>;
  createHighScore(highScore: InsertHighScore): Promise<HighScore>;
  updateHighScore(id: number, score: number): Promise<HighScore | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private highScores: Map<number, HighScore>;
  currentUserId: number;
  currentHighScoreId: number;

  constructor() {
    this.users = new Map();
    this.highScores = new Map();
    this.currentUserId = 1;
    this.currentHighScoreId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getHighScores(gameId: string, limit = 10): Promise<HighScore[]> {
    return Array.from(this.highScores.values())
      .filter(score => score.gameId === gameId)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async getHighScore(gameId: string, userId: number): Promise<HighScore | undefined> {
    return Array.from(this.highScores.values()).find(
      score => score.gameId === gameId && score.userId === userId,
    );
  }

  async createHighScore(insertHighScore: InsertHighScore): Promise<HighScore> {
    const id = this.currentHighScoreId++;
    const timestamp = new Date();
    const highScore: HighScore = { ...insertHighScore, id, timestamp };
    this.highScores.set(id, highScore);
    return highScore;
  }

  async updateHighScore(id: number, score: number): Promise<HighScore | undefined> {
    const highScore = this.highScores.get(id);
    if (!highScore) return undefined;
    
    const updatedHighScore: HighScore = {
      ...highScore,
      score,
      timestamp: new Date(),
    };
    
    this.highScores.set(id, updatedHighScore);
    return updatedHighScore;
  }
}

export const storage = new MemStorage();
