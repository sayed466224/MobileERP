import { 
  users, activities, tasks, stats, cachedData,
  type User, type InsertUser,
  type Activity, type InsertActivity,
  type Task, type InsertTask,
  type Stat, type InsertStat,
  type CachedData, type InsertCachedData
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { IStorage } from "./storage";

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserLastSync(userId: number, lastSync: Date): Promise<void> {
    await db
      .update(users)
      .set({ lastSync })
      .where(eq(users.id, userId));
  }

  // Activity operations
  async getActivities(userId: number, limit?: number): Promise<Activity[]> {
    const query = db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(activities.timestamp);
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  // Task operations
  async getTasks(userId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(tasks.dueDate);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateTask(id: number, isCompleted: boolean): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ 
        isCompleted, 
        completedAt: isCompleted ? new Date() : null 
      })
      .where(eq(tasks.id, id))
      .returning();
    
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    return task;
  }

  async deleteTask(id: number): Promise<void> {
    await db
      .delete(tasks)
      .where(eq(tasks.id, id));
  }

  // Stat operations
  async getStats(userId: number, types?: string[]): Promise<Stat[]> {
    let query = db
      .select()
      .from(stats)
      .where(eq(stats.userId, userId));
    
    if (types && types.length > 0) {
      // Using the `in` operator would be better here, but we'll make it work with current constraints
      const results = await query;
      return results.filter(stat => types.includes(stat.type));
    }
    
    return await query;
  }

  async createOrUpdateStat(insertStat: InsertStat): Promise<Stat> {
    // Check if stat already exists
    const [existingStat] = await db
      .select()
      .from(stats)
      .where(
        and(
          eq(stats.userId, insertStat.userId),
          eq(stats.type, insertStat.type)
        )
      );
    
    if (existingStat) {
      // Update existing stat
      const [updatedStat] = await db
        .update(stats)
        .set({
          value: insertStat.value,
          changePercentage: insertStat.changePercentage,
          changeDirection: insertStat.changeDirection,
          lastUpdated: insertStat.lastUpdated
        })
        .where(eq(stats.id, existingStat.id))
        .returning();
        
      return updatedStat;
    } else {
      // Create new stat
      const [newStat] = await db
        .insert(stats)
        .values(insertStat)
        .returning();
        
      return newStat;
    }
  }

  // Cached data operations
  async getCachedData(userId: number, dataType: string): Promise<CachedData | undefined> {
    const [data] = await db
      .select()
      .from(cachedData)
      .where(
        and(
          eq(cachedData.userId, userId),
          eq(cachedData.dataType, dataType)
        )
      );
    
    return data || undefined;
  }

  async createOrUpdateCachedData(insertData: InsertCachedData): Promise<CachedData> {
    // Check if data already exists
    const [existingData] = await db
      .select()
      .from(cachedData)
      .where(
        and(
          eq(cachedData.userId, insertData.userId),
          eq(cachedData.dataType, insertData.dataType)
        )
      );
    
    if (existingData) {
      // Update existing data
      const [updatedData] = await db
        .update(cachedData)
        .set({
          data: insertData.data,
          lastSynced: insertData.lastSynced
        })
        .where(eq(cachedData.id, existingData.id))
        .returning();
        
      return updatedData;
    } else {
      // Create new data
      const [newData] = await db
        .insert(cachedData)
        .values(insertData)
        .returning();
        
      return newData;
    }
  }
}