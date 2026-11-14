import { createContext, useContext, useState, type ReactNode } from 'react';
import type {
  FishListing,
  FishermanActivity,
  FishermanDashboardSummary,
  FishermanInquiryItem,
  FishermanOrder,
  FishermanOrderStatus,
  FishingTrip,
} from '@/types';
import {
  defaultFishermanActivities,
  defaultFishermanInquiries,
  defaultFishermanOrders,
  defaultFishermanSummary,
  defaultFishingTrips,
} from '@/data/fishermanData';
import { fishListings } from '@/data/mockData';

type FishermanContextType = {
  orders: FishermanOrder[];
  inquiries: FishermanInquiryItem[];
  trips: FishingTrip[];
  listings: FishListing[];
  activities: FishermanActivity[];
  summary: FishermanDashboardSummary;
  addListing: (newListing: FishListing) => void;
  toggleListingStock: (listingId: string) => void;
  addTrip: (newTrip: FishingTrip) => void;
  updateOrderStatus: (orderId: string, nextStatus?: FishermanOrderStatus) => void;
  replyInquiry: (inquiryId: string, replyText: string) => void;
  clearOrders: () => void;
  clearInquiries: () => void;
  resetDemoData: () => void;
  isSimulatingEmpty: boolean;
  toggleSimulateEmpty: () => void;
};

const FishermanContext = createContext<FishermanContextType | null>(null);

