/**
 * GoSip demo store — a single source of truth shared by the customer app,
 * the venue staff portal and the admin portal.
 *
 * FRONTEND DEMONSTRATION ONLY. State lives in memory and (on web) in
 * localStorage so a member tab and a staff tab in the same browser stay in
 * sync. Nothing here is production-secure: subscriptions, payments,
 * redemption codes and security preferences must be enforced by a backend.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Platform } from "react-native";
import { PLANS, type MembershipPlan, type PlanId } from "../config/plans";
import { DEMO_MEMBER_ID, SAMPLE_MEMBERS, type Member } from "../data/members";
import { SAMPLE_VENUES, type Venue } from "../data/venues";
import { DEFAULT_CITY, DEFAULT_COUNTRY, getCountry, type CountryId } from "../data/locations";
import { DRINK_CATEGORIES, type DrinkCategoryId } from "../data/drinks";
import { REDEMPTION_RULES } from "../config/brand";
import { DAY, dayKey, initials } from "../utils/format";
import { effectiveStatus, entitlementFor, generateUniqueCode, verifyCode, type Redemption, type VerifyResult } from "./redemption";
import { translate, type Lang, type StringKey } from "../i18n/strings";

const STORAGE_KEY = "gosip-demo-state-v1";
const STATE_VERSION = 1;

export type PaymentMethod = "card" | "applePay" | "googlePay" | "tabby" | "bankTransfer";

export interface DemoPayment {
  id: string;
  memberId: string;
  planId: PlanId;
  method: PaymentMethod;
  amountAED: number;
  at: number;
  outcome: "demo-confirmed" | "demo-declined";
}

export interface SecurityPrefs {
  faceId: boolean;
  fingerprint: boolean;
  appLock: boolean;
  singleDevice: boolean;
  loginAlerts: boolean;
}

export interface GoSipState {
  version: number;
  session: { memberId: string | null; mode: "member" | "guest" } | null;
  members: Member[];
  venues: Venue[];
  plans: MembershipPlan[];
  redemptions: Redemption[];
  payments: DemoPayment[];
  savedVenueIds: string[];
  pendingPlanId: PlanId | null;
  settings: { language: Lang; countryId: CountryId; cityId: string; notifications: boolean; security: SecurityPrefs };
  staffVenueId: string | null;
  adminSignedIn: boolean;
  seededAt: number;
}

// ─── Seed ────────────────────────────────────────────────────────────────────
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

/** Sample codes documented in DEMO_NOTES.md (staff portal at Downtown Social, PIN 1001). */
export const SAMPLE_CODES = {
  valid: "K7M4QX",
  validSecond: "P8T2WN",
  alreadyRedeemed: "R3DM8P",
  expired: "X9EXP2",
  otherVenue: "S5KY7L",
} as const;

