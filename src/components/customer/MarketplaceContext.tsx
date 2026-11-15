import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { fishListings } from '@/data/mockData';
import {
  advanceOrderStatus, calculateCartTotals, makeOrderItems, toHalfKg,
  validateCart, validateCheckout, type CheckoutDraft, type PaymentMethod, type ShopOrder,
} from '@/utils/orderUtils';

export type DemoCartItem = { listingId: string; kg: number };
export type InquiryStatus = 'pending' | 'responded' | 'closed';
export type DemoInquiry = {
  id: string; sellerId: string; listingId?: string; message: string; requestedKg?: number;
  createdAt: string; status: InquiryStatus; demoReply?: string; isSample: boolean;
};
export type NewInquiry = { sellerId: string; listingId?: string; message: string; requestedKg?: number };
type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

type MarketplaceState = {
  cart: DemoCartItem[];
  inquiries: DemoInquiry[];
  orders: ShopOrder[];
  checkoutDraft: CheckoutDraft | null;
  setCheckoutDraft: (data: CheckoutDraft) => void;
  remainingStock: (listingId: string) => number;
  addToCart: (listingId: string, kg: number) => ActionResult;
  updateCartQuantity: (listingId: string, kg: number) => ActionResult;
  removeFromCart: (listingId: string) => void;
  clearCart: () => void;
  placeDemoOrder: (method: PaymentMethod) => ActionResult;
  completeDemoPayment: (orderId: string, success: boolean) => ActionResult;
  simulateNextDeliveryStatus: (orderId: string) => void;
  createInquiry: (data: NewInquiry) => string;
  changeInquiryStatus: (id: string, status: 'closed' | 'pending') => void;
};
const sampleInquiries: DemoInquiry[] = [
  { id:'sample-tuna', sellerId:'fisher-01', listingId:'listing-01', message:'Hello, do you have 2 kg of fresh yellowfin tuna available? Can I collect it this afternoon?', requestedKg:2, createdAt:'2026-11-12T10:25:00+05:30', status:'responded', demoReply:'Hello! This is a sample reply for preview purposes. Tuna is available in this demo. Please confirm your preferred pickup time.', isSample:true },
  { id:'sample-prawns', sellerId:'fisher-02', listingId:'listing-03', message:'Hi! I am interested in 1 kg of jumbo prawns. Is local delivery available?', requestedKg:1, createdAt:'2026-11-13T13:10:00+05:30', status:'pending', isSample:true },
  { id:'sample-snapper', sellerId:'fisher-01', listingId:'listing-02', message:'Could you prepare a cleaned red snapper for a family meal?', createdAt:'2026-11-10T15:40:00+05:30', status:'closed', isSample:true },
];
const sampleCustomer: CheckoutDraft = {
  fullName:'Sample Customer', phone:'0770000000', city:'Negombo', address:'Sample Harbor Road, Negombo', notes:'Sample order for interface testing',
};
const sampleOrders: ShopOrder[] = [
  { id:'FM-DEMO-1001', sellerId:'fisher-01', items:[{listingId:'listing-01',name:'Yellowfin Tuna',sellerId:'fisher-01',kg:1,unitPrice:4200,lineTotal:4200}], createdAt:'2026-11-08T11:20:00+05:30', customer:sampleCustomer, subtotal:4200, deliveryFee:350, total:4550, paymentMethod:'cod', paymentStatus:'cod_completed', status:'delivered', isSample:true },
  { id:'FM-DEMO-1002', sellerId:'fisher-02', items:[{listingId:'listing-03',name:'Jumbo Prawns',sellerId:'fisher-02',kg:0.5,unitPrice:3650,lineTotal:1825}], createdAt:'2026-11-12T09:35:00+05:30', customer:sampleCustomer, subtotal:1825, deliveryFee:350, total:2175, paymentMethod:'online', paymentStatus:'paid', status:'out_for_delivery', isSample:true },
];
let inquiryCounter = 0;
let orderCounter = 0;
const Context = createContext<MarketplaceState | null>(null);

