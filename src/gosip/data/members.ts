/** SAMPLE MEMBER RECORDS — fictional people for demonstration only. */
import type { PlanId } from "../config/plans";
import type { CountryId } from "./locations";

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryId: CountryId;
  planId: PlanId | null;
  /** ISO date strings. */
  startDate: string | null;
  expiryDate: string | null;
  status: "active" | "expired" | "pending";
  joined: string;
  avatarInitials: string;
}

/** The demo account used by "Sign in" and "Explore the demo". */
export const DEMO_MEMBER_ID = "GS-UAE-204817";

export const SAMPLE_MEMBERS: Member[] = [
  { id: DEMO_MEMBER_ID, name: "Layla Haddad", email: "layla@gosip.demo", phone: "+971 50 000 1234", countryId: "uae", planId: "basic", startDate: null, expiryDate: null, status: "active", joined: "2026-09-14", avatarInitials: "LH" },
  { id: "GS-UAE-204502", name: "Omar Rahman", email: "omar@sample.demo", phone: "+971 55 000 2201", countryId: "uae", planId: "premium", startDate: "2026-10-20", expiryDate: "2026-11-19", status: "active", joined: "2026-06-02", avatarInitials: "OR" },
  { id: "GS-UAE-204611", name: "Sophie Laurent", email: "sophie@sample.demo", phone: "+971 52 000 3302", countryId: "uae", planId: "tourist", startDate: "2026-11-02", expiryDate: "2026-11-09", status: "active", joined: "2026-11-02", avatarInitials: "SL" },
  { id: "GS-UAE-204644", name: "Arjun Mehta", email: "arjun@sample.demo", phone: "+971 56 000 4403", countryId: "uae", planId: "basic", startDate: "2026-10-28", expiryDate: "2026-11-27", status: "active", joined: "2026-08-19", avatarInitials: "AM" },
  { id: "GS-UAE-204390", name: "Hannah Becker", email: "hannah@sample.demo", phone: "+971 50 000 5504", countryId: "uae", planId: "premium", startDate: "2026-09-01", expiryDate: "2026-10-01", status: "expired", joined: "2026-05-11", avatarInitials: "HB" },
  { id: "GS-UAE-204701", name: "Khalid Al Mansoori", email: "khalid@sample.demo", phone: "+971 54 000 6605", countryId: "uae", planId: "premium", startDate: "2026-10-25", expiryDate: "2026-11-24", status: "active", joined: "2026-03-30", avatarInitials: "KM" },
  { id: "GS-UAE-204733", name: "Maria Santos", email: "maria@sample.demo", phone: "+971 58 000 7706", countryId: "uae", planId: "basic", startDate: "2026-11-01", expiryDate: "2026-12-01", status: "active", joined: "2026-11-01", avatarInitials: "MS" },
  { id: "GS-UAE-204760", name: "James O'Connor", email: "james@sample.demo", phone: "+971 50 000 8807", countryId: "uae", planId: "tourist", startDate: "2026-10-10", expiryDate: "2026-10-17", status: "expired", joined: "2026-10-10", avatarInitials: "JO" },
  { id: "GS-UAE-204788", name: "Noura Saeed", email: "noura@sample.demo", phone: "+971 55 000 9908", countryId: "uae", planId: null, startDate: null, expiryDate: null, status: "pending", joined: "2026-11-04", avatarInitials: "NS" },
];

/** Demo credentials shown on the login screens. */
export const DEMO_CREDENTIALS = {
  member: { email: "layla@gosip.demo", password: "gosip-demo" },
  admin: { email: "admin@gosip.demo", password: "admin-demo" },
} as const;
