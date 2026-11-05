<p align="center">
  <img src="./assets/images/icon.png" width="96" style="border-radius: 22px;" alt="GoSip" />
</p>

<h1 align="center">GoSip — 2 Drinks. Every Day.</h1>

<p align="center">
  <strong>A premium hospitality membership platform for the UAE (Qatar and Kuwait next).</strong><br/>
  Two complimentary drinks every day, food discounts and member experiences at curated restaurants, bars, lounges, hotels and beach clubs.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK%2054-000000?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/React__Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Platform-Web%20%7C%20iOS%20%7C%20Android-E8BD70?style=for-the-badge" alt="Platforms" />
</p>

> **Frontend demonstration.** This repository contains no backend. Accounts, payments, subscriptions, redemption codes, staff verification, admin edits and security settings are simulated on the device. See [DEMO_NOTES.md](./DEMO_NOTES.md) for what is simulated and what needs a backend.

---

## Quick start

```bash
npm install
npx expo start --web        # Windows PowerShell: npx.cmd expo start --web
```

Open <http://localhost:8081>. The cinematic splash plays, then onboarding.

| Task | Command |
| --- | --- |
| Type-check | `npx tsc --noEmit` |
| Static web export | `npx expo export --platform web` (output in `dist/`) |
| Serve the export | `npx expo serve` |
| iOS / Android | `npx expo start` then press `i` / `a`, or scan with Expo Go |

## What's inside

**Customer app:** cinematic splash, onboarding, sign up / sign in, membership packages with comparison, demonstration checkout (card, Apple Pay, Google Pay, Tabby, bank transfer), home, venue discovery (country, city, area, type, search), venue details, **manual redemption codes (no QR codes)**, My Drinks, digital membership card, usage tracking, food discounts & experiences, profile, security preferences, English / Arabic (RTL).

**Venue staff portal** (`/staff`): manual code entry, valid / invalid / expired / already-redeemed / wrong-venue results, confirmation, redemption history, daily stats, venue information.

**Admin dashboard** (`/admin`): overview, countries & cities, venues (add, edit, toggle availability), members, plans (price, food discount, drink categories), benefits, drink categories, redemption codes, redemption history, usage and demo revenue statistics.

The website is responsive: desktop and laptop get a top navigation bar and multi-column grids, while phones get the bottom tab bar (Home · Venues · My Drinks · My Card · Profile).

## Project structure

```text
app/                       Expo Router routes
  _layout.tsx              Fonts, GoSipProvider, stack
  splash.tsx               Cinematic GoSip opening
  onboarding.tsx           Introduction + JOIN NOW / Sign in / Explore
  login.tsx                Create account / sign in (demo)
  packages.tsx             Package selection + comparison
  checkout.tsx             Demonstration payment + confirmation
  (tabs)/                  Home, Venues, My Drinks, My Card, Profile
                           (legacy Zomato-clone routes redirect into GoSip)
  venue/[id].tsx           Venue details
  redeem/[venueId].tsx     Drink category → unique code → live status
  usage.tsx, offers.tsx, security.tsx, modal.tsx (About this demo)
  staff.tsx                Venue staff portal
  admin.tsx                Admin dashboard
src/gosip/
  config/brand.ts          Brand name, taglines, redemption rules, food discount
  config/plans.ts          ALL package names, prices, durations and benefits
  data/                    Sample countries, cities, venues, members, drinks, offers, images
  store/GoSipProvider.tsx  Single demo store shared by customer, staff and admin
  store/redemption.ts      Code generation, verification, daily entitlement
  i18n/strings.ts          English + Arabic UI strings
  theme/tokens.ts          GoSip design tokens
  ui/                      Logo, skyline, shell/navigation, cards, primitives
assets/images/gosip/       Local hospitality imagery (works offline)
reference-assets/          Client brand reference images
```

### Changing the brand or prices

- Brand name, taglines, support details: `src/gosip/config/brand.ts`
- Package names, prices (AED, VAT-inclusive), durations, categories and restrictions: `src/gosip/config/plans.ts`
- Food-discount percentage, conditions and exclusions: `FOOD_DISCOUNT` in `src/gosip/config/brand.ts`
- Colours and fonts: `src/gosip/theme/tokens.ts`

The prices are the demonstration values from the brief. The reference material shows several different price variations, so get the final pricing approved before presenting it as official.

## Design

Midnight navy (`#071321`), obsidian (`#090B10`), champagne gold (`#E8BD70`), warm gold, antique bronze and warm ivory surfaces. Headings use Playfair Display and body text uses Space Grotesk. The GoSip wordmark replaces the dot of the *i* with a martini glass. The logo and Dubai skyline are drawn as vectors so they stay sharp at any size.

## License

Demonstration project for the GoSip client presentation.
