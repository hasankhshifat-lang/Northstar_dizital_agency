import type { Channel } from "../env";
import { ApiError } from "../lib/errors";
import { newId } from "../lib/crypto";
import { addMinutes, nowIso } from "../lib/time";
import type {
  AgentConfig, ChatEngine, Conversation, ConversationDetail, ConversationFilter, ConversationPage, Handler, Message,
  OutboundMessage, TestChatMessage, UsageCounts,
} from "./types";

export const FALLBACK_REPLY = "দুঃখিত, এটা আমি জানি না — একজন মানুষ শীঘ্রই উত্তর দেবেন।";

interface WsRow {
  ref: string;
  tenant_id: string;
  paused: number;
  ai_enabled: number;
  channels: string;
  config: string;
  fail_mode: string;
  ai_replies: number;
}

const SEED: { channel: Channel; name: string; msgs: [("customer" | "ai"), string][]; handler?: Handler; unread?: number }[] = [
  { channel: "messenger", name: "তানভীর আহমেদ", unread: 1, msgs: [["customer", "ভাই, ইন্ডিগো ডেনিম জ্যাকেটটা L সাইজে আছে?"], ["ai", "জি ভাইয়া, L সাইজ স্টকে আছে। দাম ৳২,২৫০।"], ["customer", "ঠিকানা দিলে কবে পাবো?"]] },
  { channel: "instagram", name: "সাদিয়া ইসলাম", unread: 2, handler: "human", msgs: [["customer", "আপু দুইটা নিলে একটু কম রাখা যাবে?"], ["customer", "বিকাশে অগ্রিম দিলে ছাড় আছে?"]] },
  { channel: "whatsapp", name: "রাকিব হাসান", msgs: [["customer", "আমার পার্সেলটা কই?"], ["ai", "আপনার অর্ডার #1004 কুরিয়ারে দেওয়া হয়েছে, ট্র্যাকিং: STD-88231।"]] },
  { channel: "website", name: "শাকিল মাহমুদ", msgs: [["customer", "৪২ সাইজের পাঞ্জাবির বুকের মাপ কত?"], ["ai", "৪২ সাইজে বুকের মাপ ৪৪ ইঞ্চি।"]] },
  { channel: "messenger", name: "নুসরাত জাহান", unread: 1, msgs: [["customer", "মাস্টার্ড কিডস ড্রেসটার দাম কত?"]] },
  { channel: "whatsapp", name: "ফারহানা আক্তার", msgs: [["customer", "ক্যাশ অন ডেলিভারিতে আগে খুলে দেখা যাবে?"], ["ai", "জি আপু, ডেলিভারিম্যানের সামনে খুলে দেখে নিতে পারবেন।"]] },
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/[\p{P}\p{S}]/gu, " ").replace(/\s+/g, " ").trim();
}

function describe(m: OutboundMessage): { kind: Message["kind"]; text: string; payload: unknown; by: Message["by"] } {
  if (m.kind === "text") return { kind: "text", text: m.text, payload: null, by: m.by === "ai" ? "ai" : "human" };
  if (m.kind === "product") return { kind: "product", text: m.product.name, payload: m.product, by: "human" };
  return { kind: "receipt", text: `অর্ডার #${m.order.number}`, payload: m.order, by: "human" };
}

/** In-database stand-in for a real chat engine. Behaves like a remote service: it can be paused or forced "down". */
export class DemoEngine implements ChatEngine {
  constructor(private db: D1Database) {}

  private async ws(ref: string, opts: { allowPaused?: boolean } = {}): Promise<WsRow> {
    const w = await this.db.prepare("SELECT * FROM demo_workspaces WHERE ref=?").bind(ref).first<WsRow>();
    if (!w) throw new ApiError(503, "ENGINE_UNAVAILABLE", { detail: "unknown workspace" });
    if (w.fail_mode === "down") throw new ApiError(503, "ENGINE_UNAVAILABLE", { detail: "engine down" });
    if (w.paused && !opts.allowPaused) throw new ApiError(503, "ENGINE_UNAVAILABLE", { detail: "workspace paused" });
    return w;
  }

