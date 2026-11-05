/**
 * GoSip membership plans — the ONLY place package names, prices, durations
 * and benefits are defined. The references show several price variations;
 * the values below are the demonstration prices from the brief and must be
 * confirmed by the client before being presented as official.
 */
import type { DrinkCategoryId } from "../data/drinks";

export type PlanId = "tourist" | "basic" | "premium";
export type VenueTier = "standard" | "signature" | "premium";

export interface MembershipPlan {
  id: PlanId;
  name: string;
  shortName: string;
  durationDays: number;
  durationLabel: string;
  /** Price in AED (primary currency). */
  priceAED: number;
  vatInclusive: boolean;
  drinksPerDay: number;
  drinkCategories: DrinkCategoryId[];
  /** Venue tiers the plan may redeem at. */
  venueTiers: VenueTier[];
  foodDiscountPercent: number;
  /** Max. venue allocation per verified redemption day (AED, business rule). */
  venueAllocationAED: number;
  summary: string;
  highlights: string[];
  restrictions: string[];
  accent: "teal" | "navy" | "gold";
  imageKey: "beachSkyline" | "barCocktails" | "palmLounge";
  recommended?: boolean;
}

export const PLANS: MembershipPlan[] = [
  {
    id: "tourist",
    name: "Tourist Package",
    shortName: "Tourist",
    durationDays: 7,
    durationLabel: "7 days",
    priceAED: 195,
    vatInclusive: true,
    drinksPerDay: 2,
    drinkCategories: ["soft", "spirits", "cocktails"],
    venueTiers: ["standard", "signature"],
    foodDiscountPercent: 20,
    venueAllocationAED: 80,
    summary: "A week of the UAE's best bars and restaurants — made for visitors.",
    highlights: [
      "2 complimentary drinks every day",
      "Soft drinks, house spirits & selected cocktails",
      "20% off food at participating venues",
      "Standard & Signature venues",
    ],
    restrictions: [
      "Valid for 7 consecutive days from activation",
      "Maximum 2 complimentary drinks per day across all venues",
      "Not valid at Premium-tier venues",
    ],
    accent: "teal",
    imageKey: "beachSkyline",
  },
  {
    id: "basic",
    name: "Basic Package",
    shortName: "Basic",
    durationDays: 30,
    durationLabel: "1 month",
    priceAED: 375,
    vatInclusive: true,
    drinksPerDay: 2,
    drinkCategories: ["soft", "spirits", "cocktails", "bottleBeers"],
    venueTiers: ["standard", "signature"],
    foodDiscountPercent: 20,
    venueAllocationAED: 195,
    summary: "Your monthly ritual — soft drinks, house spirits, cocktails and bottle beers.",
    highlights: [
      "2 complimentary drinks every day",
      "Soft drinks, house spirits & mixers, selected cocktails, bottle beers",
      "20% off food at participating venues",
      "Standard & Signature venues",
    ],
    restrictions: [
      "Monthly membership, renews only when you choose",
      "Maximum 2 complimentary drinks per day across all venues",
      "Not valid at Premium-tier venues",
    ],
    accent: "navy",
    imageKey: "barCocktails",
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium Package",
    shortName: "Premium",
    durationDays: 30,
    durationLabel: "1 month",
    priceAED: 445,
    vatInclusive: true,
    drinksPerDay: 2,
    drinkCategories: [
      "soft",
      "spirits",
      "wines",
      "cocktails",
      "bottleBeers",
      "draughtBeers",
    ],
    venueTiers: ["standard", "signature", "premium"],
    foodDiscountPercent: 20,
    venueAllocationAED: 250,
    summary: "Every category, every tier — including our Premium rooftop and hotel venues.",
    highlights: [
      "2 complimentary drinks every day",
      "All categories incl. wines & draught beers",
      "20% off food at participating venues",
      "Access to Premium-tier venues & member events",
    ],
    restrictions: [
      "Monthly membership, renews only when you choose",
      "Maximum 2 complimentary drinks per day across all venues",
      "Member events subject to availability",
    ],
    accent: "gold",
    imageKey: "palmLounge",
  },
];

export const TIER_LABEL: Record<VenueTier, string> = {
  standard: "Standard",
  signature: "Signature",
  premium: "Premium",
};

export function getPlan(id: PlanId | null | undefined): MembershipPlan | undefined {
  return PLANS.find((p) => p.id === id);
}
