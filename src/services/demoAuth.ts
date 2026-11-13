/**
 * DEVELOPMENT-ONLY authentication mock for the FishMate frontend prototype.
 * No SMS is sent and no real verification occurs. State lives in JS memory and
 * resets on a full app restart. Never use this module in a deployed app.
 * Production: Laravel endpoints, server-generated expiring OTP, rate limiting,
 * server-side password hashing, secure authenticated sessions/token storage.
 */
export type UserRole = 'customer' | 'fisherman';
export type DemoAccount = {
  fullName: string;
  phone: string;
  role: UserRole;
  password: string; // in-memory DEMO ONLY. Never store plaintext passwords in production.
};
export const DEMO_OTP = '1234';
const accounts: DemoAccount[] = [
  { fullName: 'Demo Customer', phone: '0771234567', role: 'customer', password: 'FishMate123' },
  { fullName: 'Demo Fisherman', phone: '0712345678', role: 'fisherman', password: 'FishMate123' },
];
let pendingRegistration: DemoAccount | null = null;
let resetAuthorizedFor: string | null = null;
let activeAccount: DemoAccount | null = null;

export function normalizePhone(raw: string): string {
  const value = raw.replace(/[\s()-]/g, '');
  if (value.startsWith('+94')) return '0' + value.slice(3);
  if (value.startsWith('94') && value.length === 11) return '0' + value.slice(2);
  return value;
}
export function validPhone(phone: string): boolean { return /^07\d{8}$/.test(normalizePhone(phone)); }
export function getAccount(phone: string) { return accounts.find(a => a.phone === normalizePhone(phone)); }
export function beginRegistration(account: DemoAccount) { pendingRegistration = { ...account, phone: normalizePhone(account.phone) }; }
export function hasPendingRegistration(phone: string) { return !!pendingRegistration && pendingRegistration.phone === normalizePhone(phone); }
export function completeRegistration(phone: string) {
  if (!hasPendingRegistration(phone) || !pendingRegistration) return false;
  if (getAccount(phone)) return false;
  accounts.push(pendingRegistration);
  pendingRegistration = null;
  return true;
}
export function beginPasswordRecovery(phone: string): boolean {
  resetAuthorizedFor = null;
  return !!getAccount(phone);
}
export function authorizePasswordReset(phone: string): boolean {
  if (!getAccount(phone)) return false;
  resetAuthorizedFor = normalizePhone(phone);
  return true;
}
export function canResetPassword(phone: string) { return resetAuthorizedFor === normalizePhone(phone); }
export function resetPassword(phone: string, newPassword: string): boolean {
  const normalized = normalizePhone(phone);
  if (!canResetPassword(normalized)) return false;
  const account = getAccount(normalized);
  if (!account) return false;
  account.password = newPassword;
  resetAuthorizedFor = null;
  return true;
}
export function login(phone: string, password: string): DemoAccount | null {
  const found = getAccount(phone);
  if (!found || found.password !== password) return null;
  activeAccount = found;
  return found;
}
export function getSession() { return activeAccount; }
export function logout() { activeAccount = null; }
export function maskPhone(phone: string) {
  const normalized = normalizePhone(phone);
  return normalized.length > 4 ? `${normalized.slice(0, 3)} ••• ${normalized.slice(-4)}` : normalized;
}
