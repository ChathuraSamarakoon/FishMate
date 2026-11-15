/** Pure calculations/validation for the front-end-only FishMate shopping demo. */
import { fishListings } from '@/data/mockData';

export type PaymentMethod = 'cod' | 'online';
export type PaymentStatus = 'cod_due' | 'cod_completed' | 'paid' | 'pending' | 'failed';
export type OrderStatus = 'awaiting_payment' | 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type CartItem = { listingId: string; kg: number };
export type OrderItem = { listingId: string; name: string; sellerId: string; kg: number; unitPrice: number; lineTotal: number };
export type CheckoutDraft = { fullName: string; phone: string; address: string; city: string; notes: string };
export type ShopOrder = {
  id: string;
  sellerId: string;
  items: OrderItem[];
  createdAt: string;
  customer: CheckoutDraft;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  isSample: boolean;
};
export const DEMO_DELIVERY_FEE = 350;
export const QUANTITY_STEP = 0.5;
export const ORDER_STAGES: Exclude<OrderStatus, 'awaiting_payment' | 'cancelled'>[] = [
  'placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered',
];
export const orderStatusLabel: Record<OrderStatus, string> = {
  awaiting_payment: 'Awaiting payment', placed: 'Order placed', confirmed: 'Confirmed',
  preparing: 'Preparing', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled',
};
export const paymentStatusLabel: Record<PaymentStatus, string> = {
  cod_due: 'Cash due on delivery', cod_completed: 'COD completed (demo)', paid: 'Demo payment successful', pending: 'Demo payment pending', failed: 'Demo payment failed',
};
export function toHalfKg(value: number) { return Math.round(value * 2) / 2; }
export function calculateSubtotal(items: CartItem[]) {
  return Math.round(items.reduce((sum, entry) => {
    const listing = fishListings.find(item => item.id === entry.listingId);
    return sum + (listing ? listing.price * entry.kg : 0);
  }, 0));
}
export function calculateCartTotals(items: CartItem[]) {
  const subtotal = calculateSubtotal(items);
  const deliveryFee = items.length > 0 ? DEMO_DELIVERY_FEE : 0;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}
export function validateCheckout(draft: CheckoutDraft): string | null {
  if (draft.fullName.trim().length < 2) return 'Enter a valid full name.';
  if (!/^07\d{8}$/.test(draft.phone.trim().replace(/[\s()-]/g, ''))) return 'Enter a Sri Lankan mobile number (07XXXXXXXX).';
  if (draft.city.trim().length < 2) return 'Enter a city or village.';
  if (draft.address.trim().length < 8) return 'Enter a complete delivery address (at least 8 characters).';
  if (draft.notes.length > 220) return 'Delivery notes must not exceed 220 characters.';
  return null;
}
export function validateCart(items: CartItem[], orders: ShopOrder[]): string | null {
  if (!items.length) return 'Your cart is empty.';
  const sellers = new Set<string>();
  for (const item of items) {
    const listing = fishListings.find(fish => fish.id === item.listingId);
    if (!listing) return 'A fish listing in your cart is no longer available.';
    sellers.add(listing.sellerId);
    const reserved = orders.filter(order => order.status !== 'cancelled').flatMap(order => order.items)
      .filter(line => line.listingId === item.listingId).reduce((sum, line) => sum + line.kg, 0);
    const available = toHalfKg(Math.max(0, listing.availableKg - reserved));
    if (!Number.isFinite(item.kg) || item.kg < QUANTITY_STEP || toHalfKg(item.kg) !== item.kg || item.kg > available) {
      return `${listing.name} has ${available} kg remaining in this demo.`;
    }
  }
  if (sellers.size > 1) return 'Please check out items from one fisherman at a time.';
  return null;
}
export function makeOrderItems(items: CartItem[]): OrderItem[] {
  return items.map(item => {
    const listing = fishListings.find(fish => fish.id === item.listingId)!;
    return { listingId: listing.id, name: listing.name, sellerId: listing.sellerId,
      kg: item.kg, unitPrice: listing.price, lineTotal: Math.round(item.kg * listing.price) };
  });
}
export function formatMoney(amount: number) { return `Rs. ${Math.round(amount).toLocaleString('en-US')}`; }
export function advanceOrderStatus(status: OrderStatus): OrderStatus {
  const idx = ORDER_STAGES.indexOf(status as (typeof ORDER_STAGES)[number]);
  return idx === -1 ? status : (ORDER_STAGES[Math.min(idx + 1, ORDER_STAGES.length - 1)] ?? status);
}
export function formatOrderDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}
