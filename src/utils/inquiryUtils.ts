import type { DemoInquiry, InquiryStatus } from '@/components/customer/MarketplaceContext';

export const inquiryStatusLabels: Record<InquiryStatus, string> = {
  pending: 'Pending',
  responded: 'Responded',
  closed: 'Closed',
};

export function formatInquiryDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatInquiryTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-LK', { hour: 'numeric', minute: '2-digit' });
}

export function filterInquiries(inquiries: DemoInquiry[], status: InquiryStatus | 'all', query: string): DemoInquiry[] {
  const q = query.trim().toLowerCase();
  return inquiries.filter((entry) => {
    if (status !== 'all' && entry.status !== status) return false;
    if (!q) return true;
    return `${entry.message} ${entry.id} ${entry.sellerId} ${entry.listingId ?? ''}`.toLowerCase().includes(q);
  });
}

export function validateInquiryMessage(message: string): string | null {
  const length = message.trim().length;
  if (length < 10) return 'Please write at least 10 characters describing what you need.';
  if (length > 500) return 'Please keep your message within 500 characters.';
  return null;
}

/** Allow only a positive optional decimal quantity with 0.5 kg increments. */
export function validateInquiryKg(raw: string, availableKg?: number): string | null {
  if (!raw.trim()) return null;
  const value = Number(raw.trim());
  if (!/^\d+(\.\d+)?$/.test(raw.trim()) || !Number.isFinite(value) || value <= 0) {
    return 'Enter a valid quantity in kilograms.';
  }
  if (!Number.isInteger(value * 2)) return 'Please use 0.5 kg increments.';
  if (availableKg !== undefined && value > availableKg) return `Only ${availableKg} kg is available in this demo listing.`;
  return null;
}