export function FishermanProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<FishermanOrder[]>(defaultFishermanOrders);
  const [inquiries, setInquiries] = useState<FishermanInquiryItem[]>(defaultFishermanInquiries);
  const [trips, setTrips] = useState<FishingTrip[]>(defaultFishingTrips);
  const [listings, setListings] = useState<FishListing[]>(fishListings);
  const [activities, setActivities] = useState<FishermanActivity[]>(defaultFishermanActivities);
  const [isSimulatingEmpty, setIsSimulatingEmpty] = useState(false);

  // Dynamic calculations derived from live state
  const activeListingsCount = listings.length;
  const newInquiriesCount = inquiries.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const totalTripsCount = trips.length;

  const totalFuelCost = trips.reduce((sum, t) => sum + (t.fuelCost || 0), 0);
  const totalIceBaitCost = trips.reduce((sum, t) => sum + (t.iceBaitCost || 0), 0);
  const totalOtherCost = trips.reduce((sum, t) => sum + (t.otherCost || 0), 0);
  const totalCosts = totalFuelCost + totalIceBaitCost + totalOtherCost;

  // Base mock revenue + any newly completed orders
  const completedOrdersRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const monthlyRevenue = defaultFishermanSummary.monthlyRevenue + completedOrdersRevenue;
  const estimatedProfit = Math.max(0, monthlyRevenue - totalCosts);
  const profitMarginPercent =
    monthlyRevenue > 0 ? parseFloat(((estimatedProfit / monthlyRevenue) * 100).toFixed(1)) : 0;

  const dynamicSummary: FishermanDashboardSummary = {
    activeListingsCount,
    newInquiriesCount,
    pendingOrdersCount,
    totalTripsCount,
    monthlyRevenue,
    estimatedProfit,
    revenueGrowthPercent: defaultFishermanSummary.revenueGrowthPercent,
    profitMarginPercent,
    fuelCost: totalFuelCost || defaultFishermanSummary.fuelCost,
    iceBaitCost: totalIceBaitCost || defaultFishermanSummary.iceBaitCost,
    harborFee: totalOtherCost || defaultFishermanSummary.harborFee,
  };

  const addListing = (newListing: FishListing) => {
    setListings((prev) => [newListing, ...prev]);
    const activity: FishermanActivity = {
      id: `act-${Date.now()}`,
      type: 'listing',
      title: 'New catch batch published',
      description: `${newListing.name} (${newListing.weightLabel}) published to Negombo marketplace`,
      timeAgo: 'Just now',
      badge: 'Live Stock',
    };
    setActivities((prev) => [activity, ...prev]);
  };

  const toggleListingStock = (listingId: string) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id !== listingId) return item;
        const next = item.stockLabel === 'Ready stock' ? 'Limited stock' : 'Ready stock';
        return { ...item, stockLabel: next };
      }),
    );
  };

  const addTrip = (newTrip: FishingTrip) => {
    setTrips((prev) => [newTrip, ...prev]);
    const activity: FishermanActivity = {
      id: `act-${Date.now()}`,
      type: 'trip',
      title: `Voyage ${newTrip.tripNumber} initiated`,
      description: `${newTrip.boatName} heading towards ${newTrip.harbor}`,
      timeAgo: 'Just now',
      badge: 'Voyage Active',
    };
    setActivities((prev) => [activity, ...prev]);
  };

  const updateOrderStatus = (orderId: string, nextStatus?: FishermanOrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        let resolvedNext: FishermanOrderStatus = nextStatus ?? 'preparing';
        if (!nextStatus) {
          if (order.status === 'pending') resolvedNext = 'preparing';
          else if (order.status === 'preparing') resolvedNext = 'ready';
          else if (order.status === 'ready') resolvedNext = 'dispatched';
          else if (order.status === 'dispatched') resolvedNext = 'completed';
        }

        const activity: FishermanActivity = {
          id: `act-${Date.now()}-${order.id}`,
          type: 'order',
          title: `Order ${order.orderNumber} updated to ${resolvedNext.toUpperCase()}`,
          description: `Customer ${order.customerName} · Total Rs. ${order.totalAmount.toLocaleString()}`,
          timeAgo: 'Just now',
          badge: resolvedNext,
        };
        setActivities((actPrev) => [activity, ...actPrev]);

        return { ...order, status: resolvedNext };
      }),
    );
  };

  const replyInquiry = (inquiryId: string, replyText: string) => {
    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id !== inquiryId) return inq;
        const activity: FishermanActivity = {
          id: `act-${Date.now()}-${inq.id}`,
          type: 'inquiry',
          title: `Replied to ${inq.customerName}`,
          description: `"${replyText.slice(0, 60)}..."`,
          timeAgo: 'Just now',
          badge: 'Replied',
        };
        setActivities((actPrev) => [activity, ...actPrev]);
        return { ...inq, unread: false, replied: true };
      }),
    );
  };

  const clearOrders = () => {
    setOrders([]);
  };

  const clearInquiries = () => {
    setInquiries([]);
  };

  const resetDemoData = () => {
    setOrders(defaultFishermanOrders);
    setInquiries(defaultFishermanInquiries);
    setTrips(defaultFishingTrips);
    setListings(fishListings);
    setActivities(defaultFishermanActivities);
    setIsSimulatingEmpty(false);
  };

  const toggleSimulateEmpty = () => {
    if (isSimulatingEmpty) {
      resetDemoData();
    } else {
      setOrders([]);
      setInquiries([]);
      setIsSimulatingEmpty(true);
    }
  };

  const value: FishermanContextType = {
    orders: isSimulatingEmpty ? [] : orders,
    inquiries: isSimulatingEmpty ? [] : inquiries,
    trips,
    listings,
    activities,
    summary: isSimulatingEmpty
      ? {
          ...dynamicSummary,
          pendingOrdersCount: 0,
          newInquiriesCount: 0,
        }
      : dynamicSummary,
    addListing,
    toggleListingStock,
    addTrip,
    updateOrderStatus,
    replyInquiry,
    clearOrders,
    clearInquiries,
    resetDemoData,
    isSimulatingEmpty,
    toggleSimulateEmpty,
  };

  return <FishermanContext.Provider value={value}>{children}</FishermanContext.Provider>;
}

export function useFisherman() {
  const context = useContext(FishermanContext);
  if (!context) {
    throw new Error('useFisherman must be used within a FishermanProvider');
  }
  return context;
}
