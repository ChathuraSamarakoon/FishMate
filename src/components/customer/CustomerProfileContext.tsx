import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  getCustomerProfile, updateCustomerProfile, type CustomerProfileSnapshot,
} from '@/services/demoAuth';
import {
  sanitizeCustomerProfile, validateCustomerProfile,
  type CustomerProfileDraft, type ProfileFieldErrors,
} from '@/utils/customerProfileUtils';

type SaveResult = { ok: true } | { ok: false; errors: ProfileFieldErrors; message?: string };
type CustomerProfileContextValue = {
  profile: CustomerProfileSnapshot | null;
  saveProfile: (draft: CustomerProfileDraft) => SaveResult;
};

const Context = createContext<CustomerProfileContextValue | null>(null);

/** Frontend-only profile state. Account details are also updated in demoAuth's memory store. */
export function CustomerProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CustomerProfileSnapshot | null>(() => getCustomerProfile());

  const saveProfile = useCallback((draft: CustomerProfileDraft): SaveResult => {
    const normalized = sanitizeCustomerProfile(draft);
    const errors = validateCustomerProfile(normalized);
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    const result = updateCustomerProfile(normalized);
    if (!result.ok) return { ok: false, errors: {}, message: result.error };
    setProfile(getCustomerProfile());
    return { ok: true };
  }, []);

  const value = useMemo(() => ({ profile, saveProfile }), [profile, saveProfile]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCustomerProfile() {
  const value = useContext(Context);
  if (!value) throw new Error('useCustomerProfile must be used inside CustomerProfileProvider');
  return value;
}
