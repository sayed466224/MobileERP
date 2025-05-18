import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { 
  insertUserSchema, 
  insertActivitySchema, 
  insertTaskSchema,
  insertStatSchema,
  insertCachedDataSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Base URL for ERPNext API
  const ERPNEXT_BASE_URL = process.env.ERPNEXT_URL || "https://demo.erpnext.com";
  const ERPNEXT_API_KEY = process.env.ERPNEXT_API_KEY || "";
  const ERPNEXT_API_SECRET = process.env.ERPNEXT_API_SECRET || "";

  // Helper function to make authenticated requests to ERPNext
  const erpnextRequest = async (endpoint: string, method = "GET", data = {}) => {
    try {
      const url = `${ERPNEXT_BASE_URL}${endpoint}`;
      const headers = {
        "Authorization": `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`
      };
      
      const response = await axios({
        method,
        url,
        headers,
        data: method !== "GET" ? data : undefined,
        params: method === "GET" ? data : undefined
      });
      
      return response.data;
    } catch (error) {
      console.error("ERPNext API Error:", error);
      throw error;
    }
  };

  // AUTH ROUTES
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Validate against ERPNext
      try {
        // Attempt to authenticate with ERPNext
        const authResponse = await axios.post(`${ERPNEXT_BASE_URL}/api/method/login`, {
          usr: username,
          pwd: password
        });
        
        // Check if the login was successful
        if (authResponse.data.message === "Logged In") {
          // Check if user exists in our system
          let user = await storage.getUserByUsername(username);
          
          if (!user) {
            // Create new user in our storage
            const fullName = authResponse.data.full_name || username;
            const email = authResponse.data.email || "";
            const avatarInitials = fullName.split(" ").map(name => name[0]).join("").toUpperCase();
            
            user = await storage.createUser({
              username,
              password: "hashed_would_go_here", // In a real app, we'd use a proper auth system
              fullName,
              email,
              avatarInitials
            });
          }
          
          res.json({
            success: true,
            user: {
              id: user.id,
              username: user.username,
              fullName: user.fullName,
              email: user.email,
              avatarInitials: user.avatarInitials,
              lastSync: user.lastSync
            }
          });
        } else {
          res.status(401).json({ success: false, message: "Invalid credentials" });
        }
      } catch (err) {
        // If ERPNext is unreachable, try local auth
        const user = await storage.getUserByUsername(username);
        
        if (user && user.password === password) { // Again, in production we'd use proper auth
          res.json({
            success: true,
            user: {
              id: user.id,
              username: user.username,
              fullName: user.fullName,
              email: user.email,
              avatarInitials: user.avatarInitials,
              lastSync: user.lastSync
            }
          });
        } else {
          res.status(401).json({ success: false, message: "Invalid credentials or service unavailable" });
        }
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // SYNCHRONIZATION ROUTES
  app.post("/api/sync", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" });
      }
      
      const user = await storage.getUser(Number(userId));
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      // Update user's last sync time
      const syncTime = new Date();
      await storage.updateUserLastSync(user.id, syncTime);
      
      // In a real implementation, this would sync data from ERPNext
      // and update the local cache
      try {
        // Example: Sync sales orders
        const salesOrders = await erpnextRequest("/api/resource/Sales Order", "GET", {
          fields: JSON.stringify(["name", "customer", "transaction_date", "grand_total", "status"]),
          limit: 20
        });
        
        await storage.createOrUpdateCachedData({
          userId: user.id,
          dataType: "sales_orders",
          data: salesOrders.data || [],
          lastSynced: syncTime
        });
        
        // Example: Sync inventory items
        const items = await erpnextRequest("/api/resource/Item", "GET", {
          fields: JSON.stringify(["name", "item_name", "item_code", "stock_uom", "description"]),
          limit: 50
        });
        
        await storage.createOrUpdateCachedData({
          userId: user.id,
          dataType: "inventory_items",
          data: items.data || [],
          lastSynced: syncTime
        });
        
        res.json({ 
          success: true, 
          message: "Sync completed successfully",
          lastSync: syncTime
        });
      } catch (error) {
        // If ERPNext is unreachable, return cached data with warning
        res.json({ 
          success: true, 
          message: "Using cached data. ERPNext server is unreachable.",
          lastSync: user.lastSync,
          isOfflineSync: true
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error during sync" });
    }
  });

  // DASHBOARD ROUTES
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      // Get dashboard data
      const stats = await storage.getStats(userId);
      const activities = await storage.getActivities(userId, 5);
      const tasks = await storage.getTasks(userId);
      
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            avatarInitials: user.avatarInitials,
            lastSync: user.lastSync
          },
          stats,
          activities,
          tasks
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error fetching dashboard" });
    }
  });
  
  // TASKS ROUTES
  app.get("/api/tasks/:userId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const tasks = await storage.getTasks(userId);
      res.json({ success: true, data: tasks });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error fetching tasks" });
    }
  });
  
  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid task data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Server error creating task" });
      }
    }
  });
  
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { isCompleted } = req.body;
      
      if (typeof isCompleted !== "boolean") {
        return res.status(400).json({ success: false, message: "isCompleted must be a boolean" });
      }
      
      const task = await storage.updateTask(id, isCompleted);
      res.json({ success: true, data: task });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error updating task" });
    }
  });
  
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteTask(id);
      res.json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error deleting task" });
    }
  });

  // INVENTORY ROUTES
  app.get("/api/inventory/:userId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const cachedInventory = await storage.getCachedData(userId, "inventory_items");
      
      // Try to get fresh data from ERPNext if online
      try {
        const items = await erpnextRequest("/api/resource/Item", "GET", {
          fields: JSON.stringify(["name", "item_name", "item_code", "stock_uom", "description"]),
          limit: 50
        });
        
        await storage.createOrUpdateCachedData({
          userId,
          dataType: "inventory_items",
          data: items.data || [],
          lastSynced: new Date()
        });
        
        res.json({ 
          success: true, 
          data: items.data,
          isFresh: true
        });
      } catch (error) {
        // Return cached data if ERPNext is unreachable
        res.json({ 
          success: true, 
          data: cachedInventory?.data || [],
          isFresh: false,
          lastSynced: cachedInventory?.lastSynced
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error fetching inventory" });
    }
  });

  // SALES ROUTES
  app.get("/api/sales/:userId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const cachedSales = await storage.getCachedData(userId, "sales_orders");
      
      // Try to get fresh data from ERPNext if online
      try {
        const salesOrders = await erpnextRequest("/api/resource/Sales Order", "GET", {
          fields: JSON.stringify(["name", "customer", "transaction_date", "grand_total", "status"]),
          limit: 20
        });
        
        await storage.createOrUpdateCachedData({
          userId,
          dataType: "sales_orders",
          data: salesOrders.data || [],
          lastSynced: new Date()
        });
        
        res.json({ 
          success: true, 
          data: salesOrders.data,
          isFresh: true
        });
      } catch (error) {
        // Return cached data if ERPNext is unreachable
        res.json({ 
          success: true, 
          data: cachedSales?.data || [],
          isFresh: false,
          lastSynced: cachedSales?.lastSynced
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error fetching sales orders" });
    }
  });

  // PURCHASES ROUTES
  app.get("/api/purchases/:userId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const cachedPurchases = await storage.getCachedData(userId, "purchase_orders");
      
      // Try to get fresh data from ERPNext if online
      try {
        const purchaseOrders = await erpnextRequest("/api/resource/Purchase Order", "GET", {
          fields: JSON.stringify(["name", "supplier", "transaction_date", "grand_total", "status"]),
          limit: 20
        });
        
        await storage.createOrUpdateCachedData({
          userId,
          dataType: "purchase_orders",
          data: purchaseOrders.data || [],
          lastSynced: new Date()
        });
        
        res.json({ 
          success: true, 
          data: purchaseOrders.data,
          isFresh: true
        });
      } catch (error) {
        // Return cached data if ERPNext is unreachable
        res.json({ 
          success: true, 
          data: cachedPurchases?.data || [],
          isFresh: false,
          lastSynced: cachedPurchases?.lastSynced
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error fetching purchase orders" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
