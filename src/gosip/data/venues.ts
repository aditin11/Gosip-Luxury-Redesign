/**
 * SAMPLE VENUE RECORDS — fictional demonstration venues.
 * These names do not represent real businesses or confirmed GoSip partners.
 * Verified partner data must come from the backend and be kept separate.
 */
import type { DrinkCategoryId } from "./drinks";
import type { CountryId } from "./locations";
import type { ImageKey } from "./images";
import type { VenueTier } from "../config/plans";

export type VenueType = "restaurant" | "bar" | "lounge" | "hotel" | "beachClub" | "experience";

export const VENUE_TYPES: { id: VenueType; label: string; labelAr: string }[] = [
  { id: "restaurant", label: "Restaurants", labelAr: "مطاعم" },
  { id: "bar", label: "Bars", labelAr: "بارات" },
  { id: "lounge", label: "Lounges", labelAr: "صالات" },
  { id: "hotel", label: "Hotels", labelAr: "فنادق" },
  { id: "beachClub", label: "Beach clubs", labelAr: "نوادي شاطئية" },
  { id: "experience", label: "Experiences", labelAr: "تجارب" },
];

export const VENUE_TYPE_SINGULAR: Record<VenueType, string> = {
  restaurant: "Restaurant",
  bar: "Bar",
  lounge: "Lounge",
  hotel: "Hotel",
  beachClub: "Beach club",
  experience: "Experience",
};

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  tier: VenueTier;
  countryId: CountryId;
  cityId: string;
  area: string;
  rating: number;
  distanceKm: number;
  imageKey: ImageKey;
  gallery: ImageKey[];
  /** Gradient used for the monogram fallback. */
  tint: [string, string];
  description: string;
  benefits: string[];
  drinkCategories: DrinkCategoryId[];
  foodDiscountPercent: number;
  foodExclusions: string[];
  hours: { days: string; open: string; close: string }[];
  memberHours: string;
  dressCode: string;
  entryRequirements: string[];
  accessConditions: string[];
  restrictions: string[];
  address: string;
  phone: string;
  featured?: boolean;
  /** Available for redemption right now (admin can toggle). */
  active: boolean;
  isSample: true;
  /** Demo staff PIN for the venue portal. */
  staffPin: string;
}

const STD_ENTRY = ["Valid photo ID for alcoholic drinks", "Active GoSip membership on the member's phone"];
const STD_ACCESS = ["Subject to venue capacity", "Management reserves the right of admission"];
const STD_RESTRICT = ["One complimentary drink per member per visit", "Benefits cannot be combined with other offers"];

const v = (x: Omit<Venue, "isSample" | "active" | "entryRequirements" | "accessConditions" | "restrictions" | "gallery"> & Partial<Pick<Venue, "entryRequirements" | "accessConditions" | "restrictions" | "gallery" | "active">>): Venue => ({
  entryRequirements: STD_ENTRY,
  accessConditions: STD_ACCESS,
  restrictions: STD_RESTRICT,
  gallery: [x.imageKey],
  active: true,
  isSample: true,
  ...x,
});

