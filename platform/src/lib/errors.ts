import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export type ErrorCode =
  | "ACCOUNT_SUSPENDED" | "FEATURE_DISABLED" | "OUT_OF_STOCK" | "OUTSIDE_24H" | "VALIDATION"
  | "ENGINE_UNAVAILABLE" | "NOT_FOUND" | "UNAUTHORIZED" | "FORBIDDEN" | "RATE_LIMITED" | "INTERNAL";

export const MESSAGES: Record<ErrorCode, { bn: string; en: string }> = {
  ACCOUNT_SUSPENDED: { bn: "অ্যাকাউন্ট সাময়িকভাবে বন্ধ — Northstar-এর সাথে যোগাযোগ করুন।", en: "Account paused — please contact Northstar." },
  FEATURE_DISABLED: { bn: "এই ফিচারটি আপনার অ্যাকাউন্টে চালু নেই।", en: "This feature is not enabled for your account." },
  OUT_OF_STOCK: { bn: "স্টকে যথেষ্ট পণ্য নেই।", en: "Not enough stock." },
  OUTSIDE_24H: { bn: "গ্রাহকের শেষ মেসেজের ২৪ ঘণ্টা পার হয়ে গেছে।", en: "More than 24 hours since the customer's last message." },
  VALIDATION: { bn: "তথ্যগুলো ঠিক নেই, আবার দেখুন।", en: "Some information is invalid. Please check and try again." },
  ENGINE_UNAVAILABLE: { bn: "চ্যাট সার্ভিসে সংযোগ হচ্ছে না, একটু পরে আবার চেষ্টা করুন।", en: "Couldn't reach the chat service. Please try again shortly." },
  NOT_FOUND: { bn: "খুঁজে পাওয়া যায়নি।", en: "Not found." },
  UNAUTHORIZED: { bn: "লগইন করুন বা তথ্য ভুল।", en: "Please log in, or the details are incorrect." },
  FORBIDDEN: { bn: "এই কাজের অনুমতি নেই।", en: "You don't have permission to do this." },
  RATE_LIMITED: { bn: "অনেকবার চেষ্টা হয়েছে, ১৫ মিনিট পরে আবার চেষ্টা করুন।", en: "Too many attempts. Try again in 15 minutes." },
  INTERNAL: { bn: "কিছু একটা সমস্যা হয়েছে।", en: "Something went wrong." },
};

export class ApiError extends Error {
  constructor(public status: number, public code: ErrorCode, public extra: Record<string, unknown> = {}) {
    super(code);
  }
}

export function errorBody(code: ErrorCode, extra: Record<string, unknown> = {}) {
  return { code, message_bn: MESSAGES[code].bn, message_en: MESSAGES[code].en, ...extra };
}

export function errorHandler(err: Error, c: Context) {
  if (err instanceof ApiError) return c.json(errorBody(err.code, err.extra), err.status as ContentfulStatusCode);
  console.error(err);
  return c.json(errorBody("INTERNAL"), 500);
}
