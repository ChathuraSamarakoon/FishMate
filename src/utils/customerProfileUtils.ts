import { normalizePhone, validPhone } from '@/services/demoAuth';

export type AvatarTheme = 'aqua' | 'ocean' | 'sunset' | 'lavender';

export type CustomerProfileDraft = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  avatarTheme: AvatarTheme;
};

export const AVATAR_THEMES: { value: AvatarTheme; name: string; color: string; accent: string }[] = [
  { value: 'aqua', name: 'Sea teal', color: '#D6F5ED', accent: '#087E8B' },
  { value: 'ocean', name: 'Ocean blue', color: '#DCECFB', accent: '#1A588D' },
  { value: 'sunset', name: 'Sunset', color: '#FFEBDD', accent: '#B96840' },
  { value: 'lavender', name: 'Lavender', color: '#EEE7FC', accent: '#6C5CAD' },
];

export function makeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('') || 'FM';
}

export function sanitizeCustomerProfile(draft: CustomerProfileDraft): CustomerProfileDraft {
  return {
    fullName: draft.fullName.trim().replace(/\s+/g, ' '),
    phone: normalizePhone(draft.phone),
    email: draft.email.trim().toLowerCase(),
    city: draft.city.trim().replace(/\s+/g, ' '),
    address: draft.address.trim().replace(/\s+/g, ' '),
    avatarTheme: draft.avatarTheme,
  };
}

export type ProfileFieldErrors = Partial<Record<'fullName' | 'phone' | 'email' | 'city' | 'address', string>>;

export function validateCustomerProfile(draft: CustomerProfileDraft): ProfileFieldErrors {
  const fields: ProfileFieldErrors = {};
  const profile = sanitizeCustomerProfile(draft);
  if (profile.fullName.length < 2) fields.fullName = 'Please enter your full name (at least 2 characters).';
  else if (profile.fullName.length > 60) fields.fullName = 'Please use 60 characters or fewer.';
  if (!validPhone(profile.phone)) fields.phone = 'Use a valid Sri Lankan mobile number, e.g. 0771234567.';
  if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    fields.email = 'Enter a valid email address or leave this blank.';
  }
  if (profile.email.length > 100) fields.email = 'Please use 100 characters or fewer.';
  if (profile.city.length > 60) fields.city = 'Please use 60 characters or fewer.';
  if (profile.address.length > 180) fields.address = 'Please use 180 characters or fewer.';
  return fields;
}
