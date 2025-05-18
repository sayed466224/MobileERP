import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Menu, LayoutDashboard, Package, ShoppingCart, 
  Receipt, MoreHorizontal, Search, Bell, Plus 
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, activeTab }) => {
  const [location, navigate] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const navigationItems = [
    { id: "dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/" },
    { id: "inventory", icon: <Package size={20} />, label: "Inventory", path: "/inventory" },
    { id: "sales", icon: <ShoppingCart size={20} />, label: "Sales", path: "/sales" },
    { id: "purchases", icon: <Receipt size={20} />, label: "Purchases", path: "/purchases" },
    { id: "more", icon: <MoreHorizontal size={20} />, label: "More", path: "/more" },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Status bar space for mobile devices */}
      <div className="bg-primary-600 h-safe-top"></div>
      
      {/* Header */}
      <header className="bg-primary-600 shadow-md">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-primary-700">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-primary-600 text-white">
                <div className="flex flex-col h-full">
                  <div className="px-4 py-6 border-b border-primary-500">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 bg-primary-700">
                        <AvatarFallback className="bg-primary-700 text-white">JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="font-medium text-white">John Doe</h2>
                        <p className="text-sm text-primary-100">Administrator</p>
                      </div>
                    </div>
                  </div>
                  
                  <nav className="mt-6 flex flex-col space-y-1 px-3">
                    {navigationItems.map((item) => (
                      <a 
                        key={item.id}
                        href={item.path}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(item.path);
                          setIsSidebarOpen(false);
                        }}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-3 rounded-md transition-colors",
                          location === item.path 
                            ? "bg-primary-700 text-white" 
                            : "text-primary-100 hover:bg-primary-700/50"
                        )}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    ))}
                  </nav>
                  
                  <div className="mt-auto px-4 py-6 border-t border-primary-500">
                    <button className="flex items-center space-x-3 text-primary-100 hover:text-white transition-colors">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="h-5 w-5"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-semibold">MobileERP</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-primary-700">
              <Search size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-primary-700">
              <Bell size={20} />
            </Button>
            <Avatar className="h-8 w-8 bg-primary-700">
              <AvatarFallback className="bg-primary-700 text-white">JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-primary-500">
          {navigationItems.slice(0, 5).map((item) => (
            <button 
              key={item.id}
              className={cn(
                "px-4 py-3 font-medium border-b-2 flex-shrink-0 transition-colors",
                activeTab === item.id 
                  ? "text-white border-white" 
                  : "text-primary-100 border-transparent"
              )}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16">
        {children}
      </main>
      
      {/* Floating Action Button */}
      <div className="fixed right-4 bottom-20 z-10">
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <Plus size={24} />
        </Button>
      </div>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-20">
        <div className="flex justify-around">
          {navigationItems.map((item) => (
            <Link 
              key={item.id}
              href={item.path}
              className={cn(
                "flex flex-col items-center pt-2 pb-1 flex-1 transition-colors",
                activeTab === item.id
                  ? "text-primary-600"
                  : "text-gray-500"
              )}
            >
              {item.icon}
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;
