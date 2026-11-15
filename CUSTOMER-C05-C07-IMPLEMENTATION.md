# FishMate · Customer Inquiry Screens C05–C07

This update builds on the user's provided `fishmate(3).zip` (Expo SDK 58 / React Native / TypeScript / Expo Router) and **preserves the existing splash, authentication, C01–C04 marketplace screens, and animated floating customer navigation**.

## Screens and actions

| Screen | Path | What works |
| --- | --- | --- |
| **C05 Connect with Fisherman** | `/customer/connect?sellerId=fisher-01&listingId=listing-01` | Seller preview, specific fish or general inquiry selection, optional quantity, prompt suggestions, 10–500 character message validation, 0.5 kg quantity increments, save demo inquiry and go to details. |
| **C06 My Inquiries** | `/customer/inquiries` | All / Pending / Responded / Closed filters, search by seller, message and fish, status counters, sample cards, new inquiries automatically displayed, animated customer bottom-navigation tab. |
| **C07 Inquiry Details** | `/customer/inquiry/[id]` | Seller and listing details, requested quantity, dates, timeline, customer's message, demo response where available, close/reopen demo status, link to seller and related fish, start another inquiry. |

### Integration with previously completed screens

- `C03 Fish Listing Details` → **Ask seller** now opens the full C05 screen, preselecting the seller, listing and the quantity chosen in C03.
- `C04 Fisherman Profile` → **Connect with fisherman** opens C05 with the seller selected and a general inquiry by default.
- `C06` remains the third existing **animated navigation** tab. The existing floating indicator and animations have been preserved without changes.
- `MarketplaceProvider` shares the inquiry list across all customer routes. After saving on C05, C07 opens with confirmation, and C06 immediately includes the new entry.

### Development data and important limitations

The app still has **no backend**. Creating an inquiry only stores a record in React state, with a visible "local demo" disclaimer. **No message, phone call, notification, or real seller response is sent.** The data is lost on a full app restart. Pending / Responded / Closed are demo statuses only. Three clearly labelled sample entries are seeded to show list and details states, including one illustrative (not real) seller reply. These are NOT real accounts or actual sellers.

The app does not require new npm packages for this feature. When Laravel is added, replace `MarketplaceContext` with authenticated API services, server-generated inquiry IDs, server-owned inquiry statuses, and database records. Avoid treating the sample response as real communication.

### Testing steps

1. Unzip project, open the project root in VS Code.
2. Run `npm ci` and `npx expo start --clear`.
3. Log in with the **demo customer** credentials (`0771234567` / `FishMate123`).
4. Customer Home → pick a fish → Fish Listing Details → **Ask seller** → C05. The selected fish and quantity should prefill.
5. Select a suggestion or enter a message (at least 10 characters), optionally set a quantity within the listing's stock, then tap **Save demo inquiry**.
6. C07 shows the confirmation. Choose **Back to my inquiries** and confirm the new Pending card appears in C06.
7. Switch between the four filters; search by seller, fish name or message; open a sample Responded inquiry to see the clearly marked mock reply.
8. Close an inquiry from C07, then confirm it appears under Closed in C06. Reopen it from C07 if needed.
9. Open a seller profile and tap **Connect with fisherman** to try a general inquiry.

### Source files

New:

- `src/app/customer/connect.tsx`
- `src/app/customer/inquiry/[id].tsx`
- `src/components/customer/InquiryUI.tsx`
- `src/utils/inquiryUtils.ts`

Modified:

- `src/app/customer/inquiries.tsx`
- `src/app/customer/_layout.tsx`
- `src/app/customer/listing/[id].tsx`
- `src/app/customer/fisherman/[id].tsx`
- `src/components/customer/MarketplaceContext.tsx`
- `src/components/customer/InquiryComposer.tsx` (legacy compatibility only; dedicated C05 route is the primary experience)

### Verification

- Source-level TS/TSX syntax checks and local image require checks pass.
- Inquiry form validation helpers were tested directly.
- Full Expo device compilation and lint were **not completed** in the build environment because `npm ci --offline` cannot retrieve a cached `zod-validation-error@4.0.2` package.
- Run `npm ci`, `npm run typecheck`, `npm run lint` and test on your Android/iOS device using your local environment.
