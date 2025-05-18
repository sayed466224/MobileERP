import React from "react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = "Loading...",
  className
}) => {
  return (
    <div className={cn(
      "fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center",
      className
    )}>
      <div className="bg-white p-5 rounded-xl shadow-lg flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