export const SAMPLE_VENUES: Venue[] = [
  v({
    id: "downtown-social", name: "Downtown Social", type: "bar", tier: "standard",
    countryId: "uae", cityId: "dubai", area: "Downtown Dubai", rating: 4.7, distanceKm: 0.9,
    imageKey: "cocktailsTerrace", gallery: ["cocktailsTerrace", "barCocktails", "skylineDusk"], tint: ["#6B2A1A", "#1A0F0C"],
    description: "A lively social bar beneath the tallest skyline in the world. Smart casual, great music and a terrace built for golden hour.",
    benefits: ["2 complimentary drinks daily", "20% off the food menu", "Priority terrace seating on weekdays"],
    drinkCategories: ["soft", "spirits", "cocktails", "bottleBeers"], foodDiscountPercent: 20,
    foodExclusions: ["Sharing platters on Friday"],
    hours: [{ days: "Mon–Thu", open: "16:00", close: "01:00" }, { days: "Fri–Sun", open: "14:00", close: "02:00" }],
    memberHours: "Member drinks 16:00–22:00 daily", dressCode: "Smart casual",
    address: "Boulevard Plaza, Downtown Dubai (sample)", phone: "+971 4 000 0101", featured: true, staffPin: "1001",
  }),
  v({
    id: "sky-lounge", name: "Sky Lounge", type: "lounge", tier: "signature",
    countryId: "uae", cityId: "dubai", area: "Dubai Marina", rating: 4.8, distanceKm: 2.4,
    imageKey: "skyLounge", gallery: ["skyLounge", "loungeCocktails", "skylineNight"], tint: ["#1B3556", "#0A1424"],
    description: "Forty-two floors above the Marina with floor-to-ceiling views, a resident DJ and a signature cocktail list.",
    benefits: ["2 complimentary drinks daily", "20% off food", "Guest-list access on Thursdays"],
    drinkCategories: ["soft", "spirits", "wines", "cocktails"], foodDiscountPercent: 20,
    foodExclusions: ["Caviar service", "Set menus"],
    hours: [{ days: "Daily", open: "17:00", close: "02:00" }],
    memberHours: "Member drinks 17:00–21:00 daily", dressCode: "Elegant — no sportswear or flip-flops",
    address: "Marina Walk Tower, Dubai Marina (sample)", phone: "+971 4 000 0102", featured: true, staffPin: "1002",
  }),
  v({
    id: "palm-lounge", name: "The Palm Lounge", type: "lounge", tier: "premium",
    countryId: "uae", cityId: "dubai", area: "Palm Jumeirah", rating: 4.9, distanceKm: 16.5,
    imageKey: "palmTerrace", gallery: ["palmTerrace", "palmLounge", "loungeCocktails"], tint: ["#5A3B12", "#1B1206"],
    description: "A palm-fringed terrace lounge with sunset views back to the Dubai skyline. Premium members only.",
    benefits: ["2 complimentary drinks daily", "20% off food", "Sunset table reservation for members"],
    drinkCategories: ["soft", "spirits", "wines", "cocktails", "bottleBeers", "draughtBeers"], foodDiscountPercent: 20,
    foodExclusions: ["Seafood towers"],
    hours: [{ days: "Daily", open: "15:00", close: "01:00" }],
    memberHours: "Member drinks 15:00–20:00 daily", dressCode: "Resort chic",
    address: "Crescent Road, Palm Jumeirah (sample)", phone: "+971 4 000 0103", featured: true, staffPin: "1003",
  }),
  v({
    id: "beach-bar", name: "The Beach Bar", type: "beachClub", tier: "signature",
    countryId: "uae", cityId: "dubai", area: "Palm Jumeirah", rating: 4.6, distanceKm: 16.8,
    imageKey: "beachBar", gallery: ["beachBar", "beachSkyline"], tint: ["#0F5560", "#06222A"],
    description: "Infinity pool, sun loungers and Arabian Gulf views. Daybeds can be booked through the venue.",
    benefits: ["2 complimentary drinks daily", "20% off food", "Discounted daybed entry on weekdays"],
    drinkCategories: ["soft", "spirits", "cocktails", "bottleBeers", "draughtBeers"], foodDiscountPercent: 20,
    foodExclusions: ["Pool-side minimum spend packages"],
    hours: [{ days: "Daily", open: "10:00", close: "23:00" }],
    memberHours: "Member drinks 12:00–18:00 daily", dressCode: "Swimwear at the pool, cover-up at the bar",
    entryRequirements: [...STD_ENTRY, "Beach entry fee payable at the venue on weekends"],
    address: "West Crescent, Palm Jumeirah (sample)", phone: "+971 4 000 0104", featured: true, staffPin: "1004",
  }),
  v({
    id: "bay-room", name: "Bay Room", type: "restaurant", tier: "standard",
    countryId: "uae", cityId: "dubai", area: "Business Bay", rating: 4.5, distanceKm: 2.2,
    imageKey: "restaurantInterior", gallery: ["restaurantInterior", "foodSignature"], tint: ["#3A1F3D", "#140B16"],
    description: "Modern European brasserie on the canal. Long lunches, wood-fired mains and a buzzing evening bar.",
    benefits: ["2 complimentary drinks daily", "20% off food", "Complimentary dessert on member birthdays"],
    drinkCategories: ["soft", "wines", "cocktails"], foodDiscountPercent: 20,
    foodExclusions: ["Business lunch set menu"],
    hours: [{ days: "Daily", open: "12:00", close: "00:00" }],
    memberHours: "Member drinks 12:00–20:00 daily", dressCode: "Smart casual",
    address: "Canal Walk, Business Bay (sample)", phone: "+971 4 000 0105", staffPin: "1005",
  }),
  v({
    id: "gilded-room", name: "The Gilded Room", type: "restaurant", tier: "premium",
    countryId: "uae", cityId: "dubai", area: "DIFC", rating: 4.8, distanceKm: 3.1,
    imageKey: "foodSignature", gallery: ["foodSignature", "restaurantInterior"], tint: ["#5C4218", "#1C1408"],
    description: "Fine dining from an open kitchen, with a chef's counter and an award-worthy wine room.",
    benefits: ["2 complimentary drinks daily", "20% off à la carte food", "Chef's counter priority booking"],
    drinkCategories: ["soft", "wines", "cocktails", "spirits"], foodDiscountPercent: 20,
    foodExclusions: ["Tasting menus", "Wagyu and truffle supplements"],
    hours: [{ days: "Tue–Sun", open: "18:30", close: "00:00" }],
    memberHours: "Member drinks 18:30–21:30, Tue–Sun", dressCode: "Formal elegant — jackets preferred",
    entryRequirements: [...STD_ENTRY, "Reservation required"],
    address: "Gate Village, DIFC (sample)", phone: "+971 4 000 0106", featured: true, staffPin: "1006",
  }),
  v({
    id: "jumeirah-terrace", name: "Jumeirah Terrace", type: "hotel", tier: "signature",
    countryId: "uae", cityId: "dubai", area: "Jumeirah", rating: 4.6, distanceKm: 7.4,
    imageKey: "loungeCocktails", gallery: ["loungeCocktails", "cocktailsTerrace"], tint: ["#283A5E", "#0B1222"],
    description: "The lobby bar and terrace of a boutique beachfront hotel — candlelit, calm and beautifully served.",
    benefits: ["2 complimentary drinks daily", "20% off food", "Late checkout request for hotel guests"],
    drinkCategories: ["soft", "spirits", "wines", "cocktails", "bottleBeers"], foodDiscountPercent: 20,
    foodExclusions: ["In-room dining"],
    hours: [{ days: "Daily", open: "11:00", close: "01:00" }],
    memberHours: "Member drinks 17:00–22:00 daily", dressCode: "Smart casual",
    address: "Jumeirah Beach Road (sample)", phone: "+971 4 000 0107", staffPin: "1007",
  }),
  v({
    id: "bluewaters-deck", name: "Bluewaters Deck", type: "bar", tier: "standard",
    countryId: "uae", cityId: "dubai", area: "Bluewaters Island", rating: 4.4, distanceKm: 18.9,
    imageKey: "barCocktails", gallery: ["barCocktails", "skylineNight"], tint: ["#14404E", "#071820"],
    description: "Waterfront deck bar with live acoustic sets and views of the Marina skyline.",
    benefits: ["2 complimentary drinks daily", "20% off food"],
    drinkCategories: ["soft", "spirits", "bottleBeers", "draughtBeers"], foodDiscountPercent: 20,
    foodExclusions: [],
    hours: [{ days: "Daily", open: "15:00", close: "01:00" }],
    memberHours: "Member drinks 15:00–21:00 daily", dressCode: "Casual",
    address: "Bluewaters Island (sample)", phone: "+971 4 000 0108", staffPin: "1008",
  }),
  v({
    id: "marina-sunset-cruise", name: "Marina Sunset Cruise", type: "experience", tier: "premium",
    countryId: "uae", cityId: "dubai", area: "Dubai Marina", rating: 4.9, distanceKm: 2.8,
    imageKey: "skylineDusk", gallery: ["skylineDusk", "skylineNight"], tint: ["#5E3A2A", "#1A0F12"],
    description: "A 90-minute golden-hour yacht cruise past the Marina and Ain Dubai. Limited member seats each week.",
    benefits: ["2 complimentary drinks on board", "Member-only departure every Thursday"],
    drinkCategories: ["soft", "wines", "cocktails"], foodDiscountPercent: 0,
    foodExclusions: ["Food not included"],
    hours: [{ days: "Thu & Sat", open: "17:00", close: "18:30" }],
    memberHours: "Thursday 17:00 departure", dressCode: "Smart casual, flat shoes",
    entryRequirements: [...STD_ENTRY, "Booking confirmed 24h in advance"],
    address: "Marina Yacht Club pier (sample)", phone: "+971 4 000 0109", staffPin: "1009",
  }),
  v({
    id: "yas-lounge", name: "Yas Marina Lounge", type: "lounge", tier: "signature",
    countryId: "uae", cityId: "abu-dhabi", area: "Yas Island", rating: 4.7, distanceKm: 4.2,
    imageKey: "skylineNight", gallery: ["skylineNight", "loungeCocktails"], tint: ["#1E2E55", "#0A1022"],
    description: "Overlooking the marina and circuit — the place to be on race weekends and beyond.",
    benefits: ["2 complimentary drinks daily", "20% off food"],
    drinkCategories: ["soft", "spirits", "cocktails", "wines"], foodDiscountPercent: 20,
    foodExclusions: ["Race-weekend packages"],
    hours: [{ days: "Daily", open: "16:00", close: "01:00" }],
    memberHours: "Member drinks 16:00–21:00 daily", dressCode: "Smart casual",
    address: "Yas Marina, Abu Dhabi (sample)", phone: "+971 2 000 0110", featured: true, staffPin: "1010",
  }),
  v({
    id: "saadiyat-beach-house", name: "Saadiyat Beach House", type: "beachClub", tier: "premium",
    countryId: "uae", cityId: "abu-dhabi", area: "Saadiyat Island", rating: 4.8, distanceKm: 9.6,
    imageKey: "beachSkyline", gallery: ["beachSkyline", "beachBar"], tint: ["#0E5A63", "#05242A"],
    description: "White sand, cabanas and a relaxed Mediterranean kitchen on Saadiyat's cultural coast.",
    benefits: ["2 complimentary drinks daily", "20% off food", "Cabana upgrade when available"],
    drinkCategories: ["soft", "wines", "cocktails", "draughtBeers"], foodDiscountPercent: 20,
    foodExclusions: ["Weekend brunch"],
    hours: [{ days: "Daily", open: "09:00", close: "22:00" }],
    memberHours: "Member drinks 12:00–18:00 daily", dressCode: "Beachwear, cover-up in the restaurant",
    address: "Saadiyat Island, Abu Dhabi (sample)", phone: "+971 2 000 0111", staffPin: "1011",
  }),
  v({
    id: "maryah-bistro", name: "Maryah Bistro", type: "restaurant", tier: "standard",
    countryId: "uae", cityId: "abu-dhabi", area: "Al Maryah Island", rating: 4.5, distanceKm: 1.6,
    imageKey: "restaurantInterior", gallery: ["restaurantInterior", "foodSignature"], tint: ["#3E2A1E", "#140D09"],
    description: "A warm, buzzy bistro for after-work plates and Friday dinners with friends.",
    benefits: ["2 complimentary drinks daily", "20% off food"],
    drinkCategories: ["soft", "cocktails", "wines"], foodDiscountPercent: 20, foodExclusions: [],
    hours: [{ days: "Daily", open: "12:00", close: "00:00" }],
    memberHours: "Member drinks 17:00–21:00 daily", dressCode: "Smart casual",
    address: "Al Maryah Island promenade (sample)", phone: "+971 2 000 0112", staffPin: "1012",
  }),
  v({
    id: "corniche-cafe", name: "Corniche Garden Café", type: "restaurant", tier: "standard",
    countryId: "uae", cityId: "abu-dhabi", area: "Corniche", rating: 4.3, distanceKm: 5.8,
    imageKey: "palmLounge", gallery: ["palmLounge"], tint: ["#2D4A2B", "#0D170C"],
    description: "Garden café with Arabic coffee, fresh juices and mocktails along the Corniche.",
    benefits: ["2 complimentary soft drinks daily", "20% off food"],
    drinkCategories: ["soft"], foodDiscountPercent: 20, foodExclusions: [],
    hours: [{ days: "Daily", open: "08:00", close: "23:00" }],
    memberHours: "All day", dressCode: "Casual, modest attire",
    entryRequirements: ["Active GoSip membership on the member's phone"],
    address: "Corniche Road, Abu Dhabi (sample)", phone: "+971 2 000 0113", staffPin: "1013",
  }),
  v({
    id: "majaz-terrace", name: "Majaz Terrace", type: "restaurant", tier: "standard",
    countryId: "uae", cityId: "sharjah", area: "Al Majaz", rating: 4.4, distanceKm: 3.0,
    imageKey: "cocktailsTerrace", gallery: ["cocktailsTerrace"], tint: ["#4A2E1A", "#170E08"],
    description: "Lakeside family terrace serving mocktails, specialty coffee and grills.",
    benefits: ["2 complimentary soft drinks daily", "20% off food"],
    drinkCategories: ["soft"], foodDiscountPercent: 20, foodExclusions: [],
    hours: [{ days: "Daily", open: "09:00", close: "00:00" }],
    memberHours: "All day", dressCode: "Modest attire",
    entryRequirements: ["Active GoSip membership on the member's phone"],
    address: "Al Majaz Waterfront, Sharjah (sample)", phone: "+971 6 000 0114", staffPin: "1014",
  }),
  v({
    id: "marjan-sands", name: "Marjan Sands Club", type: "beachClub", tier: "signature",
    countryId: "uae", cityId: "ras-al-khaimah", area: "Al Marjan Island", rating: 4.6, distanceKm: 6.4,
    imageKey: "beachBar", gallery: ["beachBar", "beachSkyline"], tint: ["#125260", "#061E24"],
    description: "Island beach club with sunset sessions and a grill kitchen.",
    benefits: ["2 complimentary drinks daily", "20% off food"],
    drinkCategories: ["soft", "spirits", "cocktails", "bottleBeers"], foodDiscountPercent: 20, foodExclusions: [],
    hours: [{ days: "Daily", open: "10:00", close: "23:00" }],
    memberHours: "Member drinks 12:00–19:00 daily", dressCode: "Beachwear welcome",
    address: "Al Marjan Island, RAK (sample)", phone: "+971 7 000 0115", staffPin: "1015",
  }),
  v({
    id: "west-bay-lounge", name: "West Bay Lounge", type: "lounge", tier: "signature",
    countryId: "qatar", cityId: "doha", area: "West Bay", rating: 4.7, distanceKm: 1.2,
    imageKey: "skyLounge", gallery: ["skyLounge"], tint: ["#3B1E3E", "#120914"],
    description: "Launching soon — a hotel sky lounge above the Doha skyline (preview listing).",
    benefits: ["2 complimentary drinks daily (from launch)", "20% off food"],
    drinkCategories: ["soft", "spirits", "cocktails"], foodDiscountPercent: 20, foodExclusions: [],
    hours: [{ days: "Daily", open: "18:00", close: "01:00" }],
    memberHours: "From launch", dressCode: "Elegant",
    address: "West Bay, Doha (sample)", phone: "+974 4000 0116", staffPin: "1016", active: false,
  }),
  v({
    id: "lusail-marina-grill", name: "Lusail Marina Grill", type: "restaurant", tier: "standard",
    countryId: "qatar", cityId: "lusail", area: "Lusail Marina", rating: 4.5, distanceKm: 2.6,
    imageKey: "foodSignature", gallery: ["foodSignature"], tint: ["#4D3A16", "#171106"],
    description: "Launching soon — marina-front grill with mocktail bar (preview listing).",
    benefits: ["2 complimentary soft drinks daily (from launch)", "20% off food"],
    drinkCategories: ["soft"], foodDiscountPercent: 20, foodExclusions: [],
    hours: [{ days: "Daily", open: "12:00", close: "23:30" }],
    memberHours: "From launch", dressCode: "Smart casual",
    address: "Lusail Marina (sample)", phone: "+974 4000 0117", staffPin: "1017", active: false,
  }),
  v({
    id: "sharq-social", name: "Sharq Social", type: "restaurant", tier: "standard",
    countryId: "kuwait", cityId: "kuwait-city", area: "Sharq", rating: 4.4, distanceKm: 1.9,
    imageKey: "restaurantInterior", gallery: ["restaurantInterior"], tint: ["#2A2F4A", "#0B0D18"],
    description: "Launching soon — mocktail and specialty-coffee lounge with a modern Kuwaiti menu (preview listing).",
    benefits: ["2 complimentary soft drinks daily (from launch)", "20% off food"],
    drinkCategories: ["soft"], foodDiscountPercent: 20, foodExclusions: [],
    hours: [{ days: "Daily", open: "10:00", close: "00:00" }],
    memberHours: "From launch", dressCode: "Modest attire",
    entryRequirements: ["Active GoSip membership on the member's phone"],
    address: "Sharq, Kuwait City (sample)", phone: "+965 2000 0118", staffPin: "1018", active: false,
  }),
];
