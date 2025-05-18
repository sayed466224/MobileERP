import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Sales from "@/pages/sales";
import Purchases from "@/pages/purchases";
import More from "@/pages/more";
import MobileLayout from "@/components/layouts/MobileLayout";
import OfflineIndicator from "@/components/shared/OfflineIndicator";
import LoadingIndicator from "@/components/shared/LoadingIndicator";
import { useState, useEffect } from "react";

function Router() {
  const [location] = useLocation();
  
  const getActiveTab = () => {
    if (location === "/") return "dashboard";
    if (location.startsWith("/inventory")) return "inventory";
    if (location.startsWith("/sales")) return "sales";
    if (location.startsWith("/purchases")) return "purchases";
    if (location.startsWith("/more")) return "more";
    return "dashboard";
  };

  return (
    <MobileLayout activeTab={getActiveTab()}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/sales" component={Sales} />
        <Route path="/purchases" component={Purchases} />
        <Route path="/more" component={More} />
        <Route component={NotFound} />
      </Switch>
    </MobileLayout>
  );
}

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {!isOnline && <OfflineIndicator />}
        {isLoading && <LoadingIndicator message="Syncing data..." />}
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
