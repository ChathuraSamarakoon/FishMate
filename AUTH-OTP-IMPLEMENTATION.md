# FishMate — Authentication + Animated OTP Frontend

This update modifies the uploaded `fishmate.zip` directly. The original FishMate splash, moving ocean backdrop, logo, welcome and role-selection routes are preserved.

## Screens implemented

| Screen | Route | Key functions |
|---|---|---|
| Registration | `/register?role=customer` or `fisherman` | Role choice, full name, phone, password, confirmation, validations |
| Login | `/login` | Phone/password, show/hide password, demo accounts, conditional role landing |
| Forgot Password | `/forgot-password` | Phone validation and mock account recovery |
| OTP Verification | `/otp-verification` | Four staggered/fanning cards, active focus, auto verification, checking pulse, error shake, verified green check, resend timer |
| Reset Password | `/reset-password` | Verified-only password replacement and confirmation |
| Demo landing | `/home` | Role-aware sign-in confirmation and logout; full dashboards remain future work |

## Test the flows

**Create account**: Welcome → Get Started → Select Customer/Fisherman → Registration → enter details → OTP `1234` → successful animation → Login → enter your registered phone/password → demo landing.

**Forgot password**: Login → Forgot Password → enter an existing demo/account phone → OTP `1234` → green verification → Set New Password → Login.

**Demo logins available immediately**:
- Customer: phone `0771234567`, password `FishMate123`
- Fisherman: phone `0712345678`, password `FishMate123`

### OTP animation based on uploaded reference
The 5.23-second supplied demo video shows a four-digit OTP deck whose cards rotate/fan in, then line up; digits fill one at a time; a centered card pulses while checking; a green check indicates verification. This native React Native animation follows that sequence, adapted to FishMate's light ocean-blue/teal UI. The animation does **not** play the reference video and doesn't need external animation packages.

### Frontend prototype limitations
- No SMS is sent, and OTP is **always `1234`** in demo mode; the page labels this explicitly.
- No real identity verification. Do not use demo OTP and in-memory account/password logic in production.
- Demo accounts are stored **in JS memory only**; newly registered accounts and password changes reset when the JS process fully reloads. Hot reload may reset them as well.
- No production password storage/session/token/security. Integrate Laravel backend for OTP generation/expiry, delivery, server-side verification, retries/rate limits, proper password hashing, secure auth state.
- Login leads to a small role-aware **demo landing**, not full marketplace/fisherman dashboards (those remain outside this update).

## Development

```bash
npm ci
npx expo start --clear
```

Open the project root in VS Code. Android Expo Go can open the QR code from Expo CLI (if SDK support on the device matches), or use a compatible emulator/dev build. Web can be started with `npx expo start --web`.

## New and changed files

- `src/components/auth/AuthUI.tsx` reusable authentication design primitives
- `src/services/demoAuth.ts` shared in-memory demo state
- `src/app/register.tsx`, `login.tsx` replacements
- `src/app/forgot-password.tsx`, `otp-verification.tsx`, `reset-password.tsx` new routes
- `src/app/home.tsx` role-aware demo landing
- `src/app/_layout.tsx` auth routes and transitions

## Verification performed in the handoff environment
The TypeScript sources pass syntax transpilation. The runtime Expo app **could not** be launched here because the npm dependency installation failed; therefore device behavior, keyboard interactions and the full TypeScript typecheck should be verified locally after running `npm ci`.
