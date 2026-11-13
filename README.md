# FishMate — Animated Splash Screen & Welcome Frontend

This is **your existing Expo/React Native project** from `1.zip`, upgraded with a FishMate-branded animated launch experience. It uses **Expo SDK 58, Expo Router, TypeScript, and built-in React Native Animated**. No new runtime animation packages or backend are required.

## What's implemented

1. **`/` — animated splash screen** (~4.1 seconds):
   - Gentle aqua glow and animated translucent ocean waves.
   - Two water-ripple reveals behind the logo.
   - Fish-handshake symbol scales/fades into view.
   - Original `FishMate` wordmark reveals separately.
   - Logo shifts upwards while `Welcome to FishMate` and `Get Started` fade in.
   - The route replaces itself with `/welcome` to avoid an extra Back step.
2. **`/welcome` — static welcome screen** with continuously moving, subtle waves and a working **Get Started** action.
3. **`/role-select` — Customer / Fisherman selector**, connected to the existing registration route (which is still a placeholder).
4. FishMate icon/wordmark assets cut from your generated logo, plus original custom ocean-wave, glow, and gradient-button PNGs.
5. App display name updated to **FishMate** with matching launcher assets.

> **Reference fidelity:** Based on `gemini_generated_video_38283d36.mp4`: blue/teal fish-handshake logo, light background, ambient water motif, logo reveal, and the "Welcome to FishMate" / "Get Started" transition. The preview video shows a phone mockup and lasts ~10 seconds; this version renders directly inside the phone and intentionally shortens the intro to ~4 seconds for real-world usability.

## Run it

You need Node.js compatible with the version specified in `package.json`.

Before running `npm ci`, stop any running Expo server with `Ctrl+C` in its
terminal. On Windows, Metro can lock native dependency files and cause an
`EPERM` error during installation. Restart Expo after installation finishes.

```bash
npm ci
npx expo start
```

- Press **w** to open the web preview.
- Scan the Expo QR code in **Expo Go** or use a simulator/dev build if available.
- Launch the app at `/` to replay the intro. Refresh to replay in the browser.
- After the intro, press **Get Started** to choose Customer or Fisherman.

### Checks

```bash
npm run typecheck
npm run lint
```

## Key files

| Path | Purpose |
| --- | --- |
| `src/app/index.tsx` | Timed splash animation + handoff |
| `src/app/welcome.tsx` | Welcome destination (matches end of animation) |
| `src/app/role-select.tsx` | Working role selection preview |
| `src/components/splash/OceanBackdrop.tsx` | Continuous native-driver wave/bubble motion |
| `src/components/splash/BrandMark.tsx` | Original fish logo and wordmark images |
| `src/components/splash/WelcomeActions.tsx` | Welcome text, gradient Get Started button |
| `assets/fishmate/` | Transparent logo, waves, aqua glow and CTA gradient PNGs |
| `app.json` | App name, icons and Expo settings |

## Animation adjustments

In `src/app/index.tsx`, edit the `Animated.delay` and `Animated.timing` durations to adjust the timeline. To slow down or remove wave motion, edit the loops and opacity in `src/components/splash/OceanBackdrop.tsx`.

The splash animation uses React Native's built-in `Animated` with `useNativeDriver: true` for transforms/opacity. Ocean artwork uses pre-rendered images instead of complicated per-frame path updates to keep it smooth on Android and iOS.

## What's not implemented yet

The uploaded project only contained placeholder pages apart from navigation. **Authentication, customer/seller dashboards, cart, checkout, payments, inquiries, fishing trips, database and API calls are not implemented** in this deliverable. The existing Login/Register/etc. routes remain labeled placeholders. This project completes the requested **Splash → Welcome → Role Select UI flow**, not the full marketplace.

**Note:** The animated splash is a JavaScript/React Native screen. The operating system's instant pre-JS/native startup screen is a separate Expo splash configuration (which can be polished later for release builds).
