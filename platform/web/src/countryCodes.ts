/** Dialling codes for the client phone field. Bangladesh first (default), then the region, then the rest A–Z. */
export const COUNTRY_CODES: { code: string; dial: string; name: string; flag: string }[] = [
  { code: "BD", dial: "880", name: "Bangladesh", flag: "🇧🇩" },
  { code: "IN", dial: "91", name: "India", flag: "🇮🇳" },
  { code: "PK", dial: "92", name: "Pakistan", flag: "🇵🇰" },
  { code: "NP", dial: "977", name: "Nepal", flag: "🇳🇵" },
  { code: "LK", dial: "94", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "AE", dial: "971", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", dial: "966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "QA", dial: "974", name: "Qatar", flag: "🇶🇦" },
  { code: "KW", dial: "965", name: "Kuwait", flag: "🇰🇼" },
  { code: "OM", dial: "968", name: "Oman", flag: "🇴🇲" },
  { code: "BH", dial: "973", name: "Bahrain", flag: "🇧🇭" },
  { code: "MY", dial: "60", name: "Malaysia", flag: "🇲🇾" },
  { code: "SG", dial: "65", name: "Singapore", flag: "🇸🇬" },
  { code: "GB", dial: "44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "US", dial: "1", name: "United States / Canada", flag: "🇺🇸" },
  { code: "AU", dial: "61", name: "Australia", flag: "🇦🇺" },
  { code: "BT", dial: "975", name: "Bhutan", flag: "🇧🇹" },
  { code: "CN", dial: "86", name: "China", flag: "🇨🇳" },
  { code: "FR", dial: "33", name: "France", flag: "🇫🇷" },
  { code: "DE", dial: "49", name: "Germany", flag: "🇩🇪" },
  { code: "HK", dial: "852", name: "Hong Kong", flag: "🇭🇰" },
  { code: "ID", dial: "62", name: "Indonesia", flag: "🇮🇩" },
  { code: "IT", dial: "39", name: "Italy", flag: "🇮🇹" },
  { code: "JP", dial: "81", name: "Japan", flag: "🇯🇵" },
  { code: "JO", dial: "962", name: "Jordan", flag: "🇯🇴" },
  { code: "MV", dial: "960", name: "Maldives", flag: "🇲🇻" },
  { code: "MM", dial: "95", name: "Myanmar", flag: "🇲🇲" },
  { code: "NL", dial: "31", name: "Netherlands", flag: "🇳🇱" },
  { code: "NZ", dial: "64", name: "New Zealand", flag: "🇳🇿" },
  { code: "PH", dial: "63", name: "Philippines", flag: "🇵🇭" },
  { code: "KR", dial: "82", name: "South Korea", flag: "🇰🇷" },
  { code: "ES", dial: "34", name: "Spain", flag: "🇪🇸" },
  { code: "SE", dial: "46", name: "Sweden", flag: "🇸🇪" },
  { code: "TH", dial: "66", name: "Thailand", flag: "🇹🇭" },
  { code: "TR", dial: "90", name: "Türkiye", flag: "🇹🇷" },
];

/** "+880" and "01712-345678" → "+8801712345678" (the local trunk 0 is dropped). Empty when there's no number. */
export function toInternational(dial: string, local: string): string {
  const digits = local.replace(/\D/g, "");
  if (!digits) return "";
  const national = digits.startsWith(dial) && digits.length > dial.length + 6 ? digits.slice(dial.length) : digits.replace(/^0+/, "");
  return `+${dial}${national}`;
}
