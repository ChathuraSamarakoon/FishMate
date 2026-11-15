import { createContext, useContext, useState, type ReactNode } from 'react';
import type {
  FishListing,
  FishermanActivity,
  FishermanDashboardSummary,
  FishermanInquiryItem,
  FishermanInquiryStatus,
  FishermanOrder,
  FishermanOrderStatus,
  FishermanProfile,
  FishingTrip,
  TripCatchRecord,
  TripExpenseRecord,
  TripSaleRecord,
} from '@/types';
import {
  currentFishermanProfile,
  defaultFishermanActivities,
  defaultFishermanInquiries,
  defaultFishermanOrders,
  defaultFishermanSummary,
  defaultFishingTrips,
} from '@/data/fishermanData';
import { fishListings } from '@/data/mockData';

type FishermanContextType = {
  profile: FishermanProfile;
  orders: FishermanOrder[];
  inquiries: FishermanInquiryItem[];
  trips: FishingTrip[];
  listings: FishListing[];
  activities: FishermanActivity[];
  summary: FishermanDashboardSummary;
  updateProfile: (updates: Partial<FishermanProfile>) => void;
  addListing: (newListing: FishListing) => void;
  updateListing: (listingId: string, updates: Partial<FishListing>) => void;
  toggleListingStock: (listingId: string) => void;
  addTrip: (newTrip: FishingTrip) => void;
  updateTrip: (tripId: string, updates: Partial<FishingTrip>) => void;
  addTripCatch: (tripId: string, record: TripCatchRecord) => void;
  addTripExpense: (tripId: string, record: TripExpenseRecord) => void;
  addTripSale: (tripId: string, record: TripSaleRecord) => void;
  updateOrderStatus: (orderId: string, nextStatus?: FishermanOrderStatus) => void;
  replyInquiry: (inquiryId: string, replyText: string) => void;
  closeInquiry: (inquiryId: string) => void;
  updateInquiryStatus: (inquiryId: string, status: FishermanInquiryStatus) => void;
  clearOrders: () => void;
  clearInquiries: () => void;
  resetDemoData: () => void;
  isSimulatingEmpty: boolean;
  toggleSimulateEmpty: () => void;
};

const FishermanContext = createContext<FishermanContextType | null>(null);