  async createWorkspace(tenant: { id: string; business_name: string }) {
    const ref = "demo_" + newId();
    const now = new Date();
    const stmts: D1PreparedStatement[] = [
      this.db.prepare("INSERT INTO demo_workspaces (ref,tenant_id,created_at) VALUES (?,?,?)").bind(ref, tenant.id, nowIso(now)),
    ];
    SEED.forEach((conv, ci) => {
      const cid = newId();
      const base = addMinutes(now, -(ci + 1) * 37);
      stmts.push(this.db.prepare("INSERT INTO demo_conversations (id,workspace_ref,channel,customer_name,customer_ref,handler,unread,last_at) VALUES (?,?,?,?,?,?,?,?)")
        .bind(cid, ref, conv.channel, conv.name, `${conv.channel}:${ref.slice(-6)}:${ci}`, conv.handler ?? "ai", conv.unread ?? 0, addMinutes(base, conv.msgs.length)));
      conv.msgs.forEach(([by, text], mi) => {
        stmts.push(this.db.prepare("INSERT INTO demo_messages (id,conversation_id,direction,kind,text,by_who,at) VALUES (?,?,?,?,?,?,?)")
          .bind(newId(), cid, by === "customer" ? "in" : "out", "text", text, by, addMinutes(base, mi)));
      });
    });
    await this.db.batch(stmts);
    return { workspaceRef: ref };
  }

  async pauseWorkspace(ref: string) {
    await this.ws(ref, { allowPaused: true });
    await this.db.prepare("UPDATE demo_workspaces SET paused=1 WHERE ref=?").bind(ref).run();
  }

  async resumeWorkspace(ref: string) {
    await this.ws(ref, { allowPaused: true });
    await this.db.prepare("UPDATE demo_workspaces SET paused=0 WHERE ref=?").bind(ref).run();
  }

  async setChannelEnabled(ref: string, channel: Channel, enabled: boolean) {
    const w = await this.ws(ref, { allowPaused: true });
    const ch = JSON.parse(w.channels);
    ch[channel] = enabled;
    await this.db.prepare("UPDATE demo_workspaces SET channels=? WHERE ref=?").bind(JSON.stringify(ch), ref).run();
  }

  async setAiEnabled(ref: string, enabled: boolean) {
    await this.ws(ref, { allowPaused: true });
    await this.db.prepare("UPDATE demo_workspaces SET ai_enabled=? WHERE ref=?").bind(enabled ? 1 : 0, ref).run();
  }

  async pushAgentConfig(ref: string, config: AgentConfig) {
    await this.ws(ref, { allowPaused: true });
    await this.db.prepare("UPDATE demo_workspaces SET config=?, config_pushes=config_pushes+1 WHERE ref=?").bind(JSON.stringify(config), ref).run();
  }

  async listConversations(ref: string, filter: ConversationFilter): Promise<ConversationPage> {
    await this.ws(ref, { allowPaused: true });
    const rows = (await this.db.prepare(
      `SELECT c.*, (SELECT text FROM demo_messages m WHERE m.conversation_id=c.id ORDER BY at DESC LIMIT 1) AS last_text
       FROM demo_conversations c WHERE workspace_ref=? ORDER BY last_at DESC`,
    ).bind(ref).all<any>()).results;
    const items = rows
      .filter((r) => !filter.channels || filter.channels.includes(r.channel))
      .filter((r) => !filter.handler || r.handler === filter.handler)
      .map(toConversation);
    return { items };
  }

  async getConversation(ref: string, id: string): Promise<ConversationDetail> {
    await this.ws(ref, { allowPaused: true });
    const row = await this.db.prepare(
      `SELECT c.*, (SELECT text FROM demo_messages m WHERE m.conversation_id=c.id ORDER BY at DESC LIMIT 1) AS last_text
       FROM demo_conversations c WHERE workspace_ref=? AND id=?`,
    ).bind(ref, id).first<any>();
    if (!row) throw new ApiError(404, "NOT_FOUND");
    const msgs = (await this.db.prepare("SELECT * FROM demo_messages WHERE conversation_id=? ORDER BY at, rowid").bind(id).all<any>()).results;
    await this.db.prepare("UPDATE demo_conversations SET unread=0 WHERE id=?").bind(id).run();
    return {
      ...toConversation(row),
      messages: msgs.map((m) => ({
        id: m.id, direction: m.direction, kind: m.kind, text: m.text ?? undefined, url: m.url ?? undefined,
        payload: m.payload ? JSON.parse(m.payload) : undefined, at: m.at, by: m.by_who,
      })),
    };
  }

