import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getInventory } from "@/lib/erpnext";
import { BottomSheet, BottomSheetHeader, BottomSheetBody } from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSyncManager } from "@/lib/syncManager";
import SyncStatus from "@/components/shared/SyncStatus";
import { Search, Package, ArrowUpDown, Filter, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock user ID (in a real app, this would come from auth context)
const MOCK_USER_ID = 1;

interface InventoryItemDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any;
}

const InventoryItemDetails: React.FC<InventoryItemDetailsProps> = ({ isOpen, onClose, item }) => {
  if (!item) return null;
  
  return (
    <BottomSheet open={isOpen} onOpenChange={onClose}>
      <BottomSheetHeader title={item.item_name || item.name}>
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
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Item Details</h3>
              <Badge>{item.item_group || "Item"}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Item Code</p>
                <p className="font-medium">{item.item_code || item.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">UOM</p>
                <p className="font-medium">{item.stock_uom || "Nos"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{item.description || "No description available"}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Stock Levels</h3>
            <div className="text-center py-4 text-gray-500">
              <p>Stock information requires online connection</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button className="flex-1">
              Update Stock
            </Button>
            <Button variant="outline" size="icon">
              <MoreVertical size={18} />
            </Button>
          </div>
        </div>
      </BottomSheetBody>
    </BottomSheet>
  );
};

const Inventory: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isItemDetailsOpen, setIsItemDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const { syncWithFeedback } = useSyncManager(MOCK_USER_ID);
  
  // Fetch inventory data
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/inventory', MOCK_USER_ID],
    queryFn: () => getInventory(MOCK_USER_ID),
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
  
  // Open item details
  const handleViewItem = (item: any) => {
    setSelectedItem(item);
    setIsItemDetailsOpen(true);
  };
  
  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    if (!data?.data) return [];
    
    const items = data.data;
    if (!searchQuery) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter((item: any) => {
      const name = (item.item_name || "").toLowerCase();
      const code = (item.item_code || "").toLowerCase();
      return name.includes(query) || code.includes(query);
    });
  }, [data?.data, searchQuery]);
  
  if (isLoading) {
    return (
      <div className="p-4 space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
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
          <h3 className="font-medium">Failed to load inventory</h3>
          <p className="text-sm mt-1">Please check your connection and try again.</p>
          <Button className="mt-3" onClick={handleSync}>
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  // Extract data
  const inventoryData = data?.data || [];
  const isFresh = data?.isFresh;
  const lastSynced = data?.lastSynced;
  
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
            placeholder="Search items..."
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Showing cached data. Sync to update.
        </div>
      )}
      
      {/* Inventory Items List */}
      <div className="space-y-3 mt-2">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">
              {searchQuery ? "No items match your search" : "No inventory items available"}
            </p>
          </div>
        ) : (
          filteredItems.map((item: any, index: number) => (
            <div 
              key={item.name || index}
              className="bg-white rounded-xl shadow-sm p-4"
              onClick={() => handleViewItem(item)}
            >
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <Package className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">{item.item_name || item.name}</p>
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      Math.random() > 0.7 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                    )}>
                      {Math.random() > 0.7 ? "Low Stock" : "In Stock"}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">SKU: {item.item_code || item.name}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <span>{item.stock_uom || "Nos"}</span>
                    </div>
                    <div className="text-sm font-medium">
                      {Math.floor(Math.random() * 100)} units
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Item Details Bottom Sheet */}
      <InventoryItemDetails 
        isOpen={isItemDetailsOpen}
        onClose={() => setIsItemDetailsOpen(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default Inventory;
