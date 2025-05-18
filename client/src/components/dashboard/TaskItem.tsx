import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { MoreVertical, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TaskItemProps {
  id: number;
  title: string;
  dueDate?: string | null;
  isCompleted: boolean;
  onToggleComplete: (id: number, isCompleted: boolean) => void;
  onDelete: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  id,
  title,
  dueDate,
  isCompleted,
  onToggleComplete,
  onDelete
}) => {
  const formatDueDate = () => {
    if (!dueDate) return "";
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dueDateTime = new Date(dueDate);
    
    if (dueDateTime.toDateString() === today.toDateString()) {
      return `Due today${dueDateTime.getHours() ? ` at ${dueDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}`;
    } else if (dueDateTime.toDateString() === tomorrow.toDateString()) {
      return "Due tomorrow";
    } else {
      return `Due ${dueDateTime.toLocaleDateString()}`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center">
        <button 
          className={cn(
            "w-6 h-6 rounded-full border-2 mr-3 flex-shrink-0 flex items-center justify-center transition-colors",
            isCompleted 
              ? "border-primary-600 bg-primary-600" 
              : "border-gray-300"
          )}
          onClick={() => onToggleComplete(id, !isCompleted)}
        >
          {isCompleted && <Check className="text-white" size={14} />}
        </button>
        
        <div className="flex-1">
          <p className={cn(
            "font-medium",
            isCompleted && "line-through text-gray-400"
          )}>
            {title}
          </p>
          <p className="text-sm text-gray-500">
            {isCompleted 
              ? "Completed" 
              : formatDueDate()
            }
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-gray-400">
              <MoreVertical size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onToggleComplete(id, !isCompleted)}>
              {isCompleted ? "Mark as incomplete" : "Mark as complete"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TaskItem;