export function createSeedState(now = Date.now()): GoSipState {
  const rand = lcg(20261105);
  const members = SAMPLE_MEMBERS.map((m) =>
    m.id === DEMO_MEMBER_ID
      ? { ...m, startDate: new Date(now - 6 * DAY).toISOString(), expiryDate: new Date(now + 24 * DAY).toISOString() }
      : m,
  );
  const redemptions: Redemption[] = [];
  const venuesForHistory = ["downtown-social", "sky-lounge", "bay-room", "jumeirah-terrace", "bluewaters-deck", "gilded-room"];
  const cats: DrinkCategoryId[] = ["cocktails", "spirits", "soft", "bottleBeers"];
  const used = new Set<string>(Object.values(SAMPLE_CODES));
  // Demo member history over the last 6 days (today left free so 2 drinks are available).
  for (let d = 6; d >= 1; d--) {
    const count = d % 3 === 0 ? 1 : 2;
    for (let i = 0; i < count; i++) {
      const at = now - d * DAY - (3 + i * 2) * 3_600_000;
      const venueId = venuesForHistory[Math.floor(rand() * venuesForHistory.length)];
      const categoryId = cats[Math.floor(rand() * cats.length)];
      const code = generateUniqueCode(used, rand);
      used.add(code);
      redemptions.push({ id: `seed-${code}`, code, memberId: DEMO_MEMBER_ID, venueId, categoryId, createdAt: at - 120_000, expiresAt: at + 13 * 60_000, status: "redeemed", redeemedAt: at, day: dayKey(at), sample: true });
    }
  }
  // Other members' activity (admin + staff statistics).
  const others = members.filter((m) => m.id !== DEMO_MEMBER_ID && m.status === "active");
  for (let d = 10; d >= 0; d--) {
    const n = 3 + Math.floor(rand() * 5);
    for (let i = 0; i < n; i++) {
      const at = now - d * DAY - Math.floor(rand() * 10) * 3_600_000 - 600_000;
      const m = others[Math.floor(rand() * others.length)];
      const venueId = SAMPLE_VENUES.filter((v) => v.active)[Math.floor(rand() * 12)].id;
      const code = generateUniqueCode(used, rand);
      used.add(code);
      redemptions.push({ id: `seed-${code}`, code, memberId: m.id, venueId, categoryId: cats[Math.floor(rand() * cats.length)], createdAt: at - 120_000, expiresAt: at + 13 * 60_000, status: "redeemed", redeemedAt: at, day: dayKey(at), sample: true });
    }
  }
  // Documented sample codes for the staff verification demo.
  const mk = (code: string, memberId: string, venueId: string, categoryId: DrinkCategoryId, createdAt: number, expiresAt: number, status: Redemption["status"], redeemedAt?: number): Redemption => ({
    id: `sample-${code}`, code, memberId, venueId, categoryId, createdAt, expiresAt, status, redeemedAt, day: dayKey(createdAt), sample: true,
  });
  redemptions.push(
    // Valid demo codes stay valid for 30 days so the demo works any time (real codes last 15 minutes).
    mk(SAMPLE_CODES.valid, "GS-UAE-204502", "downtown-social", "cocktails", now - 60_000, now + 30 * DAY, "pending"),
    mk(SAMPLE_CODES.validSecond, "GS-UAE-204644", "downtown-social", "spirits", now - 60_000, now + 30 * DAY, "pending"),
    mk(SAMPLE_CODES.alreadyRedeemed, "GS-UAE-204611", "downtown-social", "soft", now - DAY, now - DAY + 15 * 60_000, "redeemed", now - DAY + 5 * 60_000),
    mk(SAMPLE_CODES.expired, "GS-UAE-204701", "downtown-social", "spirits", now - 2 * 3_600_000, now - 2 * 3_600_000 + 15 * 60_000, "pending"),
    mk(SAMPLE_CODES.otherVenue, "GS-UAE-204733", "sky-lounge", "wines", now - 60_000, now + 30 * DAY, "pending"),
  );
  return {
    version: STATE_VERSION,
    session: null,
    members,
    venues: SAMPLE_VENUES,
    plans: PLANS,
    redemptions,
    payments: [],
    savedVenueIds: ["sky-lounge", "palm-lounge"],
    pendingPlanId: null,
    settings: {
      language: "en",
      countryId: DEFAULT_COUNTRY,
      cityId: DEFAULT_CITY,
      notifications: true,
      security: { faceId: false, fingerprint: true, appLock: false, singleDevice: true, loginAlerts: true },
    },
    staffVenueId: null,
    adminSignedIn: false,
    seededAt: now,
  };
}

// ─── Reducer ─────────────────────────────────────────────────────────────────
type Action =
  | { type: "HYDRATE"; state: GoSipState }
  | { type: "SIGN_IN_DEMO" }
  | { type: "SIGN_UP"; name: string; email: string; id: string }
  | { type: "GUEST" }
  | { type: "SIGN_OUT" }
  | { type: "SET_PENDING_PLAN"; planId: PlanId | null }
  | { type: "PAYMENT"; payment: DemoPayment; now: number }
  | { type: "ISSUE_CODE"; record: Redemption }
  | { type: "CANCEL_CODE"; id: string }
  | { type: "CONFIRM_REDEMPTION"; id: string; now: number }
  | { type: "TOGGLE_SAVED"; venueId: string }
  | { type: "SET_LANGUAGE"; lang: Lang }
  | { type: "SET_LOCATION"; countryId: CountryId; cityId: string }
  | { type: "SET_SECURITY"; patch: Partial<SecurityPrefs> }
  | { type: "SET_NOTIFICATIONS"; on: boolean }
  | { type: "STAFF_LOGIN"; venueId: string }
  | { type: "STAFF_LOGOUT" }
  | { type: "ADMIN_LOGIN" }
  | { type: "ADMIN_LOGOUT" }
  | { type: "UPSERT_VENUE"; venue: Venue }
  | { type: "TOGGLE_VENUE_ACTIVE"; id: string }
  | { type: "UPDATE_PLAN"; id: PlanId; patch: Partial<MembershipPlan> }
  | { type: "RESET" };

