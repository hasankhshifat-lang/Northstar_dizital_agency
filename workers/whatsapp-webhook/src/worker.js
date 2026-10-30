// WhatsApp Cloud API webhook for NorthStar Dizital.
// Verifies Meta's signature, saves inbound messages to D1 (binding: DB),
// marks opt-outs, and still forwards the sanitized payload to Hermes.

const OPT_OUT_PATTERN = /^\s*(stop|unsubscribe|opt[\s-]?out|not interested|no thanks|remove me|বন্ধ|না)\s*[.!]*\s*$/i;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname !== "/webhook/whatsapp") return new Response("Not found", { status: 404 });
    if (request.method === "GET") return handleVerification(url, env);
    if (request.method === "POST") return handleEvent(request, env, ctx);
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, POST" } });
  }
};

function handleVerification(url, env) {
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && env.WHATSAPP_VERIFY_TOKEN && timingSafeEqual(token, env.WHATSAPP_VERIFY_TOKEN)) {
    return new Response(challenge ?? "", { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return new Response("Verification failed", { status: 403 });
}

async function handleEvent(request, env, ctx) {
  const rawBody = await request.text();
  const signature = request.headers.get("X-Hub-Signature-256") || "";
  if (!await verifyMetaSignature(rawBody, signature, env.WHATSAPP_APP_SECRET)) return new Response("Invalid signature", { status: 401 });
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("OK", { status: 200 });
  }
  ctx.waitUntil(saveToInbox(payload, env));
  ctx.waitUntil(forwardToHermes(payload, env));
  return new Response("OK", { status: 200 });
}

async function verifyMetaSignature(rawBody, header, appSecret) {
  if (!appSecret || !header.startsWith("sha256=")) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(appSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return timingSafeEqual(header.slice(7), expected);
}

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Pulls the readable text out of text, template quick-reply and interactive button messages.
function extractInbound(message) {
  if (message.type === "text") return { text: message.text?.body ?? null, payload: null };
  if (message.type === "button") return { text: message.button?.text ?? null, payload: message.button?.payload ?? null };
  if (message.type === "interactive") {
    const reply = message.interactive?.button_reply ?? message.interactive?.list_reply;
    return { text: reply?.title ?? null, payload: reply?.id ?? null };
  }
  return { text: null, payload: null };
}

function isOptOut(text, payload) {
  return [text, payload].some((value) => typeof value === "string" && OPT_OUT_PATTERN.test(value));
}

async function saveToInbox(payload, env) {
  if (!env.DB) {
    console.error("D1 binding DB is not configured");
    return;
  }
  const statements = [];
  for (const entry of payload.entry ?? []) for (const change of entry.changes ?? []) {
    const value = change.value ?? {};
    const metadata = value.metadata ?? {};
    const names = Object.fromEntries((value.contacts ?? []).map((c) => [c.wa_id, c.profile?.name ?? null]));
    for (const message of value.messages ?? []) {
      const { text, payload: buttonPayload } = extractInbound(message);
      const optedOut = isOptOut(text, buttonPayload) ? 1 : 0;
      const name = names[message.from] ?? null;
      statements.push(env.DB.prepare(
        `INSERT OR IGNORE INTO inbox (message_id, from_number, to_phone_number_id, to_display_number, contact_name, type, text, button_payload, wa_timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(message.id, message.from, metadata.phone_number_id ?? null, metadata.display_phone_number ?? null, name, message.type, text, buttonPayload, Number(message.timestamp) || null));
      statements.push(env.DB.prepare(
        `INSERT INTO contacts (phone, name, sender_phone_number_id, status, opted_out, last_inbound_at, last_inbound_text)
         VALUES (?, ?, ?, CASE WHEN ? = 1 THEN 'opted_out' ELSE 'replied' END, ?, datetime('now'), ?)
         ON CONFLICT(phone) DO UPDATE SET
           name = COALESCE(contacts.name, excluded.name),
           status = CASE WHEN excluded.opted_out = 1 OR contacts.opted_out = 1 THEN 'opted_out' ELSE 'replied' END,
           opted_out = MAX(contacts.opted_out, excluded.opted_out),
           last_inbound_at = excluded.last_inbound_at,
           last_inbound_text = excluded.last_inbound_text,
           updated_at = datetime('now')`
      ).bind(message.from, name, metadata.phone_number_id ?? null, optedOut, optedOut, text));
    }
  }
  if (!statements.length) return;
  try {
    await env.DB.batch(statements);
  } catch (error) {
    console.error("Failed to save inbound messages to D1", error);
  }
}

function sanitize(payload) {
  const messages = [];
  for (const entry of payload.entry ?? []) for (const change of entry.changes ?? []) {
    const value = change.value ?? {};
    for (const message of value.messages ?? []) messages.push({ from: message.from, id: message.id, timestamp: message.timestamp, type: message.type, text: message.text?.body });
  }
  return { messages };
}

async function forwardToHermes(payload, env) {
  if (!env.HERMES_WEBHOOK_URL || !env.HERMES_WEBHOOK_SECRET) {
    console.error("Hermes webhook URL or secret is not configured");
    return;
  }
  const body = JSON.stringify(sanitize(payload));
  const signature = await signHermesBody(body, env.HERMES_WEBHOOK_SECRET);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(env.HERMES_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json", "X-Hermes-Signature-256": `sha256=${signature}`, "X-Hermes-Event": "messages" }, body });
      if (response.ok) return;
      console.error(`Hermes responded ${response.status} on attempt ${attempt}`);
    } catch (error) {
      console.error(`Hermes forward failed on attempt ${attempt}`, error);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }
  console.error("Giving up forwarding event to Hermes after 3 attempts");
}

async function signHermesBody(body, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
