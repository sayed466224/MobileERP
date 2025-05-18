import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useSyncManager } from "@/lib/syncManager";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Settings, User, HelpCircle, Shield, Download, LogOut,
  Moon, Sun, Smartphone, Wifi, WifiOff, RefreshCw, ChevronRight
} from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";
import { formatRelativeTime } from "@/lib/erpnext";

// Mock user ID (in a real app, this would come from auth context)
const MOCK_USER_ID = 1;

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-sm font-medium text-gray-500 mb-3">{title}</h2>
    <Card>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  </div>
);

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  description,
  onClick,
  rightElement
}) => (
  <div 
    className={`flex items-center justify-between p-4 ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className="mr-3 text-gray-600">{icon}</div>
      <div>
        <p className="font-medium">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </div>
    <div>
      {rightElement || (onClick && <ChevronRight size={18} className="text-gray-400" />)}
    </div>
  </div>
);

const More: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { syncWithFeedback } = useSyncManager(MOCK_USER_ID);
  
  // Fetch user data (would come from an auth context in a real app)
  const user = {
    fullName: "John Doe",
    email: "john.doe@example.com",
    avatarInitials: "JD",
    lastSync: new Date().toISOString()
  };
  
  // Toggle dark mode
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    toast({
      title: theme === "dark" ? "Light mode enabled" : "Dark mode enabled",
      duration: 2000
    });
  };
  
  // Toggle offline mode
  const toggleOfflineMode = () => {
    setIsOfflineMode(!isOfflineMode);
    toast({
      title: !isOfflineMode ? "Offline mode enabled" : "Online mode enabled",
      description: !isOfflineMode 
        ? "App will use cached data when offline" 
        : "App will sync with ERPNext server",
      duration: 3000
    });
  };
  
  // Handle sync button click
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncWithFeedback();
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    toast({
      title: "Logging out",
      description: "You have been logged out of your account",
      duration: 3000
    });
    // In a real app, this would redirect to login page
  };
  
  return (
    <div className="p-4 space-y-6 pb-16">
      {/* User Profile Section */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium text-lg mr-4">
                {user.avatarInitials}
              </div>
              <div>
                <h2 className="font-semibold text-lg">{user.fullName}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Last sync: {formatRelativeTime(user.lastSync)}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-600 p-0 h-auto"
                onClick={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  "Sync now"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* App Settings */}
      <SettingsSection title="APP SETTINGS">
        <SettingsItem
          icon={<Moon size={20} />}
          label="Dark Mode"
          rightElement={
            <Switch 
              checked={theme === "dark"} 
              onCheckedChange={toggleTheme}
            />
          }
        />
        <Separator />
        <SettingsItem
          icon={isOfflineMode ? <WifiOff size={20} /> : <Wifi size={20} />}
          label="Offline Mode"
          description="Use app when offline with cached data"
          rightElement={
            <Switch 
              checked={isOfflineMode} 
              onCheckedChange={toggleOfflineMode}
            />
          }
        />
        <Separator />
        <SettingsItem
          icon={<Download size={20} />}
          label="Auto-sync Data"
          description="Automatically sync when online"
          rightElement={
            <Switch 
              checked={true}
              onCheckedChange={() => {
                toast({
                  title: "Feature coming soon",
                  description: "This feature is not yet available",
                  duration: 3000
                });
              }}
            />
          }
        />
      </SettingsSection>
      
      {/* Account Settings */}
      <SettingsSection title="ACCOUNT">
        <SettingsItem
          icon={<User size={20} />}
          label="Account Settings"
          onClick={() => {
            toast({
              title: "Account settings",
              description: "This feature is coming soon",
              duration: 3000
            });
          }}
        />
        <Separator />
        <SettingsItem
          icon={<Smartphone size={20} />}
          label="Connected Devices"
          description="Manage your devices"
          onClick={() => {
            toast({
              title: "Device management",
              description: "This feature is coming soon",
              duration: 3000
            });
          }}
        />
        <Separator />
        <SettingsItem
          icon={<Shield size={20} />}
          label="Security"
          description="Update password and security settings"
          onClick={() => {
            toast({
              title: "Security settings",
              description: "This feature is coming soon",
              duration: 3000
            });
          }}
        />
      </SettingsSection>
      
      {/* About & Help */}
      <SettingsSection title="ABOUT & HELP">
        <SettingsItem
          icon={<HelpCircle size={20} />}
          label="Help & Support"
          onClick={() => {
            toast({
              title: "Help & Support",
              description: "This feature is coming soon",
              duration: 3000
            });
          }}
        />
        <Separator />
        <SettingsItem
          icon={<Settings size={20} />}
          label="ERPNext Settings"
          description="Configure ERPNext connection"
          onClick={() => {
            toast({
              title: "ERPNext Settings",
              description: "This feature is coming soon",
              duration: 3000
            });
          }}
        />
      </SettingsSection>
      
      {/* Logout Button */}
      <Button 
        variant="destructive" 
        className="w-full mt-6"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
      
      {/* App Info */}
      <div className="text-center text-xs text-gray-400 mt-8">
        <p>MobileERP v1.0.0</p>
        <p className="mt-1">Connected to: demo.erpnext.com</p>
      </div>
    </div>
  );
};

export default More;