function reducer(state: GoSipState, a: Action): GoSipState {
  switch (a.type) {
    case "HYDRATE":
      return a.state;
    case "SIGN_IN_DEMO":
      return { ...state, session: { memberId: DEMO_MEMBER_ID, mode: "member" } };
    case "SIGN_UP": {
      const member: Member = {
        id: a.id, name: a.name, email: a.email, phone: "", countryId: state.settings.countryId,
        planId: null, startDate: null, expiryDate: null, status: "pending",
        joined: new Date().toISOString().slice(0, 10), avatarInitials: initials(a.name) || "GS",
      };
      return { ...state, members: [...state.members, member], session: { memberId: a.id, mode: "member" } };
    }
    case "GUEST":
      return { ...state, session: { memberId: null, mode: "guest" } };
    case "SIGN_OUT":
      return { ...state, session: null, pendingPlanId: null };
    case "SET_PENDING_PLAN":
      return { ...state, pendingPlanId: a.planId };
    case "PAYMENT": {
      const p = a.payment;
      const payments = [...state.payments, p];
      if (p.outcome !== "demo-confirmed") return { ...state, payments };
      const plan = state.plans.find((x) => x.id === p.planId)!;
      const members = state.members.map((m) =>
        m.id === p.memberId
          ? { ...m, planId: p.planId, status: "active" as const, startDate: new Date(a.now).toISOString(), expiryDate: new Date(a.now + plan.durationDays * DAY).toISOString() }
          : m,
      );
      return { ...state, payments, members, pendingPlanId: null };
    }
    case "ISSUE_CODE":
      return { ...state, redemptions: [...state.redemptions, a.record] };
    case "CANCEL_CODE":
      return { ...state, redemptions: state.redemptions.map((r) => (r.id === a.id && r.status === "pending" ? { ...r, status: "cancelled" } : r)) };
    case "CONFIRM_REDEMPTION":
      return {
        ...state,
        redemptions: state.redemptions.map((r) =>
          r.id === a.id && effectiveStatus(r, a.now) === "pending" ? { ...r, status: "redeemed", redeemedAt: a.now } : r,
        ),
      };
    case "TOGGLE_SAVED":
      return {
        ...state,
        savedVenueIds: state.savedVenueIds.includes(a.venueId)
          ? state.savedVenueIds.filter((x) => x !== a.venueId)
          : [...state.savedVenueIds, a.venueId],
      };
    case "SET_LANGUAGE":
      return { ...state, settings: { ...state.settings, language: a.lang } };
    case "SET_LOCATION":
      return { ...state, settings: { ...state.settings, countryId: a.countryId, cityId: a.cityId } };
    case "SET_SECURITY":
      return { ...state, settings: { ...state.settings, security: { ...state.settings.security, ...a.patch } } };
    case "SET_NOTIFICATIONS":
      return { ...state, settings: { ...state.settings, notifications: a.on } };
    case "STAFF_LOGIN":
      return { ...state, staffVenueId: a.venueId };
    case "STAFF_LOGOUT":
      return { ...state, staffVenueId: null };
    case "ADMIN_LOGIN":
      return { ...state, adminSignedIn: true };
    case "ADMIN_LOGOUT":
      return { ...state, adminSignedIn: false };
    case "UPSERT_VENUE": {
      const exists = state.venues.some((x) => x.id === a.venue.id);
      return { ...state, venues: exists ? state.venues.map((x) => (x.id === a.venue.id ? a.venue : x)) : [...state.venues, a.venue] };
    }
    case "TOGGLE_VENUE_ACTIVE":
      return { ...state, venues: state.venues.map((x) => (x.id === a.id ? { ...x, active: !x.active } : x)) };
    case "UPDATE_PLAN":
      return { ...state, plans: state.plans.map((p) => (p.id === a.id ? { ...p, ...a.patch } : p)) };
    case "RESET":
      return { ...createSeedState(), settings: { ...createSeedState().settings, language: state.settings.language } };
  }
}

