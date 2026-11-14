import { createContext, useContext, useState, type ReactNode } from 'react';

export type DemoCartItem = { listingId: string; kg: number };
export type DemoInquiry = { id: string; sellerId: string; listingId?: string; message: string; createdAt: string };

type MarketplaceState = {
  cart: DemoCartItem[];
  inquiries: DemoInquiry[];
  addToCart: (listingId: string, kg: number) => void;
  saveDemoInquiry: (sellerId: string, message: string, listingId?: string) => void;
};

const MarketplaceContext = createContext<MarketplaceState | null>(null);

/** In-memory prototype state. Does NOT place an order or send any inquiry to a server. */
export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<DemoCartItem[]>([]);
  const [inquiries, setInquiries] = useState<DemoInquiry[]>([]);
  const addToCart = (listingId: string, kg: number) => {
    setCart((previous) => {
      const match = previous.find((entry) => entry.listingId === listingId);
      if (match) return previous.map((entry) => entry.listingId === listingId ? { ...entry, kg: entry.kg + kg } : entry);
      return [...previous, { listingId, kg }];
    });
  };
  const saveDemoInquiry = (sellerId: string, message: string, listingId?: string) => {
    setInquiries((previous) => [{ id: `demo-${Date.now()}-${previous.length}`, sellerId, listingId, message, createdAt: new Date().toISOString() }, ...previous]);
  };
  const state = { cart, inquiries, addToCart, saveDemoInquiry };
  return <MarketplaceContext.Provider value={state}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace() {
  const value = useContext(MarketplaceContext);
  if (!value) throw new Error('useMarketplace must be used inside MarketplaceProvider');
  return value;
}
