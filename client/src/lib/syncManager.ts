import { syncData } from "./erpnext";
import { useToast } from "@/hooks/use-toast";

// Interface for tracking sync status
export interface SyncStatus {
  lastSync: Date | null;
  isSyncing: boolean;
  isOffline: boolean;
}

// Class for managing data synchronization
export class SyncManager {
  private userId: number;
  private lastSync: Date | null = null;
  private autoSyncInterval: number | null = null;
  private onSyncStartCallback: (() => void) | null = null;
  private onSyncCompleteCallback: ((success: boolean, data: any) => void) | null = null;
  
  constructor(userId: number) {
    this.userId = userId;
  }
  
  // Set callbacks
  public onSyncStart(callback: () => void) {
    this.onSyncStartCallback = callback;
    return this;
  }
  
  public onSyncComplete(callback: (success: boolean, data: any) => void) {
    this.onSyncCompleteCallback = callback;
    return this;
  }
  
  // Get last sync time
  public getLastSync(): Date | null {
    return this.lastSync;
  }
  
  // Update last sync time
  public setLastSync(date: Date | null) {
    this.lastSync = date;
  }
  
  // Start auto-sync (e.g., every 15 minutes)
  public startAutoSync(intervalMinutes = 15) {
    if (this.autoSyncInterval) {
      this.stopAutoSync();
    }
    
    const intervalMs = intervalMinutes * 60 * 1000;
    this.autoSyncInterval = window.setInterval(() => {
      this.sync();
    }, intervalMs);
    
    return this;
  }
  
  // Stop auto-sync
  public stopAutoSync() {
    if (this.autoSyncInterval) {
      window.clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
    
    return this;
  }
  
  // Perform sync
  public async sync(): Promise<any> {
    if (this.onSyncStartCallback) {
      this.onSyncStartCallback();
    }
    
    try {
      const result = await syncData(this.userId);
      
      if (result.success) {
        this.lastSync = new Date(result.lastSync);
      }
      
      if (this.onSyncCompleteCallback) {
        this.onSyncCompleteCallback(result.success, result);
      }
      
      return result;
    } catch (error) {
      if (this.onSyncCompleteCallback) {
        this.onSyncCompleteCallback(false, { success: false, message: "Sync failed" });
      }
      throw error;
    }
  }
}

// React hook for using SyncManager
export function useSyncManager(userId: number | null) {
  const { toast } = useToast();
  
  const syncManager = userId ? new SyncManager(userId) : null;
  
  const syncWithFeedback = async () => {
    if (!syncManager) return;
    
    try {
      syncManager.onSyncStart(() => {
        toast({
          title: "Syncing data...",
          description: "Please wait while we sync your data with ERPNext",
          duration: 3000,
        });
      });
      
      const result = await syncManager.sync();
      
      if (result.success) {
        toast({
          title: "Sync Completed",
          description: result.isOfflineSync 
            ? "Using cached data. ERPNext is currently unreachable." 
            : "Your data has been synced successfully.",
          duration: 3000,
        });
      } else {
        toast({
          title: "Sync Failed",
          description: result.message || "Please try again later.",
          variant: "destructive",
          duration: 5000,
        });
      }
      
      return result;
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Network error. Please check your connection.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  return { syncManager, syncWithFeedback };
}
