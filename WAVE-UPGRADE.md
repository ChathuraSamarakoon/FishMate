# FishMate — 3-Layer Flowing Waves Update

The replacement `src/components/splash/OceanBackdrop.tsx` runs three independently-scrolling transparent wave strips (two flow left, one right) at different speeds. Each also bobs softly; six bubbles rise and fade independently. The original FishMate logo and Welcome layout are unchanged.

## Apply to an EXISTING project

1. Back up your current project.
2. Extract `FishMate-Wave-Update-Only.zip`.
3. Copy the included `src` and `assets` directories **into the root of your existing FishMate project**, merging folders and replacing `src/components/splash/OceanBackdrop.tsx`. Do not nest a second project directory.
4. Run `npx expo start --clear` inside your project root (the directory containing `package.json`).

If dependencies are not installed, run `npm ci` first. No additional dependencies are required just for the waves.

## Full updated project

Alternatively, extract `FishMate-Flowing-Waves-Frontend.zip` and open the extracted project directory in VS Code. This is based on the previously supplied FishMate Splash frontend. If you have made local edits to other pages, prefer the **update-only** ZIP to avoid overwriting them.

## Main files

- `src/components/splash/OceanBackdrop.tsx` — animation logic
- `assets/fishmate/ocean-flow-back.png` — back wave
- `assets/fishmate/ocean-flow-middle.png` — middle wave
- `assets/fishmate/ocean-flow-front.png` — front wave
- `scripts/generate_wave_assets.py` — optional artwork regeneration tool (Python + Pillow + NumPy)

## Tuning

Change the `WAVES` array in `OceanBackdrop.tsx`: `duration` (ms), `opacity`, `direction`, `top`, `height`, and `sway`. The waves are looped by translating seamless assets on the native driver; this is not simulated water physics.

The 6-second MP4 included alongside the ZIP is an *approximate offline preview* of the wave behavior and a Welcome layout, **not** a video recorded from an Expo app. The exact animation may look slightly different across devices.

## Test

```bash
npm ci
npx expo start --clear
npm run typecheck
npm run lint
```

TypeScript syntax was checked, but full Expo runtime/typecheck/lint could not be verified in this environment due to dependency installation failure.
