import { apiRequest } from "./queryClient";

// User authentication
export async function login(username: string, password: string) {
  const response = await apiRequest("POST", "/api/auth/login", { username, password });
  return response.json();
}

// Data synchronization
export async function syncData(userId: number) {
  const response = await apiRequest("POST", "/api/sync", { userId });
  return response.json();
}

// Dashboard data
export async function getDashboardData(userId: number) {
  const response = await fetch(`/api/dashboard/${userId}`, {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error(`Error fetching dashboard: ${response.statusText}`);
  }
  
  return response.json();
}

// Task management
export async function getTasks(userId: number) {
  const response = await fetch(`/api/tasks/${userId}`, {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error(`Error fetching tasks: ${response.statusText}`);
  }
  
  return response.json();
}

export async function createTask(task: { 
  userId: number; 
  title: string; 
  dueDate?: Date; 
  isCompleted?: boolean 
}) {
  const response = await apiRequest("POST", "/api/tasks", task);
  return response.json();
}

export async function updateTask(id: number, isCompleted: boolean) {
  const response = await apiRequest("PATCH", `/api/tasks/${id}`, { isCompleted });
  return response.json();
}

export async function deleteTask(id: number) {
  const response = await apiRequest("DELETE", `/api/tasks/${id}`);
  return response.json();
}

// Inventory management
export async function getInventory(userId: number) {
  const response = await fetch(`/api/inventory/${userId}`, {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error(`Error fetching inventory: ${response.statusText}`);
  }
  
  return response.json();
}

// Sales management
export async function getSales(userId: number) {
  const response = await fetch(`/api/sales/${userId}`, {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error(`Error fetching sales: ${response.statusText}`);
  }
  
  return response.json();
}

// Purchase management
export async function getPurchases(userId: number) {
  const response = await fetch(`/api/purchases/${userId}`, {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error(`Error fetching purchases: ${response.statusText}`);
  }
  
  return response.json();
}

// Helper function to format a date relative to now
export function formatRelativeTime(date: Date | string | null) {
  if (!date) return "Never";
  
  const now = new Date();
  const then = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  
  return then.toLocaleDateString();
}

// Format currency
export function formatCurrency(amount: number | string, currency = "₹") {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${currency}${numAmount.toLocaleString('en-IN')}`;
}
