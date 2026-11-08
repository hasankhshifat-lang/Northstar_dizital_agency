"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { moodOf, moodSignals, NO_SIGNALS, type MoodSignals } from "@/lib/bot-mood";
import { blinkPhase, CODER_MIN_SIZE, isMoving, mascotMarkup, type Mood } from "@/lib/mascot";
import type { AppState } from "@/lib/types";
import { useStateArrival } from "./state-arrival";
import { BrandMark } from "./brand-mark";
import { useWindowVisible } from "./window-visible";

/**
 * Plush-style bot mascots with headphones (lib/mascot.ts draws them). Every mascot in the app reads
 * what the bots are doing from one place (BotMoods, set at the top of the app) and picks its mood the
 * same way (lib/bot-mood.ts moodOf): a busy bot opens its eyes, an idle one vibes with them closed.
 * A coder's (BotMoods' coders) wears the coder's mark wherever it's big enough to read.
 */
export const BotMoods = createContext<MoodSignals>(NO_SIGNALS);

/**
 * BotMoods for everything inside, from the app's state and the call. A bot's blush wears off a few
 * seconds after the thanks with nothing new in the state to redraw it, so this draws again when it does.
 */
export function BotMoodsFrom({
  state,
  call,
  children,
}: {
  state: Pick<AppState, "sessions" | "chats" | "messages" | "liveMoods"> & Partial<Pick<AppState, "bots" | "account" | "shared" | "workspace" | "workspaces" | "appApprovals">>;
  call: { botId: string; speaking: boolean } | null;
  children: React.ReactNode;
}) {
  // The time the moods are read at: when this first draws, when each new state comes in (a thanks
  // just sent is fresh, one synced in an hour late isn't), and again once a blush wears off.
  const [clock, setClock] = useState(() => Date.now());
  const arrived = useStateArrival();
  const moods = moodSignals(state, call, Math.max(clock, arrived));
  const until = moods.shyUntil;
  useEffect(() => {
    if (!until) return;
    const t = setTimeout(() => setClock(Date.now()), Math.max(0, until - Date.now()) + 50);
    return () => clearTimeout(t);
  }, [until]);
  return <BotMoods.Provider value={moods}>{children}</BotMoods.Provider>;
}

/**
 * Whether the bot on the call is talking right now (CallBar's meter sets it as its voice starts and
 * stops). Kept out of the app's state, so a word starting or ending redraws only that bot's mascots,
 * not the whole window.
 */