export function FishermanProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<FishermanProfile>(currentFishermanProfile);
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

  const updateListing = (listingId: string, updates: Partial<FishListing>) => {
    setListings((prev) =>
      prev.map((item) => (item.id === listingId ? { ...item, ...updates } : item)),
    );
    const activity: FishermanActivity = {
      id: `act-${Date.now()}`,
      type: 'listing',
      title: 'Catch listing updated',
      description: `${updates.name ?? 'Fish item'} details & stock availability updated`,
      timeAgo: 'Just now',
      badge: updates.stockLabel ?? 'Inventory',
    };
    setActivities((prev) => [activity, ...prev]);
  };

  const toggleListingStock = (listingId: string) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id !== listingId) return item;
        const next =
          item.stockLabel === 'Ready stock'
            ? 'Limited stock'
            : item.stockLabel === 'Limited stock'
            ? 'Unavailable'
            : 'Ready stock';
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

  const updateTrip = (tripId: string, updates: Partial<FishingTrip>) => {
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== tripId) return trip;
        const updated = { ...trip, ...updates };

        const sales = updated.salesList ?? [];
        const expenses = updated.expensesList ?? [];
        const calcRevenue = sales.length > 0
          ? sales.reduce((sum, s) => sum + s.totalAmount, 0)
          : updated.revenue ?? 0;
        const calcExpenses = expenses.length > 0
          ? expenses.reduce((sum, e) => sum + e.amount, 0)
          : (updated.fuelCost || 0) + (updated.iceBaitCost || 0) + (updated.otherCost || 0);
        const calcProfit = calcRevenue - calcExpenses;

        return {
          ...updated,
          revenue: calcRevenue,
          profit: calcProfit,
        };
      }),
    );
  };

  const addTripCatch = (tripId: string, record: TripCatchRecord) => {
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== tripId) return trip;
        const existingCatches = trip.catches ?? [];
        const catches = [record, ...existingCatches];
        const catchVolumeKg = catches.reduce((sum, c) => sum + c.weightKg, 0);

        const activity: FishermanActivity = {
          id: `act-${Date.now()}-${record.id}`,
          type: 'trip',
          title: `Catch logged: ${record.species}`,
          description: `${record.weightKg} kg (${record.grade ?? 'Standard'}) on ${trip.tripNumber}`,
          timeAgo: 'Just now',
          badge: `${record.weightKg} kg`,
        };
        setActivities((actPrev) => [activity, ...actPrev]);

        return {
          ...trip,
          catches,
          catchVolumeKg,
        };
      }),
    );
  };

  const addTripExpense = (tripId: string, record: TripExpenseRecord) => {
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== tripId) return trip;
        const existingExpenses = trip.expensesList ?? [];
        const expensesList = [record, ...existingExpenses];
        const totalExpenses = expensesList.reduce((sum, e) => sum + e.amount, 0);

        let fuelCost = trip.fuelCost;
        let iceBaitCost = trip.iceBaitCost;
        let otherCost = trip.otherCost;
        if (record.category === 'fuel') fuelCost += record.amount;
        else if (record.category === 'ice' || record.category === 'bait') iceBaitCost += record.amount;
        else otherCost += record.amount;

        const revenue = trip.salesList && trip.salesList.length > 0
          ? trip.salesList.reduce((sum, s) => sum + s.totalAmount, 0)
          : trip.revenue ?? 0;
        const profit = revenue - totalExpenses;

        const activity: FishermanActivity = {
          id: `act-${Date.now()}-${record.id}`,
          type: 'trip',
          title: `Expense logged: ${record.title}`,
          description: `Rs. ${record.amount.toLocaleString()} for voyage ${trip.tripNumber}`,
          timeAgo: 'Just now',
          badge: `-Rs. ${record.amount.toLocaleString()}`,
        };
        setActivities((actPrev) => [activity, ...actPrev]);

        return {
          ...trip,
          expensesList,
          fuelCost,
          iceBaitCost,
          otherCost,
          profit,
        };
      }),
    );
  };

  const addTripSale = (tripId: string, record: TripSaleRecord) => {
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== tripId) return trip;
        const existingSales = trip.salesList ?? [];
        const salesList = [record, ...existingSales];
        const revenue = salesList.reduce((sum, s) => sum + s.totalAmount, 0);

        const totalExpenses = trip.expensesList && trip.expensesList.length > 0
          ? trip.expensesList.reduce((sum, e) => sum + e.amount, 0)
          : (trip.fuelCost || 0) + (trip.iceBaitCost || 0) + (trip.otherCost || 0);
        const profit = revenue - totalExpenses;

        const activity: FishermanActivity = {
          id: `act-${Date.now()}-${record.id}`,
          type: 'order',
          title: `Sale completed: ${record.buyerName}`,
          description: `${record.quantityKg} kg ${record.speciesSold} · Rs. ${record.totalAmount.toLocaleString()}`,
          timeAgo: 'Just now',
          badge: `+Rs. ${record.totalAmount.toLocaleString()}`,
        };
        setActivities((actPrev) => [activity, ...actPrev]);

        return {
          ...trip,
          salesList,
          revenue,
          profit,
        };
      }),
    );
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
        return {
          ...inq,
          unread: false,
          replied: true,
          status: 'responded',
          replyMessage: replyText,
          repliedAt: 'Just now',
        };
      }),
    );
  };

  const closeInquiry = (inquiryId: string) => {
    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id !== inquiryId) return inq;
        const activity: FishermanActivity = {
          id: `act-${Date.now()}-${inq.id}`,
          type: 'inquiry',
          title: `Inquiry with ${inq.customerName} Closed`,
          description: inq.listingName ? `Regarding ${inq.listingName}` : 'Inquiry resolved',
          timeAgo: 'Just now',
          badge: 'Closed',
        };
        setActivities((actPrev) => [activity, ...actPrev]);
        return { ...inq, unread: false, status: 'closed', closedAt: 'Just now' };
      }),
    );
  };

  const updateInquiryStatus = (inquiryId: string, nextStatus: FishermanInquiryStatus) => {
    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id !== inquiryId) return inq;
        const isResponded = nextStatus === 'responded';
        const isClosed = nextStatus === 'closed';
        const isNew = nextStatus === 'new';

        const activity: FishermanActivity = {
          id: `act-${Date.now()}-${inq.id}`,
          type: 'inquiry',
          title: `Inquiry with ${inq.customerName} set to ${nextStatus.toUpperCase()}`,
          description: inq.listingName ? `Catch: ${inq.listingName}` : 'Inquiry status updated',
          timeAgo: 'Just now',
          badge: isNew ? 'New' : isResponded ? 'Replied' : 'Closed',
        };
        setActivities((actPrev) => [activity, ...actPrev]);

        return {
          ...inq,
          status: nextStatus,
          unread: isNew,
          replied: isResponded,
          closedAt: isClosed ? 'Just now' : inq.closedAt,
        };
      }),
    );
  };

  const updateProfile = (updates: Partial<FishermanProfile>) => {
    setProfile((prev) => {
      const nextTowns = updates.deliveryTowns ?? prev.deliveryTowns ?? ['Negombo'];
      const nextDist = updates.maxDistanceKm ?? prev.maxDistanceKm ?? 15;
      const derivedRadius = `${nextDist} km radius (${nextTowns.slice(0, 3).join(', ')})`;
      return {
        ...prev,
        ...updates,
        deliveryRadius: updates.deliveryRadius ?? derivedRadius,
      };
    });
  };

  const clearOrders = () => {
    setOrders([]);
  };

  const clearInquiries = () => {
    setInquiries([]);
  };

  const resetDemoData = () => {
    setProfile(currentFishermanProfile);
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
    profile,
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
    updateProfile,
    addListing,
    updateListing,
    toggleListingStock,
    addTrip,
    updateTrip,
    addTripCatch,
    addTripExpense,
    addTripSale,
    updateOrderStatus,
    replyInquiry,
    closeInquiry,
    updateInquiryStatus,
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
