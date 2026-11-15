# FishMate — Customer Shopping, Checkout, Orders & Delivery UI (C10–C17)

## What was added

Eight React Native / Expo Router screens were added to **the user's uploaded FishMate(5).zip project**, preserving Splash, OTP, existing C01–C09 screens and the existing animated 4-tab Customer navigation.

| Screen | Route | UI/actions |
|---|---|---|
| C10 Shopping Cart | `/customer/cart` | Existing fish images, 0.5 kg stepper, remove/clear, seller grouping, subtotal and delivery fee, checkout |
| C11 Checkout | `/customer/checkout` | Customer name, phone, city, address, notes, field validation, order summary |
| C12 Payment Method | `/customer/payment-method` | COD or online demo method, delivery and total review, place demo order |
| C13 Payment Gateway | `/customer/payment-gateway?id=...` | Simulation-only branded payment view, **no card data**, success or failure |
| C14 Payment Result | `/customer/payment-result?id=...` | Success/failure/pending/COD states, same-order retry, details links |
| C15 My Orders | `/customer/orders` | Sample and newly created orders, status filters, order cards |
| C16 Order Details | `/customer/order/[id]` | Ordered fish, customer address, seller, totals and payment status |
| C17 Delivery Tracking | `/customer/tracking/[id]` | 5-step status timeline, next-stage demo action, no live location |

## Navigation integration

- `C01 Customer Home`: Cart header action, Cart and My Orders shortcuts.
- `C03 Fish Listing Details`: Add to Cart checks stock and same-seller rule; View Cart via the bag action and after adding fish.
- `C08 My Profile`: My Orders and Shopping Cart quick-access rows.
- `C15 My Orders`: Order details -> Tracking.
- Current Customer 4-tab floating animated navigation is unchanged; checkout/order details open as stack screens.

## How to test (Expo SDK 58 project)

From the extracted project root:

```bash
npm ci
npx expo start --clear
```

Customer demo account: **0771234567** / **FishMate123**.

### COD path

1. Customer Home -> fish listing -> choose 1.0 kg -> Add to demo cart -> View Cart.
2. Cart -> Checkout -> enter address (at least 8 characters) and city -> Continue.
3. Payment Method -> Cash on Delivery -> Place demo COD order.
4. Payment Result -> My Orders -> Order Details -> Delivery Tracking.
5. Tap `Simulate next delivery stage` to move from Placed -> Confirmed -> Preparing -> Out for Delivery -> Delivered.

### Online demo success / failure

1. Repeat with another fish from an allowed seller; checkout -> Online payment (demo).
2. On C13 choose **Simulate failed payment**; C14 shows failure and retry.
3. Tap Retry and choose **Simulate successful payment**. It updates the **same order ID**, rather than creating a duplicate order.
4. On success, access the order in My Orders and open delivery tracking.

## Deliberate front-end limitations

- **No network calls**, payments, payment provider redirect, card inputs, banking, live GPS or SMS.
- `MarketplaceContext.tsx` holds demo orders/cart in React state; history resets when the Customer layout fully unmounts or app restarts. There are 2 clearly marked **Sample orders** for UI display.
- Checkout uses **one seller per basket** (multi-seller cart is blocked by validation). A multi-seller checkout would need real backend seller-order splitting and inventory reservations.
- Delivery fee **Rs. 350** is a sample flat amount, not a real delivery quote.
- New placed orders reduce remaining local demo stock, including those with failed/pending online payment; a real system needs inventory reservation expiry, payment webhooks, idempotency and seller acceptance.
- The demo Customer-side tracking progress button simulates what would later be **seller/rider-side authorized updates**, not real customer authority.
- Profile details, prices, seller names, ratings, photos, payments and delivery statuses are illustrative test content.

## Key code files

- `src/utils/orderUtils.ts`: order types, statuses, calculations, validation and labels.
- `src/components/customer/MarketplaceContext.tsx`: in-memory cart, orders, payments and status transitions.
- `src/components/customer/ShopUI.tsx`: shared order cards, totals and status components.
- `src/app/customer/cart.tsx`, `checkout.tsx`, `payment-method.tsx`, `payment-gateway.tsx`, `payment-result.tsx`, `orders.tsx`, `order/[id].tsx`, `tracking/[id].tsx`.
- `src/app/customer/_layout.tsx`, `home.tsx`, `listing/[id].tsx`, `account.tsx` integration.

## Verification

- All TS/TSX source files parsed and syntax-transpiled using TypeScript (60 files).
- All 8 route files and corresponding Expo Router stack registrations verified.
- Calculations/validation/order-stage pure unit checks passed (9 cases).
- `npm ci --offline` could not complete here: npm archive `zod-validation-error@4.0.2` was not cached. Consequently **full npm install, `npm run typecheck`, and actual Expo device runtime testing were not completed in this environment**. Run these locally after a normal `npm ci` with internet access.
