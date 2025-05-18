import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "./card";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  changeValue?: string;
  changeDirection?: "up" | "down" | null;
  changeColor?: "default" | "success" | "danger";
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ 
    className, 
    title, 
    value, 
    icon, 
    iconBgColor = "bg-primary-50", 
    changeValue, 
    changeDirection, 
    changeColor = "default",
    ...props 
  }, ref) => {
    const changeColorClasses = {
      default: "text-muted-foreground",
      success: "text-green-600",
      danger: "text-red-500"
    };

    return (
      <Card 
        ref={ref} 
        className={cn("overflow-hidden", className)} 
        {...props}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-semibold mt-1">{value}</p>
              
              {changeValue && (
                <div className={cn("flex items-center text-sm mt-1", changeColorClasses[changeColor])}>
                  {changeDirection && (
                    changeDirection === "up" ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )
                  )}
                  <span>{changeValue}</span>
                </div>
              )}
            </div>
            
            {icon && (
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", iconBgColor)}>
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";

export { StatCard };