/** In-memory frontend simulation only; no payment, real orders, SMS, rider, or network calls. */
export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<DemoCartItem[]>([]);
  const [inquiries, setInquiries] = useState<DemoInquiry[]>(sampleInquiries);
  const [orders, setOrders] = useState<ShopOrder[]>(sampleOrders);
  const [checkoutDraft, setCheckoutDraft] = useState<CheckoutDraft | null>(null);

  const remainingStock = useCallback((listingId: string) => {
    const listing = fishListings.find(item => item.id === listingId);
    if (!listing) return 0;
    // Sample history is illustrative and must not reduce available stock.
    const reserved = orders.filter(order => !order.isSample && order.status !== 'cancelled').flatMap(order => order.items)
      .filter(item => item.listingId === listingId).reduce((total, item) => total + item.kg, 0);
    return toHalfKg(Math.max(0, listing.availableKg - reserved));
  }, [orders]);

  const addToCart = useCallback((listingId: string, kg: number): ActionResult => {
    const listing = fishListings.find(item => item.id === listingId);
    if (!listing) return { ok:false, error:'Fish listing not found.' };
    if (!Number.isFinite(kg) || kg < 0.5 || toHalfKg(kg) !== kg) return { ok:false, error:'Choose at least 0.5 kg in 0.5 kg steps.' };
    const otherSeller = cart.some(entry => fishListings.find(item => item.id === entry.listingId)?.sellerId !== listing.sellerId);
    if (otherSeller) return { ok:false, error:'This demo uses single-fisherman checkout. Finish or clear your current cart before adding items from another seller.' };
    const existing = cart.find(entry => entry.listingId === listingId)?.kg ?? 0;
    if (existing + kg > remainingStock(listingId)) return { ok:false, error:`Only ${remainingStock(listingId)} kg is available for this listing.` };
    setCart(previous => previous.some(entry => entry.listingId === listingId)
      ? previous.map(entry => entry.listingId === listingId ? { ...entry, kg:toHalfKg(entry.kg + kg) } : entry)
      : [...previous, { listingId, kg }]);
    return { ok:true };
  }, [cart, remainingStock]);
  const updateCartQuantity = useCallback((listingId: string, kg: number): ActionResult => {
    if (!cart.some(entry => entry.listingId === listingId)) return { ok:false, error:'This item is not in your cart.' };
    if (!Number.isFinite(kg) || kg < 0.5 || toHalfKg(kg) !== kg) return { ok:false, error:'Minimum order is 0.5 kg in 0.5 kg steps.' };
    if (kg > remainingStock(listingId)) return { ok:false, error:`Only ${remainingStock(listingId)} kg remains available.` };
    setCart(previous => previous.map(entry => entry.listingId === listingId ? { ...entry, kg } : entry));
    return { ok:true };
  }, [cart, remainingStock]);
  const removeFromCart = useCallback((listingId: string) => setCart(previous => previous.filter(item => item.listingId !== listingId)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const placeDemoOrder = useCallback((method: PaymentMethod): ActionResult => {
    const cartError = validateCart(cart, orders.filter(order => !order.isSample));
    if (cartError) return { ok:false, error:cartError };
    if (!checkoutDraft) return { ok:false, error:'Enter delivery details before continuing.' };
    const checkoutError = validateCheckout(checkoutDraft);
    if (checkoutError) return { ok:false, error:checkoutError };
    const items = makeOrderItems(cart);
    if (!items.length) return { ok:false, error:'No items to check out.' };
    const totals = calculateCartTotals(cart);
    orderCounter += 1;
    const id = `FM-${String(Date.now()).slice(-8)}-${orderCounter}`;
    const created: ShopOrder = {
      id, sellerId:items[0].sellerId, items, createdAt:new Date().toISOString(), customer:{ ...checkoutDraft },
      ...totals, paymentMethod:method, paymentStatus:method === 'cod' ? 'cod_due' : 'pending',
      status:method === 'cod' ? 'placed' : 'awaiting_payment', isSample:false,
    };
    setOrders(previous => [created, ...previous]);
    setCart([]);
    setCheckoutDraft(null);
    return { ok:true, id };
  }, [cart, checkoutDraft, orders]);

  const completeDemoPayment = useCallback((orderId: string, success: boolean): ActionResult => {
    const order = orders.find(item => item.id === orderId);
    if (!order) return { ok:false, error:'Order not found.' };
    if (order.paymentMethod !== 'online') return { ok:false, error:'This order uses Cash on Delivery.' };
    if (order.paymentStatus === 'paid') return { ok:true, id:orderId };
    if (order.status !== 'awaiting_payment') return { ok:false, error:'Payment can no longer be simulated for this order.' };
    setOrders(previous => previous.map(item => item.id === orderId ? {
      ...item, paymentStatus:success ? 'paid':'failed', status:success ? 'placed' : 'awaiting_payment',
    } : item));
    return { ok:true, id:orderId };
  }, [orders]);

  const simulateNextDeliveryStatus = useCallback((orderId: string) => {
    setOrders(previous => previous.map(item => {
      if (item.id !== orderId || item.status === 'cancelled' || item.status === 'awaiting_payment') return item;
      const next = advanceOrderStatus(item.status);
      return { ...item, status:next, paymentStatus:next === 'delivered' && item.paymentMethod === 'cod' ? 'cod_completed' : item.paymentStatus }; // Demo-only COD completion; no real cash collected.
    }));
  }, []);

  const createInquiry = useCallback((data: NewInquiry) => {
    inquiryCounter += 1;
    const id = `local-${Date.now()}-${inquiryCounter}`;
    const entry: DemoInquiry = { id, sellerId:data.sellerId, ...(data.listingId ? {listingId:data.listingId} : {}), message:data.message.trim(), ...(data.requestedKg ? {requestedKg:data.requestedKg} : {}), createdAt:new Date().toISOString(), status:'pending', isSample:false };
    setInquiries(previous => [entry,...previous]);
    return id;
  }, []);
  const changeInquiryStatus = useCallback((id: string, status:'closed' | 'pending') => setInquiries(previous => previous.map(entry => entry.id === id ? {...entry,status} : entry)), []);

  const state = useMemo(() => ({
    cart, inquiries, orders, checkoutDraft, setCheckoutDraft, remainingStock, addToCart, updateCartQuantity,
    removeFromCart, clearCart, placeDemoOrder, completeDemoPayment, simulateNextDeliveryStatus,
    createInquiry, changeInquiryStatus,
  }), [cart, inquiries, orders, checkoutDraft, remainingStock, addToCart, updateCartQuantity, removeFromCart,
    clearCart, placeDemoOrder, completeDemoPayment, simulateNextDeliveryStatus, createInquiry, changeInquiryStatus]);
  return <Context.Provider value={state}>{children}</Context.Provider>;
}
export function useMarketplace() {
  const value = useContext(Context);
  if (!value) throw new Error('useMarketplace must be used inside MarketplaceProvider');
  return value;
}
