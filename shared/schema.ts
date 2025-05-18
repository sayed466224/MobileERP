import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  avatarInitials: text("avatar_initials"),
  lastSync: timestamp("last_sync"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  avatarInitials: true,
});

// Activity table for tracking recent activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // e.g., 'stock_received', 'order_placed', 'low_stock'
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  iconBgColor: text("icon_bg_color").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  reference: text("reference"), // e.g., order number, item SKU
  referenceType: text("reference_type"), // e.g., 'order', 'inventory'
  assignedTo: text("assigned_to"),
  actionText: text("action_text"),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  type: true,
  title: true,
  description: true,
  icon: true,
  iconBgColor: true,
  timestamp: true,
  reference: true,
  referenceType: true,
  assignedTo: true,
  actionText: true,
});

// Task table for user tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  dueDate: timestamp("due_date"),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  userId: true,
  title: true,
  dueDate: true,
  isCompleted: true,
  completedAt: true,
});

// Stats for dashboard
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // e.g., 'sales_today', 'pending_orders'
  value: text("value").notNull(),
  changePercentage: text("change_percentage"),
  changeDirection: text("change_direction"), // 'up' or 'down'
  icon: text("icon").notNull(),
  lastUpdated: timestamp("last_updated").notNull(),
});

export const insertStatSchema = createInsertSchema(stats).pick({
  userId: true,
  type: true,
  value: true,
  changePercentage: true,
  changeDirection: true,
  icon: true,
  lastUpdated: true,
});

// Cached data from ERPNext
export const cachedData = pgTable("cached_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  dataType: text("data_type").notNull(), // e.g., 'inventory', 'sales_orders'
  data: jsonb("data").notNull(),
  lastSynced: timestamp("last_synced").notNull(),
});

export const insertCachedDataSchema = createInsertSchema(cachedData).pick({
  userId: true,
  dataType: true,
  data: true,
  lastSynced: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Stat = typeof stats.$inferSelect;
export type InsertStat = z.infer<typeof insertStatSchema>;

export type CachedData = typeof cachedData.$inferSelect;
export type InsertCachedData = z.infer<typeof insertCachedDataSchema>;
