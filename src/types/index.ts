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
};
