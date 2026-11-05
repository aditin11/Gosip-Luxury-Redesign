/** GoSip design tokens. */
export const C = {
  midnight: "#071321",
  obsidian: "#090B10",
  deepNavy: "#0D1B2A",
  card: "#111D2C",
  cardRaised: "#16263A",
  gold: "#E8BD70",
  warmGold: "#D4A64D",
  bronze: "#96764A",
  ivory: "#F6F1E7",
  ivoryDim: "#E9E1D1",
  muted: "#A7ADB5",
  mutedDim: "#6E7682",
  white: "#FFFFFF",
  ink: "#141B26",
  inkSoft: "#4A5260",
  line: "rgba(232,189,112,0.18)",
  lineSoft: "rgba(255,255,255,0.08)",
  goldWash: "rgba(232,189,112,0.10)",
  success: "#6CC598",
  successWash: "rgba(108,197,152,0.14)",
  danger: "#E2786A",
  dangerWash: "rgba(226,120,106,0.14)",
  warning: "#E6B35A",
  teal: "#16506A",
} as const;

export const F = {
  display: "PlayfairDisplay_600SemiBold",
  displayBold: "PlayfairDisplay_700Bold",
  body: "SpaceGrotesk_400Regular",
  medium: "SpaceGrotesk_500Medium",
  semibold: "SpaceGrotesk_600SemiBold",
  bold: "SpaceGrotesk_700Bold",
} as const;

export const R = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 } as const;

export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

/** Breakpoints for the responsive website. */
export const BP = { tablet: 720, desktop: 1024, wide: 1320 } as const;

export const MAX_W = 1200;

export const GOLD_GRADIENT = ["#F1D08E", "#E2B465", "#C99A47"] as const;
export const NAVY_GRADIENT = ["#0D1B2A", "#071321"] as const;
