// Display formatting. Keep free of runtime imports (tested with `node --test`).

const rupiahNumber = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

/** Rp90.000, -Rp10.000 (UX_SPEC §47). */
export function formatRupiah(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}Rp${rupiahNumber.format(Math.abs(Math.round(value)))}`;
}

/** +Rp5.000 / -Rp10.000 / Rp0 — sign is explicit so meaning never relies on color. */
export function formatSignedRupiah(value: number): string {
  if (value > 0) return `+${formatRupiah(value)}`;
  return formatRupiah(value);
}

/** Digits only, grouped with dots while typing: "90000" → "90.000". */
export function formatMoneyInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** "90.000" → 90000. Empty or invalid input → null. */
export function parseMoneyInput(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const value = Number(digits);
  return Number.isSafeInteger(value) ? value : null;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "2026-09-12" (DATE) or timestamp → "12 Sep 2026". Timestamps use Indonesia time. */
export function formatDate(value: string): string {
  const isTimestamp = /[T ]\d{2}:\d{2}/.test(value);
  const datePart = isTimestamp ? todayISODate(new Date(value)) : value.slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return value;
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** Relative wording for a number of elapsed days. */
export function formatDaysAgo(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`;
  const years = Math.floor(days / 365);
  return years <= 1 ? "1 year ago" : `${years} years ago`;
}

/** Today's calendar date in Indonesia, as YYYY-MM-DD. */
export function todayISODate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function pluralize(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}
