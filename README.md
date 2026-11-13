# FishMate — Animated Splash Screen & Welcome Frontend

This is **your existing Expo/React Native project** from `1.zip`, upgraded with a FishMate-branded animated launch experience. It uses **Expo SDK 58, Expo Router, TypeScript, and built-in React Native Animated**. No new runtime animation packages or backend are required.

## What's implemented

1. **`/` — animated splash screen** (~4.1 seconds):
   - Gentle aqua glow and **three independently scrolling, seamless, translucent ocean-wave layers**.
   - Two water-ripple reveals behind the logo.
   - Fish-handshake symbol scales/fades into view.
   - Original `FishMate` wordmark reveals separately.
   - Logo shifts upwards while `Welcome to FishMate` and `Get Started` fade in.
   - The route replaces itself with `/welcome` to avoid an extra Back step.
2. **`/welcome` — static welcome screen** with continuously moving, layered, subtle waves and a working **Get Started** action.
3. **`/role-select` — Customer / Fisherman selector**, connected to the existing registration route (which is still a placeholder).
4. FishMate icon/wordmark assets cut from your generated logo, plus original three custom seamless flowing-ocean strips, aqua glow, and gradient-button PNGs.
5. App display name updated to **FishMate** with matching launcher assets.

> **Reference fidelity:** Based on `gemini_generated_video_38283d36.mp4`: blue/teal fish-handshake logo, light background, ambient water motif, logo reveal, and the "Welcome to FishMate" / "Get Started" transition. The preview video shows a phone mockup and lasts ~10 seconds; this version renders directly inside the phone and intentionally shortens the intro to ~4 seconds for real-world usability.

## Run it

You need Node.js compatible with the version specified in `package.json`.

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
| `src/components/splash/OceanBackdrop.tsx` | Three independently looped native-driver wave layers, glow and bubbles |
| `src/components/splash/BrandMark.tsx` | Original fish logo and wordmark images |
| `src/components/splash/WelcomeActions.tsx` | Welcome text, gradient Get Started button |
| `assets/fishmate/` | Transparent logo, three seamless flowing-wave PNGs, aqua glow and CTA gradient |
| `app.json` | App name, icons and Expo settings |

## Animation adjustments

In `src/app/index.tsx`, edit the `Animated.delay` and `Animated.timing` durations to adjust the timeline. To adjust wave motion, edit the `WAVES` array (duration, opacity, top, height, sway, direction) in `src/components/splash/OceanBackdrop.tsx`. The slowest back wave travels left, the middle wave right, and the foreground left at different speeds.

The splash animation uses React Native's built-in `Animated` with `useNativeDriver: true` for transforms/opacity. Ocean artwork uses three seamless transparent PNG strips that scroll continuously in different directions, plus an independent gentle vertical sway. The changing overlap creates the flowing-water impression without expensive per-frame SVG path calculations, and the source shapes can be regenerated from `scripts/generate_wave_assets.py`.

## What's not implemented yet

The uploaded project only contained placeholder pages apart from navigation. **Authentication, customer/seller dashboards, cart, checkout, payments, inquiries, fishing trips, database and API calls are not implemented** in this deliverable. The existing Login/Register/etc. routes remain labeled placeholders. This project completes the requested **Splash → Welcome → Role Select UI flow**, not the full marketplace.

**Note:** The animated splash is a JavaScript/React Native screen. The operating system's instant pre-JS/native startup screen is a separate Expo splash configuration (which can be polished later for release builds).

## Flowing ocean update (3 layers)

- `src/components/splash/OceanBackdrop.tsx` is the only React Native code file changed for this update.
- New graphics: `assets/fishmate/ocean-flow-{back,middle,front}.png`. All three are transparent PNGs with **pixel-identical first and last columns** to prevent seams on each animation loop.
- Back wave: 14.7-second leftward loop; middle: 11.7-second rightward loop; foreground: 8.9-second leftward loop. Additional vertical bobbing is applied independently to each wave.
- The background is shared by Splash (`/`) and Welcome (`/welcome`). The component restarts when navigation remounts it; the two route layouts still match.
- Six small bubbles rise and fade independently. The glow gently pulses.
- No added runtime dependencies. The scrolling and floating use `Animated` with the native driver.
- This is a **layered flowing-water visual effect**, not a physics-based fluid simulation or real-time water mesh deformation.
- To regenerate PNG files after changing their wave geometry, use `python scripts/generate_wave_assets.py` with Python `numpy` and `Pillow` installed. Generated PNG files are included; Python is not required for the app to run.

### Applying this update to your existing FishMate folder

If you already edited other screens, extract the separate **Wave Update Only** ZIP into the root of your FishMate project and allow these files to replace or be added:

```text
src/components/splash/OceanBackdrop.tsx
assets/fishmate/ocean-flow-back.png
assets/fishmate/ocean-flow-middle.png
assets/fishmate/ocean-flow-front.png
```

This preserves your other application pages and logo files. The existing older wave PNGs are unused after this change.

### Verification status

The changed TypeScript/TSX transpiles without syntax errors; the three PNG strip edges were verified to match exactly. A 6-second offline wave-motion preview was also rendered. A full Expo device run, dependency-backed typecheck and ESLint were **not verified** here because `npm ci` did not complete in the execution environment. Run `npm ci`, `npm run typecheck` and `npm run lint` on your local development machine.
