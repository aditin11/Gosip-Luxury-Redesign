# GoSip — Demo Notes

A presenter's guide to the GoSip frontend demonstration. **No backend exists in this repository.** Every feature below runs on the device. On the web, state is saved in the browser's `localStorage`, so a member tab and a staff tab in the same browser stay in sync.

---

## 1. Start the application

```bash
npm install
npx expo start --web          # Windows PowerShell: npx.cmd expo start --web
```

Open <http://localhost:8081>.

- Static build: `npx expo export --platform web`, then `npx expo serve` and open <http://localhost:8000> (or the port it prints).
- Mobile: `npx expo start`, then scan the QR code in the terminal with Expo Go. That QR code belongs to the Expo developer tool; GoSip itself never uses QR codes.
- To reset the demo, go to **Profile → Reset demo data**. This restores the sample members, venues and codes.

## 2. Customer screens

| Screen | How to reach it |
| --- | --- |
| Splash → onboarding | Open `/`. The splash plays once per visit, and **Skip** jumps ahead. |
| Create account | Onboarding → **JOIN NOW** |
| Sign in as the demo member | Onboarding → **Sign in**, then tap the demo-credentials box |
| Explore instantly | Onboarding → **Explore the demo** (signs in as the demo member) |
| Packages / checkout | `/packages` → pick a package → **Continue** → `/checkout` |
| Home | `/` (tab **Home**) |
| Venue discovery | `/venues`. Filter by country, city, area and type, or search. |
| Venue details | Tap any venue (e.g. `/venue/downtown-social`) |
| Redeem a drink | Venue → **Redeem drinks** → choose a category → code screen |
| My Drinks | `/drinks` |
| Membership card | `/card` |
| Usage | Profile → **My usage** (`/usage`) |
| Food discounts & experiences | `/offers` (also the bell icon on mobile home) |
| Security | Profile → **Security** (`/security`) |
| Arabic / RTL | Profile → **Language → العربية**, or the language button in the desktop nav |
| About this demo | `/modal` |

**Suggested live demo (two browser tabs):**
1. Tab A: **Explore the demo**, then open **Downtown Social**, tap **Redeem drinks** and choose **Cocktails**. A 6-character code appears with a 15-minute countdown.
2. Tap **Demo: open venue staff portal in a new tab**. Tab B opens `/staff`.
3. Tab B: choose **Downtown Social**, tap the demo box to fill PIN **1001**, open the portal, enter the code, tap **Verify**, then **Confirm redemption**.
4. Tab A switches to **Drink redeemed!** automatically, and **My Drinks** now shows 1 of 2 left.
5. Enter the same code again in Tab B. It is rejected as **Already redeemed**.

## 3. Admin and venue staff demos

| Portal | URL | Sample access |
| --- | --- | --- |
| Venue staff portal | `/staff` | Choose a venue. Each sample venue has a PIN shown on the login screen (Downtown Social **1001**, Sky Lounge **1002**, The Palm Lounge **1003** …). |
| Admin dashboard | `/admin` | `admin@gosip.demo` / `admin-demo` (tap the demo box to fill) |

Both are also linked from **Profile** and from the home-page footer.

## 4. Sample member details

| Field | Value |
| --- | --- |
| Name | Layla Haddad |
| Email / password | `layla@gosip.demo` / `gosip-demo` |
| Member ID | GS-UAE-204817 |
| Package | Basic (1 month) — started 6 days before first load, expires 24 days after |
| Today | 2 of 2 drinks available, with 6 days of sample redemption history |

New accounts created with **JOIN NOW** start with no package until the demo checkout is completed.

## 5. Sample redemption codes

All of these are for **Downtown Social** (staff PIN **1001**) unless noted.

| Code | Expected result |
| --- | --- |
| `K7M-4QX` | ✅ Valid (single use; after confirming it shows "Already redeemed") |
| `P8T-2WN` | ✅ Valid (a second spare code) |
| `R3D-M8P` | ⚠️ Already redeemed |
| `X9E-XP2` | ⌛ Expired |
| `S5K-Y7L` | 🚫 Belongs to another venue (valid only at **Sky Lounge**, PIN 1002) |
| any other 6 characters | ❌ Invalid |

Hyphens and lowercase are accepted. Codes the app generates are 6 characters, single-use, tied to one venue and one drink, and expire after 15 minutes. **Reset demo data** restores the sample codes.

## 6. What is simulated

| Feature | Simulation |
| --- | --- |
| Sign up / sign in | Local only; only the demo credentials sign in. No passwords are stored or sent. |
| Packages & subscriptions | Activation is set locally after the demo checkout. |
| Payments | Presentation only. No card details are requested, no provider is called and no money moves. "Simulate a failed payment" shows the declined path. |
| Redemption codes | Generated and validated in the browser (`src/gosip/store/redemption.ts`). |
| Staff verification | Uses the same local records. The PINs are demo values. |
| Admin edits | Venues, availability, plan prices and benefits change on this device only. |
| Usage statistics | Calculated from local records, including seeded sample history. No savings figures are invented. |
| Revenue statistics (admin) | Calculated from sample members and simulated checkouts. They are not financial data. |
| Security (Face ID, fingerprint, app lock, single device, trusted devices) | Preference switches only. Nothing is enforced. |
| Venues, members, offers | Fictional sample records (`isSample: true`). They do not represent real businesses or confirmed partnerships. |
| Qatar & Kuwait | Shown as "coming soon" with preview listings that cannot be redeemed. |

## 7. Requires backend integration

- Authentication, sessions and account management
- Payment gateway (card, Apple Pay, Google Pay, Tabby, bank transfer) with signed webhooks for activation
- Subscription lifecycle (activation, expiry, renewal, upgrades)
- **Server-side code issuance and validation**: cryptographically random, single-use, venue- and benefit-bound, server-side expiry, idempotent confirmation, audit log
- Venue staff accounts, roles and PINs
- Admin CRUD with permissions and audit trail
- Real venue, menu, opening-hours and partnership data, kept separate from the sample data
- Single-device enforcement, trusted-device management and login alerts
- Usage analytics, reporting and venue allocation / settlement

## 8. Requires native device integration

- Face ID / fingerprint unlock and app lock (e.g. `expo-local-authentication`)
- Push notifications for offers and redemption updates (e.g. `expo-notifications`)
- Secure on-device storage for sessions (e.g. `expo-secure-store`)
- Apple Wallet / Google Wallet passes for the membership card
- Native Apple Pay / Google Pay sheets
- Persistent storage on iOS/Android (the native demo keeps state in memory; web uses `localStorage`)
- Full native RTL layout (`I18nManager.forceRTL` requires an app restart; the web switches direction instantly)

## 9. Notes for the presenter

- Package prices (AED 195 / 375 / 445, VAT inclusive) are the demonstration values from the brief and must be confirmed by the client. Edit them in `src/gosip/config/plans.ts`.
- The food discount (20%) is configurable in `src/gosip/config/brand.ts`.
- The photography is bundled locally and was cropped from the client's reference material, so the demo works offline. Some crops are small and look soft at desktop hero sizes; swap in licensed high-resolution photography before a public launch.
- Investor and fundraising content from the reference posters is intentionally **not** in the customer app.
