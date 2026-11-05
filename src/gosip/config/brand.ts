/**
 * GoSip — central brand configuration.
 *
 * Change the brand name, taglines or support details here and every
 * screen (customer app, venue staff portal and admin portal) updates.
 */
export const BRAND = {
  name: "GoSip",
  /** Wordmark text rendered by <GoSipLogo />. */
  wordmark: "GOSIP",
  tagline: "2 DRINKS. EVERY DAY.",
  motto: "SIP. SOCIALIZE. REPEAT.",
  promise: "Great Drinks. Great People. Better Moments.",
  description:
    "A curated hospitality membership connecting you to selected restaurants, bars, lounges, hotels and experiences across the UAE — with Qatar and Kuwait coming next.",
  supportEmail: "members@gosip.demo",
  supportPhone: "+971 4 000 0000",
  /** Shown wherever a simulated feature is presented. */
  demoNotice:
    "Demonstration build — payments, subscriptions, redemption codes and security settings are simulated locally on this device.",
  legalAgeNotice:
    "Alcoholic drinks are served only to guests of legal drinking age. Photo ID may be checked by the venue.",
} as const;

/** Redemption-code behaviour (frontend demo only). */
export const REDEMPTION_RULES = {
  codeLength: 6,
  /** Minutes a generated code stays valid. */
  codeValidityMinutes: 15,
  /** Characters used in codes — ambiguous characters (0/O, 1/I/L) removed. */
  alphabet: "ABCDEFGHJKMNPQRSTUVWXYZ23456789",
} as const;

/** Food-discount proposition (configurable). */
export const FOOD_DISCOUNT = {
  defaultPercent: 20,
  headline: "20% OFF FOOD FOR ALL GOSIP MEMBERS",
  exclusions: [
    "Not valid on beverages, tobacco or shisha",
    "Not valid with other promotions, set menus or brunches",
    "Not valid on public holidays or ticketed events unless stated",
    "Service charge and municipality fees calculated on the full bill",
  ],
  conditions: [
    "Show your active GoSip membership card before ordering",
    "Applies to the member's own food order, up to a table of 4",
    "Valid for the whole membership period at participating venues",
  ],
} as const;
