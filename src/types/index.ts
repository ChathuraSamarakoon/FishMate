import type { ImageSourcePropType } from 'react-native';

export type PlaceholderScreen = {
  title: string;
  description: string;
};

export type CustomerCategory = {
  id: string;
  label: string;
  icon: string;
};

export type FishListing = {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  price: number;
  unit: string;
  weightLabel: string;
  availableKg: number;
  stockLabel: string;
  freshness: string;
  rating: number;
  reviewCount: number;
  location: string;
  deliveryEta: string;
  distance: string;
  image: ImageSourcePropType;
  sellerId: string;
  tags: string[];
};

export type FishermanProfile = {
  id: string;
  name: string;
  title: string;
  village: string;
  contactNumber: string;
  bio: string;
  deliveryRadius: string;
  joined: string;
  responseTime: string;
  rating: number;
  completedOrders: number;
  avatar: ImageSourcePropType;
  shopImages: ImageSourcePropType[];
  specialties: string[];
  boatName?: string;
  registrationNumber?: string;
  stallAddress?: string;
  harborMooring?: string;
  operatingHours?: string;
  deliveryAvailable?: boolean;
  maxDistanceKm?: number;
  deliveryFee?: number;
  freeDeliveryThreshold?: number;
  deliveryTowns?: string[];
};

export type FishermanOrderStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'dispatched'
  | 'completed'
  | 'cancelled';

export type FishermanOrderItem = {
  listingId: string;
  fishName: string;
  quantityKg: number;
  pricePerKg: number;
  totalPrice: number;
};

export type FishermanOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerLocation: string;
  items: FishermanOrderItem[];
  totalAmount: number;
  status: FishermanOrderStatus;
  createdAt: string;
  deliveryTime: string;
  note?: string;
};

export type FishermanInquiryItem = {
  id: string;
  customerName: string;
  customerPhone?: string;
  listingId?: string;
  listingName?: string;
  message: string;
  timeAgo: string;
  unread: boolean;
  replied: boolean;
};

export type FishingTrip = {
  id: string;
  tripNumber: string;
  boatName: string;
  harbor: string;
  departureDate: string;
  returnDate: string;
  catchVolumeKg: number;
  fuelCost: number;
  iceBaitCost: number;
  otherCost: number;
  status: 'completed' | 'ongoing' | 'planned';
};

export type FishermanActivity = {
  id: string;
  type: 'order' | 'inquiry' | 'trip' | 'payment' | 'listing';
  title: string;
  description: string;
  timeAgo: string;
  badge?: string;
};

export type FishermanDashboardSummary = {
  activeListingsCount: number;
  newInquiriesCount: number;
  pendingOrdersCount: number;
  totalTripsCount: number;
  monthlyRevenue: number;
  estimatedProfit: number;
  revenueGrowthPercent: number;
  profitMarginPercent: number;
  fuelCost: number;
  iceBaitCost: number;
  harborFee: number;
};
