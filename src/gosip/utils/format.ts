import { COUNTRIES, type CountryId } from "../data/locations";

const HOUR = 3_600_000;
export const DAY = 24 * HOUR;

/** YYYY-MM-DD for the given instant in a fixed-offset timezone (default Asia/Dubai). */
export function dayKey(ts: number, utcOffset = 4): string {
  return new Date(ts + utcOffset * HOUR).toISOString().slice(0, 10);
}

/** Milliseconds until local midnight in the given offset. */
export function msUntilMidnight(ts: number, utcOffset = 4): number {
  const local = ts + utcOffset * HOUR;
  const next = Math.floor(local / DAY) * DAY + DAY;
  return next - local;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** e.g. "12 Sep 2026" in the given offset. */
export function formatDate(ts: number | string, utcOffset = 4): string {
  const t = typeof ts === "string" ? Date.parse(ts) : ts;
  const d = new Date(t + utcOffset * HOUR);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** e.g. "20:45" in the given offset. */
export function formatTime(ts: number, utcOffset = 4): string {
  const d = new Date(ts + utcOffset * HOUR);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

export function formatDateTime(ts: number, utcOffset = 4) {
  return `${formatDate(ts, utcOffset)} · ${formatTime(ts, utcOffset)}`;
}

/** mm:ss countdown. */
export function formatCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function formatHoursLeft(ms: number) {
  const h = Math.floor(ms / HOUR);
  const m = Math.floor((ms % HOUR) / 60000);
  return `${h}h ${m}m`;
}

/**
 * Format money with the country's currency code and decimals.
 * AED 195 · QAR 195 · KWD 16.000
 */
export function formatMoney(amount: number, currency: "AED" | "QAR" | "KWD" = "AED") {
  const country = COUNTRIES.find((c) => c.currency === currency);
  const decimals = country?.currencyDecimals ?? 0;
  const fixed = amount.toFixed(decimals);
  const [int, frac] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${currency} ${frac ? `${grouped}.${frac}` : grouped}`;
}

export function countryOffset(id: CountryId) {
  return COUNTRIES.find((c) => c.id === id)?.utcOffset ?? 4;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** "K7M4QX" → "K7M-4QX" */
export function prettyCode(code: string) {
  return code.length === 6 ? `${code.slice(0, 3)}-${code.slice(3)}` : code;
}

export function normalizeCode(input: string) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}
