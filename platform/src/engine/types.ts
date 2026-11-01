import type { Channel } from "../env";

export type Handler = "ai" | "human";

export interface Conversation {
  id: string;
  channel: Channel;
  customerName: string;
  customerRef: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
  handler: Handler;
  /** Engine-side state when the engine supports it; platform merges its own conversation_state otherwise. */
  state?: "open" | "later" | "done";
}

export interface Message {
  id: string;
  direction: "in" | "out";
  kind: "text" | "image" | "voice" | "product" | "receipt";
  text?: string;
  url?: string;
  payload?: unknown;
  at: string;
  by: "customer" | "ai" | "human";
}

export interface ConversationPage {
  items: Conversation[];
  nextCursor?: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface ConversationFilter {
  channels?: Channel[];
  handler?: Handler;
  cursor?: string;
}

export type OutboundMessage =
  | { kind: "text"; text: string; by?: "human" | "ai" | "system" }
  | { kind: "product"; product: { code: string; name: string; price: number; sale_price?: number | null; image_url?: string | null; url?: string } }
  | { kind: "receipt"; order: { number: number; total: number; status: string; items: { name: string; qty: number; unit_price: number }[]; tracking?: string | null; courier?: string | null } };

export interface AgentConfig {
  profile: Record<string, unknown>;
  tone: Record<string, unknown>;
  rules: Record<string, unknown>;
  faqs: { question: string; answer: string }[];
  catalog: { code: string; name: string; price: number; sale_price: number | null; variants: { label: string; stock: number }[] }[];
}

export interface UsageCounts {
  ai_replies: number;
  conversations: number;
}

export interface TestChatMessage {
  role: "user" | "assistant";
  text: string;
}

export interface ChatEngine {
  createWorkspace(tenant: { id: string; business_name: string }): Promise<{ workspaceRef: string }>;
  pauseWorkspace(ref: string): Promise<void>;
  resumeWorkspace(ref: string): Promise<void>;
  setChannelEnabled(ref: string, channel: Channel, enabled: boolean): Promise<void>;
  setAiEnabled(ref: string, enabled: boolean): Promise<void>;
  pushAgentConfig(ref: string, config: AgentConfig): Promise<void>;
  listConversations(ref: string, filter: ConversationFilter): Promise<ConversationPage>;
  getConversation(ref: string, id: string): Promise<ConversationDetail>;
  sendMessage(ref: string, conversationId: string, message: OutboundMessage): Promise<void>;
  setHandler(ref: string, conversationId: string, handler: Handler): Promise<void>;
  getUsage(ref: string, month: string): Promise<UsageCounts>;
  testChat(ref: string, messages: TestChatMessage[]): Promise<string>;
}
