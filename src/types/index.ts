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
  galleryImages?: ImageSourcePropType[];
  listingDate?: string;
  sellingLocation?: string;
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
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'dispatched'
  | 'delivered'
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
  subtotal?: number;
  deliveryFee?: number;
  paymentMethod?: 'cash_on_delivery' | 'bank_transfer' | 'online_card';
  paymentStatus?: 'paid' | 'pending' | 'refunded';
  deliveryRiderName?: string;
  deliveryRiderPhone?: string;
  rejectionReason?: string;
};

export type FishermanInquiryStatus = 'new' | 'responded' | 'closed';

export type FishermanInquiryItem = {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerLocation?: string;
  listingId?: string;
  listingName?: string;
  requestedQuantityKg?: number;
  message: string;
  timeAgo: string;
  receivedDate?: string;
  unread: boolean;
  replied: boolean;
  status?: FishermanInquiryStatus;
  replyMessage?: string;
  repliedAt?: string;
  closedAt?: string;
};

export type TripCatchRecord = {
  id: string;
  species: string;
  weightKg: number;
  grade?: string;
  storageMethod?: string;
  recordedAt: string;
  estimatedValue?: number;
};

export type TripExpenseRecord = {
  id: string;
  category: 'fuel' | 'ice' | 'bait' | 'harbor' | 'food' | 'maintenance' | 'other';
  title: string;
  amount: number;
  receiptNote?: string;
  recordedAt: string;
};

export type TripSaleRecord = {
  id: string;
  buyerName: string;
  buyerType: 'wholesale_auction' | 'restaurant' | 'direct_consumer' | 'retail_stall';
  speciesSold: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  paymentStatus: 'paid_cash' | 'paid_bank' | 'pending';
  recordedAt: string;
  sourceType?: 'harbor_direct' | 'customer_app_order';
  orderId?: string;
  orderNumber?: string;
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
  revenue?: number;
  profit?: number;
  nauticalMiles?: number;
  targetSpecies?: string[];
  crewCount?: number;
  isOvernight?: boolean;
  tripDate?: string;
  catches?: TripCatchRecord[];
  expensesList?: TripExpenseRecord[];
  salesList?: TripSaleRecord[];
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
