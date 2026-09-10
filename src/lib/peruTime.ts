export const PERU_TIMEZONE = "America/Lima";
const PERU_UTC_OFFSET = "-05:00";

/**
 * Converts a datetime-local input value ("YYYY-MM-DDTHH:mm", no timezone)
 * into a Date, treating it as Peru local time (UTC-5, no DST) regardless
 * of the timezone the server process itself is running in.
 */
export function datetimeLocalToPeruDate(value: string): Date {
  const trimmed = String(value || "").trim();
  const withSeconds = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed) ? `${trimmed}:00` : trimmed;
  return new Date(`${withSeconds}${PERU_UTC_OFFSET}`);
}

/**
 * Formats a Date (or ISO string) as a "YYYY-MM-DDTHH:mm" value expressed in
 * Peru local time, suitable for pre-filling a <input type="datetime-local">
 * regardless of the viewer's own browser timezone.
 */
export function peruDateToDatetimeLocalValue(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PERU_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
