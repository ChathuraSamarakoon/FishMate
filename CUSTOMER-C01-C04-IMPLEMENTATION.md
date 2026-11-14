# FishMate Customer Frontend — C01 to C04

This update was built on the uploaded `FIshmate(2).zip` Expo SDK 58 project. The existing Splash, Ocean Waves, Welcome, Registration, Login, OTP and Reset Password source files remain in place.

## Screens delivered

| ID | Route | Features |
|---|---|---|
| C01 | `/customer/home` | Home header, welcome, hero, search shortcut, category links, featured fish cards, fishermen, more fresh fish, demo-data notice |
| C02 | `/customer/search` | Live query filtering (fish, seller and location), fish category chips, location chips, availability filter, rotating price sort, reset, results and empty state |
| C03 | `/customer/listing/[id]` | Individual fish image, name, description, price, tags, freshness, location, delivery estimate, stock, 0.5-kg quantity selector, estimated subtotal, seller card, demo cart and inquiry draft |
| C04 | `/customer/fisherman/[id]` | Individual seller portrait, village, masked demo contact field, shop image, delivery radius, specialities, that seller's fish listings, demo inquiry draft |

## Navigation animation

The uploaded reference video (5.66s, 720×1280) demonstrates a floating dock with a springy raised teal circular indicator that slides from icon to icon. The FishMate adaptation uses React Native's built-in `Animated` spring for horizontal movement, bounce on the circular badge, subtle pill stretching during travel and a translucent dark rounded dock. A persistent Customer Router layout keeps the bar mounted while switching Home / Explore / Inquiries / Profile; detail pages temporarily hide it. This is a design adaptation, **not a pixel-for-pixel or asset-for-asset copy of the video**.

Implementation: `src/components/customer/AnimatedCustomerTabs.tsx`, `src/app/customer/_layout.tsx`.

## Assets

- Five different generated fish product images: tuna, red snapper, prawns, mackerel and blue crab. No two distinct listings share the same product image.
- Two unique generated seller portraits, one for each seller.
- Two unique generated shop photos, one per seller.
- Sixteen generated lightweight outline icons (PNG). No extra third-party animation/icon dependencies were added.
- Image assets were resized/compressed for mobile. All product images are sample content.

A *single listing* intentionally retains its original image across Home, Search and Details, for consistent product identity; different items do not reuse each other's photos.

## Authentication and routing

Existing customer login now redirects to `/customer/home`; fisherman login still redirects to the existing `/home` placeholder. The existing auth/OTP source is untouched otherwise.

Test demo Customer account:

- Number: `0771234567`
- Password: `FishMate123`

Test demo Fisherman account:

- Number: `0712345678`
- Password: `FishMate123`

## Prototype-only behavior

- All seller identities, review counts, ratings, pricing, quantities, freshness and delivery estimates are illustrative demo values, not live listings.
- The mock cart stores quantities only in application memory. It does not place or pay for any real order.
- The Ask Seller modal **saves a local demo inquiry draft only**. It never contacts a fisherman. The Inquiries tab lists saved drafts as an aid to navigation testing.
- The Inquiries and Account bottom tabs are limited supporting demo screens; full C05–C09 UI remains to be implemented.
- The current customer state does not persist after a full JS app restart. Future Laravel integration will replace the demo state and test accounts with secure services.
- No real contact numbers were generated. Seller contact fields are clearly masked placeholders.

## Run the app

```bash
npm ci
npx expo start --clear
```

1. Open FishMate and complete the Splash / Welcome flow.
2. Sign in with the **Customer** demo account.
3. C01 appears after login. Tap Explore in the bottom dock to open C02.
4. Choose any listing to open C03, adjust the quantity, and test the demo cart or the inquiry draft.
5. Tap the seller card to open C04, then use View Seller Listings or Connect with Fisherman.
6. Use the bottom dock to verify the animated indicator moves between the four tabs.

## Verification

- Source-level TypeScript/TSX syntax validation and referenced image-path checks performed.
- Nine original generated photos and sixteen local icon assets validated.
- The complete Expo runtime was **not** device-tested in this environment because npm dependencies were not fully cached/available. Run `npm ci`, `npm run typecheck`, `npm run lint` and test in Expo Go / a development build locally.
