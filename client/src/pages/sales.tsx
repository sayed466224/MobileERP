import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSales, formatCurrency } from "@/lib/erpnext";
import { BottomSheet, BottomSheetHeader, BottomSheetBody, BottomSheetFooter } from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSyncManager } from "@/lib/syncManager";
import SyncStatus from "@/components/shared/SyncStatus";
import { Search, ShoppingCart, ArrowUpDown, Filter, MoreVertical, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

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
            <Badge 
              variant={order.status === "To Deliver and Bill" ? "outline" : "default"}
              className={
                order.status === "Completed" ? "bg-green-100 text-green-800 hover:bg-green-100" : 
                order.status === "To Deliver and Bill" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" :
                "bg-blue-100 text-blue-800 hover:bg-blue-100"
              }
            >
              {order.status}
            </Badge>
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
          <p>Order items are available in online mode</p>
        </div>
      </BottomSheetBody>
      
      <BottomSheetFooter>
        <div className="flex space-x-3">
          <Button className="flex-1">
            Process Order
          </Button>
          <Button variant="outline" size="icon">
            <MoreVertical size={18} />
          </Button>
        </div>
      </BottomSheetFooter>
    </BottomSheet>
  );
};

const Sales: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const { syncWithFeedback } = useSyncManager(MOCK_USER_ID);
  
  // Fetch sales data
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/sales', MOCK_USER_ID],
    queryFn: () => getSales(MOCK_USER_ID),
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
  
  // Filter orders based on search query and active tab
  const filteredOrders = React.useMemo(() => {
    if (!data?.data) return [];
    
    const orders = data.data;
    
    // Filter by status if needed
    let filteredByStatus = orders;
    if (activeTab !== "all") {
      filteredByStatus = orders.filter((order: any) => {
        if (activeTab === "pending" && order.status === "To Deliver and Bill") return true;
        if (activeTab === "processing" && order.status === "Processing") return true;
        if (activeTab === "completed" && order.status === "Completed") return true;
        return false;
      });
    }
    
    // Filter by search query
    if (!searchQuery) return filteredByStatus;
    
    const query = searchQuery.toLowerCase();
    return filteredByStatus.filter((order: any) => {
      const name = (order.name || "").toLowerCase();
      const customer = (order.customer || "").toLowerCase();
      return name.includes(query) || customer.includes(query);
    });
  }, [data?.data, searchQuery, activeTab]);
  
  if (isLoading) {
    return (
      <div className="p-4 space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h3 className="font-medium">Failed to load sales orders</h3>
          <p className="text-sm mt-1">Please check your connection and try again.</p>
          <Button className="mt-3" onClick={handleSync}>
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  // Extract data
  const salesData = data?.data || [];
  const isFresh = data?.isFresh;
  const lastSynced = data?.lastSynced;
  
  // Get status counts for badges
  const statusCounts = salesData.reduce((acc: any, order: any) => {
    const status = order.status;
    if (status === "To Deliver and Bill") acc.pending = (acc.pending || 0) + 1;
    else if (status === "Processing") acc.processing = (acc.processing || 0) + 1;
    else if (status === "Completed") acc.completed = (acc.completed || 0) + 1;
    return acc;
  }, {});
  
  return (
    <div className="p-4 space-y-4">
      {/* Sync Status */}
      <SyncStatus 
        lastSync={lastSynced}
        onSyncClick={handleSync}
        isSyncing={isSyncing}
        className="mb-4"
      />
      
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search orders..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter size={18} />
        </Button>
        <Button variant="outline" size="icon">
          <ArrowUpDown size={18} />
        </Button>
      </div>
      
      {/* Data Freshness Badge */}
      {!isFresh && (
        <div className="bg-amber-50 text-amber-800 p-2 rounded text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          Showing cached data. Sync to update.
        </div>
      )}
      
      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 h-auto">
          <TabsTrigger value="all" className="py-2">
            All
          </TabsTrigger>
          <TabsTrigger value="pending" className="py-2">
            Pending
            {statusCounts.pending && (
              <span className="ml-1 text-xs bg-amber-100 text-amber-800 rounded-full px-1.5">
                {statusCounts.pending}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="processing" className="py-2">
            Processing
          </TabsTrigger>
          <TabsTrigger value="completed" className="py-2">
            Completed
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Orders List */}
      <div className="space-y-3 mt-2">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">
              {searchQuery ? "No orders match your search" : "No orders available"}
            </p>
          </div>
        ) : (
          filteredOrders.map((order: any) => (
            <div 
              key={order.name}
              className="bg-white rounded-xl shadow-sm p-4"
              onClick={() => handleViewOrder(order)}
            >
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 bg-blue-100">
                  {order.status === "To Deliver and Bill" ? (
                    <Clock className="h-5 w-5 text-amber-600" />
                  ) : order.status === "Completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">{order.name}</p>
                    <Badge 
                      variant="outline"
                      className={
                        order.status === "Completed" ? "bg-green-100 text-green-800" : 
                        order.status === "To Deliver and Bill" ? "bg-amber-100 text-amber-800" :
                        "bg-blue-100 text-blue-800"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">Customer: {order.customer}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>{format(new Date(order.transaction_date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="text-sm font-medium">
                      {formatCurrency(order.grand_total)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Order Details Bottom Sheet */}
      <OrderDetails 
        isOpen={isOrderDetailsOpen}
        onClose={() => setIsOrderDetailsOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default Sales;
