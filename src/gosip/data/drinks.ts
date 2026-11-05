export type DrinkCategoryId =
  | "soft"
  | "spirits"
  | "wines"
  | "cocktails"
  | "bottleBeers"
  | "draughtBeers";

export interface DrinkCategory {
  id: DrinkCategoryId;
  name: string;
  nameAr: string;
  description: string;
  icon: "CupSoda" | "GlassWater" | "Wine" | "Martini" | "Beer";
  /** Alcoholic — photo ID may be checked. */
  ageRestricted: boolean;
}

export const DRINK_CATEGORIES: DrinkCategory[] = [
  { id: "soft", name: "Soft Drinks", nameAr: "مشروبات غازية", description: "Sodas, juices, mocktails", icon: "CupSoda", ageRestricted: false },
  { id: "spirits", name: "Spirits", nameAr: "مشروبات روحية", description: "House pouring with mixer", icon: "GlassWater", ageRestricted: true },
  { id: "wines", name: "Wines", nameAr: "نبيذ", description: "House red, white or rosé", icon: "Wine", ageRestricted: true },
  { id: "cocktails", name: "Cocktails", nameAr: "كوكتيلات", description: "Selected house cocktails", icon: "Martini", ageRestricted: true },
  { id: "bottleBeers", name: "Bottle Beers", nameAr: "بيرة معبأة", description: "Selected bottled beers", icon: "Beer", ageRestricted: true },
  { id: "draughtBeers", name: "Draught Beers", nameAr: "بيرة سحب", description: "House draught on tap", icon: "Beer", ageRestricted: true },
];

export function getDrinkCategory(id: DrinkCategoryId) {
  return DRINK_CATEGORIES.find((c) => c.id === id)!;
}
