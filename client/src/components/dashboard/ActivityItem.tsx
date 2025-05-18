import React from "react";
import { cn } from "@/lib/utils";

interface ActivityItemProps {
  icon: React.ReactNode;
  iconBgColor?: string;
  title: string;
  description: string;
  time: string;
  assignedTo?: string;
  actionText?: string;
  onActionClick?: () => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  icon,
  iconBgColor = "bg-green-100",
  title,
  description,
  time,
  assignedTo,
  actionText,
  onActionClick
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-start">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0", iconBgColor)}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
            <span className="text-xs text-gray-400">{time}</span>
          </div>
          
          <div className="mt-2 flex items-center justify-between">
            {assignedTo && (
              <div className="flex items-center text-xs text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3 h-3 mr-1"
                >
                  <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                </svg>
                <span>{assignedTo}</span>
              </div>
            )}
            
            {actionText && (
              <button 
                className="text-primary-600 text-sm font-medium"
                onClick={onActionClick}
              >
                {actionText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