// ─── Storage (web only; native keeps state in memory) ───────────────────────
function readStored(): GoSipState | null {
  if (Platform.OS !== "web") return null;
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GoSipState;
    return parsed?.version === STATE_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

function writeStored(state: GoSipState) {
  if (Platform.OS !== "web") return;
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable (private mode) — demo continues in memory */
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
export type IssueResult = { ok: true; record: Redemption } | { ok: false; reason: string };

function useStoreValue() {
  const [state, dispatch] = useReducer(reducer, undefined, () => createSeedState());
  const [hydrated, setHydrated] = useState(false);
  const lastSerialized = useRef<string>("");

  // Load persisted state after mount (keeps static web rendering consistent).
  useEffect(() => {
    const stored = readStored();
    if (stored) {
      lastSerialized.current = JSON.stringify(stored);
      dispatch({ type: "HYDRATE", state: stored });
    }
    setHydrated(true);
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const next = JSON.parse(e.newValue) as GoSipState;
        if (next?.version === STATE_VERSION) {
          lastSerialized.current = e.newValue;
          dispatch({ type: "HYDRATE", state: next });
        }
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const s = JSON.stringify(state);
    if (s === lastSerialized.current) return;
    lastSerialized.current = s;
    writeStored(state);
  }, [state, hydrated]);

  // Language direction on web.
  const lang = state.settings.language;
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const member = useMemo(
    () => (state.session?.memberId ? state.members.find((m) => m.id === state.session!.memberId) ?? null : null),
    [state.session, state.members],
  );
  const plan = member?.planId ? state.plans.find((p) => p.id === member.planId) ?? null : null;
  const country = getCountry(state.settings.countryId);

  const membershipActive = (now = Date.now()) =>
    !!member && !!plan && member.status === "active" && !!member.expiryDate && Date.parse(member.expiryDate) > now;

  const t = useCallback((key: StringKey) => translate(lang, key), [lang]);

  const issueCode = (venueId: string, categoryId: DrinkCategoryId): IssueResult => {
    const now = Date.now();
    if (!member) return { ok: false, reason: "Sign in to redeem drinks." };
    if (!plan || !membershipActive(now)) return { ok: false, reason: "An active membership is required." };
    const venue = state.venues.find((v) => v.id === venueId);
    if (!venue) return { ok: false, reason: "Venue not found." };
    if (!venue.active) return { ok: false, reason: "This venue is not accepting redemptions right now." };
    if (!plan.venueTiers.includes(venue.tier)) return { ok: false, reason: `Your ${plan.shortName} plan does not include ${venue.tier} venues.` };
    if (!plan.drinkCategories.includes(categoryId)) return { ok: false, reason: "Upgrade your plan to unlock this category." };
    if (!venue.drinkCategories.includes(categoryId)) return { ok: false, reason: "This venue does not serve that category." };
    const offset = getCountry(venue.countryId).utcOffset;
    const ent = entitlementFor(member.id, plan.drinksPerDay, state.redemptions, now, offset);
    if (ent.remaining <= 0) return { ok: false, reason: "You've used today's complimentary drinks. Your allowance resets at midnight." };
    const code = generateUniqueCode(new Set(state.redemptions.map((r) => r.code)));
    const record: Redemption = {
      id: `r-${now}-${code}`, code, memberId: member.id, venueId, categoryId,
      createdAt: now, expiresAt: now + REDEMPTION_RULES.codeValidityMinutes * 60_000,
      status: "pending", day: dayKey(now, offset),
    };
    dispatch({ type: "ISSUE_CODE", record });
    return { ok: true, record };
  };

  const verify = (input: string, venueId: string): VerifyResult => verifyCode(input, venueId, state.redemptions, Date.now());

  return {
    state,
    hydrated,
    dispatch,
    member,
    plan,
    country,
    lang,
    isRTL: lang === "ar",
    t,
    membershipActive,
    entitlement: (now = Date.now()) =>
      member && plan ? entitlementFor(member.id, plan.drinksPerDay, state.redemptions, now, country.utcOffset) : null,
    issueCode,
    verify,
    venueById: (id: string) => state.venues.find((v) => v.id === id),
    memberById: (id: string) => state.members.find((m) => m.id === id),
    categories: DRINK_CATEGORIES,
  };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function GoSipProvider({ children }: { children: React.ReactNode }) {
  const value = useStoreValue();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGoSip() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGoSip must be used inside <GoSipProvider>");
  return v;
}

/** Re-render on an interval (countdowns, "open now" badges). */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