export function talkingStore() {
  let talking = false;
  const listeners = new Set<() => void>();
  return {
    get: () => talking,
    set: (now: boolean) => {
      if (now === talking) return;
      talking = now;
      for (const l of listeners) l();
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}
export type TalkingStore = ReturnType<typeof talkingStore>;
export const CallTalking = createContext<TalkingStore>(talkingStore());

/** The smallest mascot (in px) that comes alive (Mascot's `life`): smaller, a blink is a flicker. */
export const LIFE_MIN_SIZE = 36;
/** The smallest that breathes: smaller, a breath is under a pixel and reads as a shimmer. */
export const BREATH_MIN_SIZE = 56;

export function Mascot({
  botId,
  color,
  size = 24,
  antenna = true,
  live = false,
  chatId,
  life = false,
  listening = false,
}: {
  botId: string;
  color: string;
  size?: number;
  /** The main bot's highlighter headphones; false draws them in ink (the chat pill's small mark). */
  antenna?: boolean;
  /**
   * Shows what the bot is doing as it does it (thinking, writing, coding, speaking, working, or shy), moving: the
   * mascots people watch (the sidebar's rows and main bot, the chat's header and typing line, the
   * call). Elsewhere a busy bot just opens its eyes.
   */
  live?: boolean;
  /** The chat this mascot stands for: it thinks over a reply there, and only works while it writes one elsewhere. */
  chatId?: string;
  /**
   * A live mascot people face (the chat's header, an empty chat, a bot's profile), at LIFE_MIN_SIZE and up: it
   * blinks, breathes while it vibes, and settles into each new pose (LivelyMascot). Never a list's rows: a column
   * of them moving at the edge of the eye is noise.
   */
  life?: boolean;
  /** The person is writing to this chat (or just sent it something): an idle bot opens its eyes and looks down at the box. */
  listening?: boolean;
}) {
  const signals = useContext(BotMoods);
  const talk = useContext(CallTalking);
  // Only the call's bot reads the store's change (the others' answer stays false, so they don't redraw).
  const onCall = signals.call?.botId === botId;
  const talkingNow = () => onCall && talk.get();
  const talking = useSyncExternalStore(talk.subscribe, talkingNow, talkingNow);
  const mood = moodOf(talking ? { ...signals, call: { botId, speaking: true } } : signals, botId, chatId);
  const pose: Mood = live && listening && mood === "idle" ? "listening" : mood;
  // The coder's mark, still and on top of any mood, only where it can be read.
  const coder = size >= CODER_MIN_SIZE && signals.coders.has(botId);
  if (live && life && size >= LIFE_MIN_SIZE) return <LivelyMascot botId={botId} color={color} size={size} antenna={antenna} mood={pose} coder={coder} />;
  if (live && isMoving(pose)) return <MovingMascot botId={botId} color={color} size={size} antenna={antenna} mood={pose} coder={coder} />;
  return <MascotSvg botId={botId} color={color} size={size} antenna={antenna} mood={pose === "idle" || pose === "listening" ? pose : "awake"} coder={coder} />;
}

/** A mascot in a mood that moves (app/globals.css, mascot-*): its motion rests while the window is hidden. */
function MovingMascot(props: { botId: string; color: string; size: number; antenna: boolean; mood: Mood; coder: boolean }) {
  const visible = useWindowVisible();
  return <MascotSvg {...props} paused={!visible} />;
}

/**
 * A mascot people face (Mascot's `life`): its pose's own motion, and on top, each its own class in
 * app/globals.css: it blinks now and then, each bot on its own beat (blinkPhase), while its eyes are open; it
 * breathes while it vibes, at BREATH_MIN_SIZE and up; and a new pose settles in with a small squash from its base
 * instead of popping (the first pose just shows). CSS on the page's one clock, no timers: it rests while the
 * window is hidden and holds its pose with reduced motion.
 */
function LivelyMascot(props: { botId: string; color: string; size: number; antenna: boolean; mood: Mood; coder: boolean }) {
  const visible = useWindowVisible();
  // Settling only for a change of pose: another bot in the same spot (the header, on switching chats) just shows.
  const [shown, setShown] = useState({ botId: props.botId, mood: props.mood, changed: false });
  if (shown.botId !== props.botId || shown.mood !== props.mood) setShown({ botId: props.botId, mood: props.mood, changed: shown.botId === props.botId });
  return <MascotSvg {...props} paused={!visible} life={{ breathe: props.mood === "idle" && props.size >= BREATH_MIN_SIZE, settle: shown.changed }} />;
}

function MascotSvg({
  botId,
  color,
  size,
  antenna,
  mood,
  coder,
  paused,
  life,
}: {
  botId: string;
  color: string;
  size: number;
  antenna: boolean;
  mood: Mood;
  coder: boolean;
  paused?: boolean;
  life?: { breathe: boolean; settle: boolean };
}) {
  const style: React.CSSProperties & { "--mascot-blink-at"?: string } = { width: size, height: size, flexShrink: 0 };
  if (life) style["--mascot-blink-at"] = blinkPhase(botId);
  // Markup comes from our own constant shapes and bot colors, never from user text.
  return (
    <svg
      viewBox="0 0 40 40"
      className={paused ? "mascot-paused" : undefined}
      style={style}
      dangerouslySetInnerHTML={{ __html: mascotMarkup(botId, color, { mood, accent: antenna, coder, ...(life ? { blink: true, ...life } : {}) }) }}
    />
  );
}

export function Spinner({ size = 13, color = "#0A0A0A" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 14 14" width={size} height={size} className="animate-spin" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="5.2" fill="none" stroke={color} strokeWidth="1.6" strokeDasharray="24 9" strokeLinecap="round" />
    </svg>
  );
}

/** ♪ and ♫, as on bops.bot (site/notes.js). */
/**
 * The app's first load: the Northstar mark, breathing gently, the same scene as the window's splash
 * (desktop/splash.html), so one hands over to the other without a jump. CSS only (globals.css).
 */
export function BoppyLoading({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3.5 text-[13px] text-pencil select-none">
      {/* SmileDesk: the Northstar mark, as on the window's splash (desktop/splash.html). */}
      <div className="boppy-loading-scene" aria-hidden="true">
        <BrandMark size={72} className="brand-loading-mark" />
      </div>
      <div>{label}</div>
      {/* Below the label without moving it: the scene stays where the splash had it. */}
      {children && (
        <div className="relative -mt-3.5 h-0 w-full">
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2">{children}</div>
        </div>
      )}
    </div>
  );
}
