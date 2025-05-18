import React, { useState } from "react";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { getDashboardData, createTask, updateTask, deleteTask } from "@/lib/erpnext";
import { StatCard } from "@/components/ui/stat-card";
import { BottomSheet, BottomSheetHeader, BottomSheetBody, BottomSheetFooter } from "@/components/ui/bottom-sheet";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import SyncStatus from "@/components/shared/SyncStatus";
import ActivityItem from "@/components/dashboard/ActivityItem";
import TaskItem from "@/components/dashboard/TaskItem";
import { useSyncManager } from "@/lib/syncManager";
import { queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/erpnext";
import {
  LayoutDashboard, ShoppingCart, Truck, Package2, AlertTriangle,
  MoreVertical, Watch, Calendar, CreditCard
} from "lucide-react";

// Mock user ID (in a real app, this would come from auth context)
const MOCK_USER_ID = 1;

interface OrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  order?: any;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ isOpen, onClose, order }) => {
  if (!order) return null;
  
  return (
    <BottomSheet open={isOpen} onOpenChange={onClose}>
      <BottomSheetHeader title={`Order #${order.name}`}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <MoreVertical size={18} />
        </Button>
      </BottomSheetHeader>
      
      <BottomSheetBody>
        {/* Order Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">{format(new Date(order.transaction_date), 'MMM dd, yyyy')}</p>
            </div>
            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
              {order.status}
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-medium">{order.customer}</p>
          </div>
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-medium">{formatCurrency(order.grand_total)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Payment Status</p>
            <p className="font-medium text-green-600">Paid</p>
          </div>
        </div>
        
        {/* Order Items would be fetched from the API */}
        <h3 className="font-medium mb-3">Order Items</h3>
        <div className="text-center py-8 text-gray-500">
          <p>Order items are available in offline mode</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3 mb-6 mt-6">
          <Button className="flex-1">
            Process Order
          </Button>
          <Button variant="outline" size="icon">
            <MoreVertical size={18} />
          </Button>
        </div>
      </BottomSheetBody>
    </BottomSheet>
  );
};

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const { syncWithFeedback } = useSyncManager(MOCK_USER_ID);
  
  // Fetch dashboard data
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard', MOCK_USER_ID],
    queryFn: () => getDashboardData(MOCK_USER_ID),
  });
  
  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: (title: string) => {
      return createTask({
        userId: MOCK_USER_ID,
        title,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Due tomorrow
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard', MOCK_USER_ID] });
      toast({ title: "Task created", description: "Your new task has been added." });
      setNewTaskTitle("");
      setIsTaskDialogOpen(false);
    },
    onError: () => {
      toast({ 
        title: "Failed to create task", 
        description: "Please try again later.", 
        variant: "destructive" 
      });
    }
  });
  
  // Toggle task completion mutation
  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: number, isCompleted: boolean }) => {
      return updateTask(id, isCompleted);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard', MOCK_USER_ID] });
    }
  });
  
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => {
      return deleteTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard', MOCK_USER_ID] });
      toast({ title: "Task deleted", description: "The task has been removed." });
    }
  });
  
  // Handle sync button click
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncWithFeedback();
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Open order details
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="p-4 space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded-xl"></div>
          <div className="h-20 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h3 className="font-medium">Failed to load dashboard</h3>
          <p className="text-sm mt-1">Please check your connection and try again.</p>
          <Button className="mt-3" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/dashboard', MOCK_USER_ID] })}>
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  // Extract data from the query result
  const dashboardData = data?.data;
  const user = dashboardData?.user;
  const stats = dashboardData?.stats || [];
  const activities = dashboardData?.activities || [];
  const tasks = dashboardData?.tasks || [];
  
  return (
    <div id="dashboard-view" className="p-4 space-y-6">
      {/* Sync Status */}
      <SyncStatus 
        lastSync={user?.lastSync}
        onSyncClick={handleSync}
        isSyncing={isSyncing}
        className="mb-4"
      />
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Sales Today"
          value={formatCurrency(24500)}
          icon={<ShoppingCart className="h-5 w-5 text-primary-600" />}
          iconBgColor="bg-primary-50"
          changeValue="12% from yesterday"
          changeDirection="up"
          changeColor="success"
        />
        <StatCard
          title="Pending Orders"
          value="12"
          icon={<Watch className="h-5 w-5 text-amber-500" />}
          iconBgColor="bg-amber-50"
          changeValue="3 new today"
          changeDirection="up"
          changeColor="danger"
        />
      </div>

      {/* Recent Activity */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <button className="text-primary-600 text-sm font-medium">See All</button>
        </div>
        
        <div className="space-y-3">
          <ActivityItem
            icon={<Package2 className="h-5 w-5 text-green-600" />}
            iconBgColor="bg-green-100"
            title="Stock Received"
            description="25 units of Printer Ink added to inventory"
            time="2h ago"
            assignedTo="Rajiv Kumar"
            actionText="View"
          />
          
          <ActivityItem
            icon={<ShoppingCart className="h-5 w-5 text-primary-600" />}
            iconBgColor="bg-blue-100"
            title="New Order Placed"
            description="Order #ORD-7832 for ₹12,500"
            time="3h ago"
            assignedTo="Priya Sharma"
            actionText="Process"
            onActionClick={() => handleViewOrder({
              name: "ORD-7832",
              customer: "Priya Sharma",
              transaction_date: "2023-10-12",
              grand_total: "12500",
              status: "Pending"
            })}
          />
          
          <ActivityItem
            icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
            iconBgColor="bg-red-100"
            title="Low Stock Alert"
            description="Laptop Charger (SKU: LP-CHR-45W) below threshold"
            time="5h ago"
            assignedTo="5 units remaining"
            actionText="Order"
          />
        </div>
      </div>

      {/* Tasks & Reminders */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Tasks</h2>
          <button 
            className="text-primary-600 text-sm font-medium"
            onClick={() => setIsTaskDialogOpen(true)}
          >
            Add Task
          </button>
        </div>
        
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-500">No tasks yet. Add your first task!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                id={task.id}
                title={task.title}
                dueDate={task.dueDate}
                isCompleted={task.isCompleted}
                onToggleComplete={(id, isCompleted) => 
                  toggleTaskMutation.mutate({ id, isCompleted })
                }
                onDelete={(id) => deleteTaskMutation.mutate(id)}
              />
            ))
          )}
        </div>
      </div>
      
      {/* Add Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-4">
            <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
            <Input
              placeholder="Enter task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => addTaskMutation.mutate(newTaskTitle)}
                disabled={!newTaskTitle.trim() || addTaskMutation.isPending}
              >
                {addTaskMutation.isPending ? "Adding..." : "Add Task"}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
      
      {/* Order Details Bottom Sheet */}
      <OrderDetails 
        isOpen={isOrderDetailsOpen}
        onClose={() => setIsOrderDetailsOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default Dashboard;
