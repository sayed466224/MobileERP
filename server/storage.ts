import { 
  users, activities, tasks, stats, cachedData,
  type User, type InsertUser,
  type Activity, type InsertActivity,
  type Task, type InsertTask,
  type Stat, type InsertStat,
  type CachedData, type InsertCachedData
} from "@shared/schema";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastSync(userId: number, lastSync: Date): Promise<void>;

  // Activity operations
  getActivities(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Task operations
  getTasks(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, isCompleted: boolean): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  // Stat operations
  getStats(userId: number, types?: string[]): Promise<Stat[]>;
  createOrUpdateStat(stat: InsertStat): Promise<Stat>;

  // Cached data operations
  getCachedData(userId: number, dataType: string): Promise<CachedData | undefined>;
  createOrUpdateCachedData(data: InsertCachedData): Promise<CachedData>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private activities: Map<number, Activity>;
  private tasks: Map<number, Task>;
  private stats: Map<number, Stat>;
  private cachedData: Map<string, CachedData>; // key is userId-dataType
  
  currentId: {
    user: number;
    activity: number;
    task: number;
    stat: number;
    cachedData: number;
  };

  constructor() {
    this.users = new Map();
    this.activities = new Map();
    this.tasks = new Map();
    this.stats = new Map();
    this.cachedData = new Map();
    
    this.currentId = {
      user: 1,
      activity: 1,
      task: 1,
      stat: 1,
      cachedData: 1
    };
    
    // Initialize with demo data
    this.initializeDemoData();
  }
  
  private initializeDemoData() {
    // Create demo user
    const demoUser: User = {
      id: 1,
      username: "demo",
      password: "password",
      fullName: "Demo User",
      email: "demo@example.com",
      avatarInitials: "DU",
      lastSync: new Date()
    };
    this.users.set(demoUser.id, demoUser);
    
    // Create demo activities
    const activities: Activity[] = [
      {
        id: this.currentId.activity++,
        userId: 1,
        type: "stock_received",
        title: "Stock Received",
        description: "25 units of Printer Ink added to inventory",
        icon: "package",
        iconBgColor: "bg-green-100",
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        reference: "INV-001",
        referenceType: "inventory",
        assignedTo: "Rajiv Kumar"
      },
      {
        id: this.currentId.activity++,
        userId: 1,
        type: "order_placed",
        title: "New Order Placed",
        description: "Order #ORD-7832 for ₹12,500",
        icon: "shopping-cart",
        iconBgColor: "bg-blue-100",
        timestamp: new Date(Date.now() - 10800000), // 3 hours ago
        reference: "ORD-7832",
        referenceType: "order",
        assignedTo: "Priya Sharma"
      },
      {
        id: this.currentId.activity++,
        userId: 1,
        type: "low_stock",
        title: "Low Stock Alert",
        description: "Laptop Charger (SKU: LP-CHR-45W) below threshold",
        icon: "alert-triangle",
        iconBgColor: "bg-red-100",
        timestamp: new Date(Date.now() - 18000000), // 5 hours ago
        reference: "LP-CHR-45W",
        referenceType: "inventory",
        assignedTo: "5 units remaining"
      }
    ];
    
    activities.forEach(activity => {
      this.activities.set(activity.id, activity);
    });
    
    // Create demo tasks
    const tasks: Task[] = [
      {
        id: this.currentId.task++,
        userId: 1,
        title: "Follow up with supplier about pending order",
        dueDate: new Date(Date.now() + 86400000), // tomorrow
        isCompleted: false,
        completedAt: null
      },
      {
        id: this.currentId.task++,
        userId: 1,
        title: "Prepare monthly inventory report",
        dueDate: new Date(Date.now() + 259200000), // 3 days from now
        isCompleted: false,
        completedAt: null
      },
      {
        id: this.currentId.task++,
        userId: 1,
        title: "Check delivery status of Order #ORD-7830",
        dueDate: new Date(Date.now() - 86400000), // yesterday
        isCompleted: true,
        completedAt: new Date(Date.now() - 43200000) // 12 hours ago
      }
    ];
    
    tasks.forEach(task => {
      this.tasks.set(task.id, task);
    });
    
    // Create demo stats
    const stats: Stat[] = [
      {
        id: this.currentId.stat++,
        userId: 1,
        type: "sales_today",
        value: "24500",
        changePercentage: "12%",
        changeDirection: "up",
        icon: "shopping-cart",
        lastUpdated: new Date()
      },
      {
        id: this.currentId.stat++,
        userId: 1,
        type: "pending_orders",
        value: "12",
        changePercentage: "3",
        changeDirection: "up",
        icon: "clock",
        lastUpdated: new Date()
      }
    ];
    
    stats.forEach(stat => {
      this.stats.set(stat.id, stat);
    });
    
    // Create demo cached data for inventory, sales, and purchases
    const inventoryItems = Array.from({ length: 20 }, (_, i) => ({
      name: `ITEM-${1000 + i}`,
      item_name: `Product ${i + 1}`,
      item_code: `SKU-${1000 + i}`,
      stock_uom: i % 3 === 0 ? "Box" : i % 2 === 0 ? "Kg" : "Nos",
      description: `This is a sample product description for Product ${i + 1}`
    }));
    
    const salesOrders = Array.from({ length: 15 }, (_, i) => ({
      name: `ORD-${7820 + i}`,
      customer: `Customer ${i % 5 + 1}`,
      transaction_date: new Date(Date.now() - i * 86400000 * 2).toISOString(),
      grand_total: (10000 + Math.floor(Math.random() * 50000)).toString(),
      status: i % 3 === 0 ? "To Deliver and Bill" : i % 2 === 0 ? "Processing" : "Completed"
    }));
    
    const purchaseOrders = Array.from({ length: 12 }, (_, i) => ({
      name: `PO-${4500 + i}`,
      supplier: `Supplier ${i % 4 + 1}`,
      transaction_date: new Date(Date.now() - i * 86400000 * 3).toISOString(),
      grand_total: (15000 + Math.floor(Math.random() * 60000)).toString(),
      status: i % 3 === 0 ? "To Receive and Bill" : i % 2 === 0 ? "Processing" : "Completed"
    }));
    
    this.cachedData.set("1-inventory_items", {
      id: this.currentId.cachedData++,
      userId: 1,
      dataType: "inventory_items",
      data: inventoryItems,
      lastSynced: new Date()
    });
    
    this.cachedData.set("1-sales_orders", {
      id: this.currentId.cachedData++,
      userId: 1,
      dataType: "sales_orders",
      data: salesOrders,
      lastSynced: new Date()
    });
    
    this.cachedData.set("1-purchase_orders", {
      id: this.currentId.cachedData++,
      userId: 1,
      dataType: "purchase_orders",
      data: purchaseOrders,
      lastSynced: new Date()
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.user++;
    const user: User = { ...insertUser, id, lastSync: null };
    this.users.set(id, user);
    return user;
  }

  async updateUserLastSync(userId: number, lastSync: Date): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      this.users.set(userId, { ...user, lastSync });
    }
  }

  // Activity operations
  async getActivities(userId: number, limit?: number): Promise<Activity[]> {
    const userActivities = Array.from(this.activities.values())
      .filter((activity) => activity.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? userActivities.slice(0, limit) : userActivities;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentId.activity++;
    const activity: Activity = { ...insertActivity, id };
    this.activities.set(id, activity);
    return activity;
  }

  // Task operations
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter((task) => task.userId === userId)
      .sort((a, b) => {
        // Sort completed tasks last, then by due date
        if (a.isCompleted && !b.isCompleted) return 1;
        if (!a.isCompleted && b.isCompleted) return -1;
        
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentId.task++;
    const task: Task = { ...insertTask, id };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, isCompleted: boolean): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    const updatedTask: Task = {
      ...task,
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    };
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    this.tasks.delete(id);
  }

  // Stat operations
  async getStats(userId: number, types?: string[]): Promise<Stat[]> {
    let userStats = Array.from(this.stats.values())
      .filter((stat) => stat.userId === userId);
    
    if (types && types.length > 0) {
      userStats = userStats.filter((stat) => types.includes(stat.type));
    }
    
    return userStats;
  }

  async createOrUpdateStat(insertStat: InsertStat): Promise<Stat> {
    // Check if stat already exists for this user and type
    const existingStat = Array.from(this.stats.values()).find(
      (stat) => stat.userId === insertStat.userId && stat.type === insertStat.type
    );
    
    if (existingStat) {
      const updatedStat: Stat = {
        ...existingStat,
        value: insertStat.value,
        changePercentage: insertStat.changePercentage,
        changeDirection: insertStat.changeDirection,
        lastUpdated: insertStat.lastUpdated,
      };
      
      this.stats.set(existingStat.id, updatedStat);
      return updatedStat;
    } else {
      const id = this.currentId.stat++;
      const stat: Stat = { ...insertStat, id };
      this.stats.set(id, stat);
      return stat;
    }
  }

  // Cached data operations
  async getCachedData(userId: number, dataType: string): Promise<CachedData | undefined> {
    return Array.from(this.cachedData.values()).find(
      (data) => data.userId === userId && data.dataType === dataType
    );
  }

  async createOrUpdateCachedData(insertData: InsertCachedData): Promise<CachedData> {
    const key = `${insertData.userId}-${insertData.dataType}`;
    const existingData = Array.from(this.cachedData.values()).find(
      (data) => data.userId === insertData.userId && data.dataType === insertData.dataType
    );
    
    if (existingData) {
      const updatedData: CachedData = {
        ...existingData,
        data: insertData.data,
        lastSynced: insertData.lastSynced,
      };
      
      this.cachedData.set(key, updatedData);
      return updatedData;
    } else {
      const id = this.currentId.cachedData++;
      const data: CachedData = { ...insertData, id };
      this.cachedData.set(key, data);
      return data;
    }
  }
}

export const storage = new MemStorage();
