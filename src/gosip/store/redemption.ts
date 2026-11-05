/**
 * Manual redemption-code logic (pure functions, frontend demo only).
 *
 * PRODUCTION NOTE: codes generated and verified on the device are NOT
 * secure. Production must generate, sign, store and validate codes on the
 * backend (single-use, venue- and benefit-bound, server-side expiry and
 * audit log). Nothing here uses QR codes.
 */
import { REDEMPTION_RULES } from "../config/brand";
import type { DrinkCategoryId } from "../data/drinks";
import { dayKey, normalizeCode } from "../utils/format";

export type RedemptionStatus = "pending" | "redeemed" | "expired" | "cancelled";

export interface Redemption {
  id: string;
  code: string;
  memberId: string;
  venueId: string;
  categoryId: DrinkCategoryId;
  createdAt: number;
  expiresAt: number;
  status: RedemptionStatus;
  redeemedAt?: number;
  /** Membership day (venue-country local date) the drink counts against. */
  day: string;
  /** Seeded record shown for demonstration. */
  sample?: boolean;
}

export type VerifyResult =
  | { kind: "valid"; record: Redemption }
  | { kind: "invalid" }
  | { kind: "wrongVenue"; record: Redemption }
  | { kind: "expired"; record: Redemption }
  | { kind: "alreadyRedeemed"; record: Redemption }
  | { kind: "cancelled"; record: Redemption };

/** Pending codes past expiry are treated as expired. */
export function effectiveStatus(r: Redemption, now: number): RedemptionStatus {
  if (r.status === "pending" && now > r.expiresAt) return "expired";
  return r.status;
}

export function generateUniqueCode(existing: Set<string>, rand: () => number = Math.random): string {
  const { alphabet, codeLength } = REDEMPTION_RULES;
  for (let attempt = 0; attempt < 1000; attempt++) {
    let code = "";
    for (let i = 0; i < codeLength; i++) code += alphabet[Math.floor(rand() * alphabet.length)];
    if (!existing.has(code)) return code;
  }
  throw new Error("Could not generate a unique code");
}

export function verifyCode(input: string, venueId: string, all: Redemption[], now: number): VerifyResult {
  const code = normalizeCode(input);
  const record = all.find((r) => r.code === code);
  if (!record) return { kind: "invalid" };
  if (record.venueId !== venueId) return { kind: "wrongVenue", record };
  const status = effectiveStatus(record, now);
  if (status === "redeemed") return { kind: "alreadyRedeemed", record };
  if (status === "expired") return { kind: "expired", record };
  if (status === "cancelled") return { kind: "cancelled", record };
  return { kind: "valid", record };
}

export interface Entitlement {
  perDay: number;
  redeemedToday: number;
  pendingToday: number;
  remaining: number;
  today: string;
}

export function entitlementFor(memberId: string, perDay: number, all: Redemption[], now: number, utcOffset = 4): Entitlement {
  const today = dayKey(now, utcOffset);
  let redeemedToday = 0;
  let pendingToday = 0;
  for (const r of all) {
    if (r.memberId !== memberId || r.day !== today) continue;
    const s = effectiveStatus(r, now);
    if (s === "redeemed") redeemedToday++;
    else if (s === "pending") pendingToday++;
  }
  return {
    perDay,
    redeemedToday,
    pendingToday,
    remaining: Math.max(0, perDay - redeemedToday - pendingToday),
    today,
  };
}
