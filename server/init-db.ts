import { db } from "./db";
import {
  users, activities, tasks, stats, cachedData,
  type User, type Activity, type Task, type Stat, type CachedData
} from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Initialize the database with demo data
 * This should only be run once
 */
export async function initializeDemoData() {
  // Check if demo user already exists 
  const existingUsers = await db.select().from(users).where(eq(users.username, "demo"));
  
  if (existingUsers.length > 0) {
    console.log('Demo data already exists, skipping initialization');
    return;
  }
  
  console.log('Initializing database with demo data...');
  
  // Create demo user
  const [demoUser] = await db.insert(users).values({
    username: "demo",
    password: "password",
    fullName: "Demo User",
    email: "demo@example.com",
    avatarInitials: "DU",
    lastSync: new Date()
  }).returning();
  
  // Create demo activities
  const activities_data = [
    {
      userId: demoUser.id,
      type: "stock_received",
      title: "Stock Received",
      description: "25 units of Printer Ink added to inventory",
      icon: "package",
      iconBgColor: "bg-green-100",
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      reference: "INV-001",
      referenceType: "inventory",
      assignedTo: "Rajiv Kumar",
      actionText: "View"
    },
    {
      userId: demoUser.id,
      type: "order_placed",
      title: "New Order Placed",
      description: "Order #ORD-7832 for ₹12,500",
      icon: "shopping-cart",
      iconBgColor: "bg-blue-100",
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      reference: "ORD-7832",
      referenceType: "order",
      assignedTo: "Priya Sharma",
      actionText: "Process"
    },
    {
      userId: demoUser.id,
      type: "low_stock",
      title: "Low Stock Alert",
      description: "Laptop Charger (SKU: LP-CHR-45W) below threshold",
      icon: "alert-triangle",
      iconBgColor: "bg-red-100",
      timestamp: new Date(Date.now() - 18000000), // 5 hours ago
      reference: "LP-CHR-45W",
      referenceType: "inventory",
      assignedTo: "5 units remaining",
      actionText: "Order"
    }
  ];
  
  await db.insert(activities).values(activities_data);
  
  // Create demo tasks
  const tasks_data = [
    {
      userId: demoUser.id,
      title: "Follow up with supplier about pending order",
      dueDate: new Date(Date.now() + 86400000), // tomorrow
      isCompleted: false,
      completedAt: null
    },
    {
      userId: demoUser.id,
      title: "Prepare monthly inventory report",
      dueDate: new Date(Date.now() + 259200000), // 3 days from now
      isCompleted: false,
      completedAt: null
    },
    {
      userId: demoUser.id,
      title: "Check delivery status of Order #ORD-7830",
      dueDate: new Date(Date.now() - 86400000), // yesterday
      isCompleted: true,
      completedAt: new Date(Date.now() - 43200000) // 12 hours ago
    }
  ];
  
  await db.insert(tasks).values(tasks_data);
  
  // Create demo stats
  const stats_data = [
    {
      userId: demoUser.id,
      type: "sales_today",
      value: "24500",
      changePercentage: "12%",
      changeDirection: "up",
      icon: "shopping-cart",
      lastUpdated: new Date()
    },
    {
      userId: demoUser.id,
      type: "pending_orders",
      value: "12",
      changePercentage: "3",
      changeDirection: "up",
      icon: "clock",
      lastUpdated: new Date()
    }
  ];
  
  await db.insert(stats).values(stats_data);
  
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
  
  await db.insert(cachedData).values({
    userId: demoUser.id,
    dataType: "inventory_items",
    data: inventoryItems,
    lastSynced: new Date()
  });
  
  await db.insert(cachedData).values({
    userId: demoUser.id,
    dataType: "sales_orders",
    data: salesOrders,
    lastSynced: new Date()
  });
  
  await db.insert(cachedData).values({
    userId: demoUser.id,
    dataType: "purchase_orders",
    data: purchaseOrders,
    lastSynced: new Date()
  });
  
  console.log('Database initialized with demo data');
}