  async sendMessage(ref: string, conversationId: string, message: OutboundMessage) {
    const w = await this.ws(ref);
    const conv = await this.db.prepare("SELECT id, channel FROM demo_conversations WHERE workspace_ref=? AND id=?").bind(ref, conversationId).first<{ id: string; channel: Channel }>();
    if (!conv) throw new ApiError(404, "NOT_FOUND");
    if (JSON.parse(w.channels)[conv.channel] === false) throw new ApiError(503, "ENGINE_UNAVAILABLE", { detail: "channel disabled" });
    const d = describe(message);
    const at = nowIso();
    await this.db.batch([
      this.db.prepare("INSERT INTO demo_messages (id,conversation_id,direction,kind,text,payload,by_who,at) VALUES (?,?,?,?,?,?,?,?)")
        .bind(newId(), conversationId, "out", d.kind, d.text, d.payload ? JSON.stringify(d.payload) : null, d.by, at),
      this.db.prepare("UPDATE demo_conversations SET last_at=? WHERE id=?").bind(at, conversationId),
    ]);
  }

  async setHandler(ref: string, conversationId: string, handler: Handler) {
    await this.ws(ref, { allowPaused: true });
    const r = await this.db.prepare("UPDATE demo_conversations SET handler=? WHERE workspace_ref=? AND id=?").bind(handler, ref, conversationId).run();
    if (!r.meta.changes) throw new ApiError(404, "NOT_FOUND");
  }

  async getUsage(ref: string, _month: string): Promise<UsageCounts> {
    const w = await this.ws(ref, { allowPaused: true });
    const n = await this.db.prepare("SELECT COUNT(*) AS n FROM demo_conversations WHERE workspace_ref=?").bind(ref).first<{ n: number }>();
    return { ai_replies: w.ai_replies, conversations: n?.n ?? 0 };
  }

  async testChat(ref: string, messages: TestChatMessage[]): Promise<string> {
    const w = await this.ws(ref);
    const last = [...messages].reverse().find((m) => m.role === "user");
    if (!last) return FALLBACK_REPLY;
    const cfg = JSON.parse(w.config) as Partial<AgentConfig>;
    const q = normalize(last.text);
    const qWords = new Set(q.split(" ").filter(Boolean));
    let best: { score: number; answer: string } | null = null;
    for (const f of cfg.faqs ?? []) {
      const fq = normalize(f.question);
      if (!fq) continue;
      if (q.includes(fq) || fq.includes(q)) return f.answer;
      const fWords = fq.split(" ").filter(Boolean);
      const overlap = fWords.filter((x) => qWords.has(x)).length / fWords.length;
      if (overlap >= 0.6 && (!best || overlap > best.score)) best = { score: overlap, answer: f.answer };
    }
    if (best) return best.answer;
    for (const p of cfg.catalog ?? []) {
      if (q.includes(normalize(p.name)) || q.includes(p.code.toLowerCase())) {
        const price = (p.sale_price ?? p.price) / 100;
        return `${p.name} — দাম ৳${price.toLocaleString("en-IN")}`;
      }
    }
    return FALLBACK_REPLY;
  }

  /** Demo-only helper: simulate a customer message arriving (used by demo webhook & tests). */
  async simulateInbound(ref: string, conversationId: string, text: string) {
    const at = nowIso();
    await this.db.batch([
      this.db.prepare("INSERT INTO demo_messages (id,conversation_id,direction,kind,text,by_who,at) VALUES (?,?,?,?,?,?,?)").bind(newId(), conversationId, "in", "text", text, "customer", at),
      this.db.prepare("UPDATE demo_conversations SET last_at=?, unread=unread+1 WHERE id=? AND workspace_ref=?").bind(at, conversationId, ref),
    ]);
  }
}

function toConversation(r: any): Conversation {
  return {
    id: r.id, channel: r.channel, customerName: r.customer_name, customerRef: r.customer_ref,
    lastMessage: r.last_text ?? "", lastAt: r.last_at, unread: r.unread, handler: r.handler,
  };
}
