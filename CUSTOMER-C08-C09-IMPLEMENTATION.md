# FishMate · Customer Profile Screens C08–C09

This implementation is based on the user's uploaded `fishmate(4).zip` project (Expo SDK 58 / React Native / TypeScript / Expo Router). The existing Splash, Ocean Waves, Authentication + OTP, Marketplace C01–C04, Inquiry C05–C07 and persistent animated bottom navigation are preserved.

## What was added

| Screen | Expo Router path | Features |
| --- | --- | --- |
| **C08 My Profile** | `/customer/account` | Customer name and colored-initial avatar, phone, optional email, city/area and preferred delivery address, profile-completion indicator, Edit Profile button, demo inquiry shortcut, Explore shortcut, and logout. |
| **C09 Edit Profile** | `/customer/edit-profile` | Prefilled personal fields (full name, mobile), optional email, city/area, delivery address, four selectable avatar color themes, inline validation, Save/Cancel, and a success confirmation when returning to C08. |

## User flow

1. Sign in using the **Customer** demo account: `0771234567` / `FishMate123`.
2. In the customer bottom navigation, choose **Profile** → **C08 My Profile**.
3. Tap **Edit profile** → **C09 Edit Profile**. The previous values are already filled.
4. Update the name, phone number, optional email, city, address and/or avatar color.
5. Tap **Save changes**. Validation runs; on success the app returns to C08 with a success notice, updated values, initials, avatar theme, and completion indicator.
6. Tap **Cancel changes** to return without modifying the current profile.
7. On C08, **My inquiries** opens C06, **Explore fresh catches** opens C02, and **Logout** returns to Login.

## Validation & business rules

- Full name: required, 2–60 characters after whitespace normalization.
- Phone number: required Sri Lankan mobile number; input accepts local `07XXXXXXXX` or international `+947XXXXXXXX` and normalizes to local form.
- Phone number must not be associated with another account in the demo memory store.
- Email: optional, validated when supplied (maximum 100 characters).
- City: optional, max 60 characters.
- Preferred delivery address: optional, max 180 characters.
- Avatar: selectable color styles, with a two-initial monogram. **No gallery upload** is added in this phase.
- Only an authenticated account with the **Customer** role can save customer profile details.
- Profile fields are saved in React context and the existing in-memory `demoAuth` account store. After editing the phone number, logging in again (within the same JS app session) uses the new phone number.

## Frontend-only limitations

- **Nothing is uploaded or saved to a backend**: data remains in JS memory and resets on full application restart. The avatar color is stored in memory; actual device-photo selection/upload has not been implemented.
- **Phone changes do not send OTP**. Production must require server-side confirmation/reverification where appropriate.
- No customer profile data is sent to seller accounts, and the optional delivery address is not linked to the future checkout module yet.
- Customer inquiries in C06 include clearly designated sample data. C08 shows a count of inquiries created in the current demo session, not a real server count.

## Files added

- `src/app/customer/edit-profile.tsx`
- `src/components/customer/CustomerProfileContext.tsx`
- `src/components/customer/ProfileUI.tsx`
- `src/utils/customerProfileUtils.ts`

## Files modified

- `src/app/customer/account.tsx` (replaces the old placeholder with C08)
- `src/app/customer/_layout.tsx` (adds C09 route and profile provider while preserving animated tabs)
- `src/services/demoAuth.ts` (adds optional customer fields and in-memory update functions)
- `README.md` (links to this implementation guide)

## How to run

```bash
npm ci
npx expo start --clear
```

## Checks completed

- TypeScript/TSX syntax transpilation for all 50 source files: passed.
- Customer profile validation and login/update session assertions: passed.
- Navigation route checks: passed.
- Full Expo typecheck / lint / device run: **not verified in this environment**. `npm ci --offline` could not install a package absent from the local npm cache (`zod-validation-error@4.0.2`). On your own machine, please run:

```bash
npm ci
npm run typecheck
npm run lint
npx expo start --clear
```

## Later backend work

1. Replace demoAuth with secure, authenticated Laravel endpoints.
2. Persist profile fields with role-aware database records and proper authorization.
3. Implement mobile-number change confirmation and real OTP verification.
4. Add a secure image upload flow for profile photos, with validation and storage.
5. Integrate saved delivery address with the Cart/Checkout module.
