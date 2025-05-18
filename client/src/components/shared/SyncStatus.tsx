import React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/erpnext";

interface SyncStatusProps {
  lastSync: Date | string | null;
  onSyncClick: () => void;
  isSyncing?: boolean;
  className?: string;
}

const SyncStatus: React.FC<SyncStatusProps> = ({
  lastSync,
  onSyncClick,
  isSyncing = false,
  className
}) => {
  const formattedTime = lastSync ? formatRelativeTime(lastSync) : "Never";
  
  return (
    <div className={cn(
      "bg-amber-500 text-white p-3 rounded-lg flex items-center justify-between",
      className
    )}>
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" />
        <span>Last synced {formattedTime}</span>
      </div>
      <Button 
        size="sm" 
        variant="secondary" 
        className="bg-white text-amber-600 hover:bg-amber-50 hover:text-amber-700"
        onClick={onSyncClick}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <>
            <RotateCw className="h-4 w-4 mr-1 animate-spin" />
            Syncing...
          </>
        ) : (
          "Sync Now"
        )}
      </Button>
    </div>
  );
};

export default SyncStatus;
