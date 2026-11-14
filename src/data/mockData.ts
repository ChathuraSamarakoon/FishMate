import type { CustomerCategory, FishListing, FishermanProfile, PlaceholderScreen } from '@/types';

const tuna = require('../../assets/customer/tuna.jpg');
const redSnapper = require('../../assets/customer/red_snapper.jpg');
const prawns = require('../../assets/customer/prawns.jpg');
const mackerel = require('../../assets/customer/mackerel.jpg');
const blueCrab = require('../../assets/customer/blue_crab.jpg');
const fisherman1 = require('../../assets/customer/fisherman_1.jpg');
const fisherman2 = require('../../assets/customer/fisherman_2.jpg');
const shop1 = require('../../assets/customer/shop_1.jpg');
const shop2 = require('../../assets/customer/shop_2.jpg');

export const welcomeContent: PlaceholderScreen = {
  title: 'FishMate',
  description: 'Frontend workspace ready. Choose a route to preview its placeholder screen.',
};

export const categories: CustomerCategory[] = [
  { id: 'all', label: 'All', icon: '✦' },
  { id: 'fish', label: 'Fish', icon: '◈' },
  { id: 'shellfish', label: 'Shellfish', icon: '◌' },
  { id: 'premium', label: 'Premium', icon: '✧' },
];

export const fishermen: FishermanProfile[] = [
  {
    id: 'fisher-01',
    name: 'Sunil Perera',
    title: 'Trusted Harbor Seller',
    village: 'Negombo Fish Harbor',
    contactNumber: '07X XXX XXXX (demo)',
    bio: 'Sunil sells same-day catches from the western coast, with careful cleaning, cold storage, and reliable home delivery for nearby buyers.',
    deliveryRadius: '12 km radius',
    joined: 'Joined 2024',
    responseTime: 'Usually replies in 6 mins',
    rating: 4.9,
    completedOrders: 284,
    avatar: fisherman1,
    shopImages: [shop1],
    specialties: ['Yellowfin tuna', 'Red snapper', 'Same-day cleaning', 'Fast delivery'],
  },
  {
    id: 'fisher-02',
    name: 'Kasun Silva',
    title: 'Fresh Catch Specialist',
    village: 'Weligama Landing Site',
    contactNumber: '07X XXX XXXX (demo)',
    bio: 'Kasun focuses on premium prawns, mackerel, and blue crab, with neatly packed seafood and quick response times for customer requests.',
    deliveryRadius: '8 km radius',
    joined: 'Joined 2025',
    responseTime: 'Usually replies in 10 mins',
    rating: 4.8,
    completedOrders: 191,
    avatar: fisherman2,
    shopImages: [shop2],
    specialties: ['Jumbo prawns', 'King mackerel', 'Blue crab', 'Market pickup'],
  },
];

export const fishListings: FishListing[] = [
  {
    id: 'listing-01',
    name: 'Yellowfin Tuna',
    category: 'Premium fish',
    shortDescription: 'Fresh whole tuna, ideal for steaks and sashimi-style cuts.',
    description:
      'Fresh yellowfin tuna landed this morning, chilled immediately after catch and ready for cleaning or portioning. Great for grilling, curry, or premium fillets.',
    price: 4200,
    unit: '/kg',
    weightLabel: '6.5 kg available',
    availableKg: 6.5,
    stockLabel: 'Ready stock',
    freshness: 'Caught 3 hours ago',
    rating: 4.9,
    reviewCount: 126,
    location: 'Negombo',
    deliveryEta: '35–45 min',
    distance: '3.2 km away',
    image: tuna,
    sellerId: 'fisher-01',
    tags: ['Best seller', 'Premium', 'Fast delivery'],
  },
  {
    id: 'listing-02',
    name: 'Red Snapper',
    category: 'Coastal fish',
    shortDescription: 'Firm white meat, ideal for curry, frying, or baking.',
    description:
      'Bright red snapper with clean texture and rich flavor. Packed on ice and available as whole fish or cleaned to your request.',
    price: 3150,
    unit: '/kg',
    weightLabel: '4 kg available',
    availableKg: 4,
    stockLabel: 'Limited stock',
    freshness: 'Caught this morning',
    rating: 4.8,
    reviewCount: 89,
    location: 'Negombo',
    deliveryEta: '30–40 min',
    distance: '4.1 km away',
    image: redSnapper,
    sellerId: 'fisher-01',
    tags: ['Top rated', 'Cleaned on request'],
  },
  {
    id: 'listing-03',
    name: 'Jumbo Prawns',
    category: 'Shellfish',
    shortDescription: 'Large prawns perfect for grill, devilled, or butter garlic.',
    description:
      'Fresh jumbo prawns packed on ice and carefully sorted for size. Excellent texture and sweetness, ideal for restaurant-style cooking at home.',
    price: 3650,
    unit: '/kg',
    weightLabel: '3.2 kg available',
    availableKg: 3.2,
    stockLabel: 'Fresh batch',
    freshness: 'Packed 2 hours ago',
    rating: 4.9,
    reviewCount: 101,
    location: 'Weligama',
    deliveryEta: '40–55 min',
    distance: '5.8 km away',
    image: prawns,
    sellerId: 'fisher-02',
    tags: ['Chef choice', 'Large size'],
  },
  {
    id: 'listing-04',
    name: 'King Mackerel',
    category: 'Daily catch',
    shortDescription: 'Lean, flavorful fish for steaks, curry, or frying.',
    description:
      'Fresh king mackerel arranged on ice and available for same-day delivery. Ideal for slices, steaks, or traditional fish curry.',
    price: 2600,
    unit: '/kg',
    weightLabel: '5 kg available',
    availableKg: 5,
    stockLabel: 'Ready for order',
    freshness: 'Landed today',
    rating: 4.7,
    reviewCount: 73,
    location: 'Weligama',
    deliveryEta: '45–60 min',
    distance: '6.5 km away',
    image: mackerel,
    sellerId: 'fisher-02',
    tags: ['Everyday value', 'Steak cut'],
  },
  {
    id: 'listing-05',
    name: 'Blue Crab',
    category: 'Shellfish',
    shortDescription: 'Sweet, meaty crab ideal for chilli crab or curry.',
    description:
      'Fresh blue swimming crabs stored on ice with firm meat and rich flavor. Suitable for seafood platters, curry, or premium shellfish dishes.',
    price: 2950,
    unit: '/kg',
    weightLabel: '2.8 kg available',
    availableKg: 2.8,
    stockLabel: 'Small batch only',
    freshness: 'Arrived 1 hour ago',
    rating: 4.8,
    reviewCount: 64,
    location: 'Weligama',
    deliveryEta: '50–65 min',
    distance: '7.0 km away',
    image: blueCrab,
    sellerId: 'fisher-02',
    tags: ['Premium shellfish', 'Popular today'],
  },
];

export const featuredListings = [fishListings[0], fishListings[2], fishListings[1]];
export const nearbyListings = [fishListings[3], fishListings[4]];

export function getListingById(id?: string) {
  return fishListings.find((item) => item.id === id);
}

export function getFishermanById(id?: string) {
  return fishermen.find((item) => item.id === id);
}

export function getListingsBySellerId(sellerId?: string) {
  return fishListings.filter((item) => item.sellerId === sellerId);
}
