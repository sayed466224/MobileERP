import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { WifiOff } from "lucide-react";

interface OfflineIndicatorProps {
  className?: string;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className }) => {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    // Automatically hide after 5 seconds, but keep component mounted
    const timer = setTimeout(() => {
      setShow(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={cn(
      "fixed top-0 inset-x-0 bg-red-500 text-white p-2 text-center z-40 transition-transform duration-300",
      show ? "translate-y-0" : "-translate-y-full",
      className
    )}>
      <div className="flex items-center justify-center">
        <WifiOff className="h-4 w-4 mr-2" />
        <p className="text-sm font-medium">You are offline. Some features may be limited.</p>
      </div>
    </div>
  );
};

export default OfflineIndicator;
