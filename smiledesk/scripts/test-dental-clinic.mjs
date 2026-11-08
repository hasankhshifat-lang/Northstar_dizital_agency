// Tests for SmileDesk's dental clinic setup (lib/dental-clinic.ts) and its starters (lib/routine-catalog.ts
// DENTAL_ROUTINES): one main bot and three specialists with distinct ids and names, every How I work under
// MAX_PERSONA_CHARS (a longer one is cut off), the procedures each bot must keep (emergencies, no diagnosis,
// privacy, no paid reviews), dentalTeamFor's copies, and starters with unique ids, a schedule that's one of
// their suggested times, and nothing that sends without asking.
//
// Pure: nothing is written, started or called.
// Usage: node --conditions=react-server scripts/test-dental-clinic.mjs
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/")) specifier = pathToFileURL(`${root}/${specifier.slice(2)}`).href;
    try {
      return next(specifier, context);
    } catch (e) {
      if (/^(\.{1,2}\/|\/|file:)/.test(specifier))
        for (const ext of [".ts", ".tsx"])
          try {
            return next(specifier + ext, context);
          } catch {}
      throw e;
    }
  },
});

const D = await import(`${root}/lib/dental-clinic.ts`);
const C = await import(`${root}/lib/routine-catalog.ts`);
const { MAX_PERSONA_CHARS } = await import(`${root}/lib/types.ts`);

let passed = 0;
let failures = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
  } catch (e) {
    failures++;
    console.error(`FAIL ${name}\n  ${e.message.split("\n").join("\n  ")}`);
  }
}
const byRole = (role) => D.DENTAL_TEAM.find((b) => b.role === role);

check("the team: one main bot first, then the receptionist, reminders and reviews bots", () => {
  assert.deepEqual(D.DENTAL_TEAM.map((b) => b.role), ["Practice Manager", "Receptionist", "Reminders", "Reviews"]);
  assert.deepEqual(D.DENTAL_TEAM.map((b) => b.isMain), [true, false, false, false]);
  assert.equal(new Set(D.DENTAL_TEAM.map((b) => b.id)).size, 4);
  assert.equal(new Set(D.DENTAL_TEAM.map((b) => b.name.toLowerCase())).size, 4);
  assert.equal(D.DENTAL_MAIN.id, "boppy", "the id upstream code expects for a first bot");
  for (const b of D.DENTAL_TEAM) assert.equal(b.computerStatus, "none");
  for (const b of D.DENTAL_SPECIALISTS) assert.equal(b.computer, "shared", `${b.name} shares the main bot's computer`);
});

check("every How I work fits, and none is cut off", () => {
  for (const b of D.DENTAL_TEAM) {
    assert.ok(b.persona?.trim(), `${b.name} has one`);
    assert.ok(b.persona.length <= MAX_PERSONA_CHARS, `${b.name}'s is ${b.persona.length} characters, over ${MAX_PERSONA_CHARS}`);
  }
});

check("the receptionist sends emergencies on, never diagnoses, and keeps patients private", () => {
  const p = byRole("Receptionist").persona;
  assert.ok(p.includes(D.CLINIC.emergency));
  assert.match(p, /Never diagnose/);
  assert.match(p, /Never share another patient's details/);
  assert.match(p, /Google Calendar/);
  for (const s of D.CLINIC.services) assert.ok(p.includes(s), `knows ${s}`);
});

check("the reminders bot keeps health details out and respects opt outs", () => {
  const p = byRole("Reminders").persona;
  assert.match(p, /no diagnosis or treatment details/);
  assert.match(p, /asked to stop/);
  assert.ok(p.includes(`${D.CLINIC.recallMonths} months`));
});

check("the reviews bot never pays for reviews and never confirms a patient in public", () => {
  const p = byRole("Reviews").persona;
  assert.ok(p.includes(D.CLINIC.reviewLink));
  assert.match(p, /Never offer a discount or gift/);
  assert.match(p, /Never confirm someone is a patient/);
});

check("dentalTeamFor: a copy per workspace, with free ids", () => {
  const taken = new Set(["boppy", "rosa"]);
  const free = (name) => {
    let id = name.toLowerCase();
    for (let n = 2; taken.has(id); n++) id = `${name.toLowerCase()}-${n}`;
    taken.add(id);
    return id;
  };
  const team = D.dentalTeamFor("ws_2", free);
  assert.deepEqual(team.map((b) => b.id), ["molly", "rosa-2", "remi", "ruby"]);
  assert.ok(team.every((b) => b.workspaceId === "ws_2"));
  assert.equal(team[0].isMain, true);
  assert.equal(D.DENTAL_TEAM[0].workspaceId, undefined, "the template itself is untouched");
});

const dentalStarters = C.ROUTINE_TEMPLATES.filter((t) => t.id.startsWith("dental-"));

check("dental starters: unique ids, known apps, a schedule among their suggested times", () => {
  assert.equal(dentalStarters.length, 8);
  assert.equal(new Set(C.ROUTINE_TEMPLATES.map((t) => t.id)).size, C.ROUTINE_TEMPLATES.length);
  for (const t of dentalStarters) {
    assert.ok(C.appNameFor(t.app), `${t.id}: ${t.app} has a name`);
    assert.ok(t.suggested.some((s) => JSON.stringify(s.schedule) === JSON.stringify(t.schedule)), `${t.id}: its schedule is one of its suggested`);
    assert.ok(t.neverWithoutAsking.length, `${t.id} says what it never does without asking`);
    assert.match(t.goal, /draft_reply|Answer with/, `${t.id} drafts or reports, never sends`);
  }
  assert.deepEqual(C.templatesFor("google_business_profile").map((t) => t.id), ["dental-review-replies", "dental-review-summary"]);
});

check("patient messages carry no health details, and review asks offer nothing in return", () => {
  for (const id of ["dental-appointment-reminders", "dental-same-day-reminders", "dental-no-shows", "dental-recall", "dental-review-requests"])
    assert.match(C.templateById(id).goal, /no diagnosis, treatment/, id);
  assert.match(C.templateById("dental-review-requests").goal, /Never offer a discount, gift/);
  assert.match(C.templateById("dental-review-replies").goal, /never confirm the person is a patient/);
});

console.log(`dental clinic: ${passed} passed, ${failures} failed`);
if (failures) process.exit(1);
