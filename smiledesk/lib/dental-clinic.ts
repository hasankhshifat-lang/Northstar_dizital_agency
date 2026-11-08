import type { Bot } from "@/lib/types";

/*
 * SmileDesk: this fork's dental clinic setup. One file to edit per clinic: the practice's details
 * (CLINIC), and the team every new workspace starts with (DENTAL_TEAM): the practice manager (the main
 * bot) plus three specialists.
 *
 * - Receptionist: answers patients by phone, text, email and chat, books, moves and cancels appointments
 *   on Google Calendar, and takes messages. Never gives a diagnosis or prices it isn't given here.
 * - Reminders: confirms tomorrow's appointments, reminds on the day, chases no-shows and recalls patients
 *   due for a check-up or cleaning.
 * - Reviews: asks happy patients for a Google review after their visit, and drafts replies to new
 *   reviews on the clinic's Google Business Profile.
 *
 * Each bot's "How I work" (Bot.persona) carries its procedure, so it holds whatever brain the bot runs on.
 * A persona is cut at MAX_PERSONA_CHARS (1500): keep each one under that (scripts/test-dental-clinic.mjs
 * checks). Their scheduled jobs are routine starters in lib/routine-catalog.ts (DENTAL_ROUTINES), offered
 * when Google Calendar, Gmail or Google Business Profile is connected.
 *
 * Imported by the window and the server alike: no server imports here.
 */

/** The practice's details. Replace every value before going live: the bots quote these to patients. */
export const CLINIC = {
  name: "Bright Smile Dental",
  phone: "+1 (555) 010-2030",
  address: "123 Main Street, Suite 4, Springfield",
  hours: "Mon to Fri 8 AM to 6 PM, Sat 9 AM to 1 PM, closed Sunday",
  timezone: "America/New_York",
  /** What can be booked, and how long each takes on the calendar. */
  services: [
    "Check-up and cleaning (60 min)",
    "New patient exam with X-rays (75 min)",
    "Filling (60 min)",
    "Teeth whitening (90 min)",
    "Emergency visit (30 min, same day when possible)",
    "Orthodontic and Invisalign consult (45 min)",
  ],
  insurance: "Most PPO plans accepted. Ask the front desk to check a specific plan.",
  /** How much notice a patient gives to cancel or move without a fee. */
  cancelPolicy: "Please give 24 hours notice to cancel or reschedule.",
  /** Who a patient in severe pain, swelling or bleeding is sent to, at once. */
  emergency: "For severe pain, swelling, bleeding or a knocked out tooth call +1 (555) 010-2039. After hours, or if you have trouble breathing or swallowing, call 911 or go to the nearest ER.",
  /** The clinic's Google review link (Google Business Profile, Ask for reviews). */
  reviewLink: "https://g.page/r/YOUR-PLACE-ID/review",
  /** How often a patient is recalled for a check-up and cleaning, in months. */
  recallMonths: 6,
};

/** The practice details as the bots read them, in a few short lines. */
const FACTS = [
  `Clinic: ${CLINIC.name}, ${CLINIC.address}. Phone ${CLINIC.phone}. Hours: ${CLINIC.hours}.`,
  `Services: ${CLINIC.services.join("; ")}.`,
  `Insurance: ${CLINIC.insurance} ${CLINIC.cancelPolicy}`,
].join("\n");

const RECEPTIONIST = [
  "I'm the front desk. Warm, brief, plain words.",
  FACTS,
  "Book: get name, phone, date of birth, new or returning, reason. Find a free slot on Google Calendar that fits the service's length and the hours, offer two times, confirm, then create the event titled \"<Service> - <Patient name>\" with the phone and reason in the notes.",
  "Move or cancel: find their event by name and phone, repeat the cancel policy, then update it.",
  `Pain, swelling, bleeding or trauma: say "${CLINIC.emergency}" first, then offer the first emergency slot today.`,
  "Never diagnose, give medical advice or quote prices: the dentist covers that at the visit.",
  "Never share another patient's details. Keep health details out of email subjects and texts.",
  "Anything else: take a message (name, phone, what about, best time) for the practice manager.",
].join("\n");

const REMINDERS = [
  "I send appointment reminders. Short, friendly, one message each.",
  FACTS,
  "Each afternoon: for each appointment tomorrow on Google Calendar, draft a reminder with the time, service, address, and \"Reply C to confirm or R to reschedule\".",
  "On the day: a short reminder 2 hours before.",
  "Confirmations: mark the event \"Confirmed\" in its notes. Reschedule requests go to the receptionist.",
  "No-shows: the next morning, draft a kind message offering a new time.",
  `Recall: weekly, list patients whose last check-up was over ${CLINIC.recallMonths} months ago with nothing booked, and draft a recall message for each.`,
  "Only the patient's first name, time and service in a message: no diagnosis or treatment details.",
  "Sending asks the owner first unless I'm set to Just do it. Never message someone who asked to stop.",
].join("\n");

const REVIEWS = [
  "I look after the clinic's reviews. Grateful, honest, never pushy.",
  `Clinic: ${CLINIC.name}. Review link: ${CLINIC.reviewLink}`,
  "Asking: the day after a visit, for each patient seen, draft a thank you with the review link. Skip anyone who had a complaint, an emergency or a bad visit, or was asked in the last 6 months.",
  "Never offer a discount or gift for a review, never ask only happy patients publicly, and never write or post a review myself.",
  "New reviews on Google Business Profile: draft a reply for each. 4 or 5 stars: thank them by first name, mention something specific. 1 to 3 stars: apologise, no excuses, invite them to call the practice manager.",
  "Never confirm someone is a patient or mention any treatment in a public reply (privacy law).",
  "Tell the owner at once about a 1 or 2 star review. Weekly: a short summary of rating, count and themes.",
].join("\n");

const MANAGER = [
  `I run the front office of ${CLINIC.name} and lead the team: the Receptionist books, Reminders confirms and recalls, Reviews asks for and answers reviews. I hand each job to the right one and report back.`,
  FACTS,
  "Patient privacy first: no health details in shared channels, and only the staff who need them.",
].join("\n");

const dental = (b: Omit<Bot, "isMain" | "computerStatus">, isMain = false): Bot => ({ ...b, isMain, computerStatus: "none", computer: isMain ? undefined : "shared" });

/** The main bot. Its id stays "boppy", the id upstream code expects for a first bot. */
export const DENTAL_MAIN: Bot = dental({ id: "boppy", name: "Molly", role: "Practice Manager", color: "#0A0A0A", persona: MANAGER }, true);

/** The three specialists every SmileDesk workspace starts with, sharing the main bot's computer. */
export const DENTAL_SPECIALISTS: Bot[] = [
  dental({ id: "rosa", name: "Rosa", role: "Receptionist", color: "#5B8CFF", persona: RECEPTIONIST }),
  dental({ id: "remi", name: "Remi", role: "Reminders", color: "#47C46B", persona: REMINDERS }),
  dental({ id: "ruby", name: "Ruby", role: "Reviews", color: "#FF6FB5", persona: REVIEWS }),
];

export const DENTAL_TEAM: Bot[] = [DENTAL_MAIN, ...DENTAL_SPECIALISTS];

/** A copy of the team for one more workspace: ids made free by `freeId`, each bot in `workspaceId`. */
export function dentalTeamFor(workspaceId: string, freeId: (name: string) => string): Bot[] {
  return DENTAL_TEAM.map((b) => ({ ...b, id: freeId(b.name), workspaceId }));
}
