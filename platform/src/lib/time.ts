export const nowIso = (d: Date = new Date()) => d.toISOString();
export const addMinutes = (iso: string | Date, m: number) => new Date(new Date(iso).getTime() + m * 60_000).toISOString();
export const addHours = (iso: string | Date, h: number) => addMinutes(iso, h * 60);
/** Month key in Asia/Dhaka (UTC+6, no DST). */
export const monthKey = (d: Date = new Date()) => new Date(d.getTime() + 6 * 3600_000).toISOString().slice(0, 7);
/** Day key in Asia/Dhaka. */
export const dayKey = (iso: string) => new Date(new Date(iso).getTime() + 6 * 3600_000).toISOString().slice(0, 10);
