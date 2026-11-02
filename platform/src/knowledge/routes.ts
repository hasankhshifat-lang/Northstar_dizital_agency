import { Hono, type Context } from "hono";
import { z } from "zod";
import type { AppEnv } from "../env";
import { schedulePush } from "../agent/push";
import { newId } from "../lib/crypto";
import { tenantDb } from "../lib/db";
import { ApiError } from "../lib/errors";
import { fieldError } from "../lib/fetch";
import { nowIso } from "../lib/time";
import { parseBody } from "../lib/validate";
import { MAX_SOURCE_CHARS, extractFromLink, extractPdf } from "./extract";

const MAX_SOURCES = 50;
const MAX_PDF_BYTES = 10 * 1024 * 1024;
const LIST_COLS = "id, kind, title, url, chars, pages, note, added_by, created_at, updated_at";

export interface KnowledgeScope {
  tenantId: (c: Context<AppEnv>) => Promise<string>;
  by: "client" | "agency";
  /** Called after any change, e.g. to write the audit log. */
  onChange?: (c: Context<AppEnv>, tenantId: string, action: string, details: Record<string, unknown>) => Promise<void>;
}

/** Training sources (links, PDFs, text) for one tenant. Mounted for clients (own tenant) and for the agency (any client). */
export function knowledgeRoutes(scope: KnowledgeScope) {
  const r = new Hono<AppEnv>();
  const changed = async (c: Context<AppEnv>, t: string, action: string, details: Record<string, unknown>) => {
    await schedulePush(c.env.DB, t);
    await scope.onChange?.(c, t, action, details);
  };
  const ensureRoom = async (c: Context<AppEnv>, t: string) => {
    const n = await tenantDb(c.env.DB, t).first<{ n: number }>("SELECT count(*) AS n FROM knowledge_sources WHERE tenant_id=?1");
    if ((n?.n ?? 0) >= MAX_SOURCES) throw fieldError("url", `At most ${MAX_SOURCES} training sources. Delete one first.`);
  };
  const load = (c: Context<AppEnv>, t: string, id: string) => tenantDb(c.env.DB, t).first<any>(`SELECT ${LIST_COLS} FROM knowledge_sources WHERE tenant_id=?1 AND id=?2`, id);

  r.get("/", async (c) => {
    const t = await scope.tenantId(c);
    return c.json({ sources: await tenantDb(c.env.DB, t).all(`SELECT ${LIST_COLS} FROM knowledge_sources WHERE tenant_id=?1 ORDER BY created_at DESC`) });
  });

  r.post("/link", async (c) => {
    const t = await scope.tenantId(c);
    const body = await parseBody(c, z.object({ url: z.string().trim().min(3).max(500), follow_links: z.boolean().default(true) }));
    await ensureRoom(c, t);
    const x = await extractFromLink(body.url, body.follow_links);
    const now = nowIso();
    const id = newId();
    await tenantDb(c.env.DB, t).insert("knowledge_sources", {
      id, kind: x.kind, title: x.title, url: x.url, content: x.content, chars: x.content.length, pages: x.pages, note: x.note, added_by: scope.by, created_at: now, updated_at: now,
    });
    await changed(c, t, "knowledge.add", { kind: x.kind, url: x.url });
    return c.json({ source: await load(c, t, id) });
  });

  r.post("/text", async (c) => {
    const t = await scope.tenantId(c);
    const body = await parseBody(c, z.object({ title: z.string().trim().min(1).max(200), content: z.string().trim().min(1).max(MAX_SOURCE_CHARS) }));
    await ensureRoom(c, t);
    const now = nowIso();
    const id = newId();
    await tenantDb(c.env.DB, t).insert("knowledge_sources", { id, kind: "text", title: body.title, content: body.content, chars: body.content.length, pages: 0, added_by: scope.by, created_at: now, updated_at: now });
    await changed(c, t, "knowledge.add", { kind: "text", title: body.title });
    return c.json({ source: await load(c, t, id) });
  });

  r.post("/pdf", async (c) => {
    const t = await scope.tenantId(c);
    const form = await c.req.formData().catch(() => null);
    const file = form?.get("file");
    if (!file || typeof file === "string") throw fieldError("file", "Choose a PDF file");
    if (file.size > MAX_PDF_BYTES) throw fieldError("file", "PDF must be 10 MB or smaller");
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") throw fieldError("file", "Only PDF files can be uploaded here");
    await ensureRoom(c, t);
    const x = await extractPdf(bytes.slice());
    const id = newId();
    const key = `tenants/${t}/knowledge/${id}.pdf`;
    await c.env.MEDIA.put(key, bytes, { httpMetadata: { contentType: "application/pdf" } });
    const now = nowIso();
    const title = (file.name || "Document.pdf").slice(0, 200);
    await tenantDb(c.env.DB, t).insert("knowledge_sources", { id, kind: "pdf", title, r2_key: key, content: x.content, chars: x.content.length, pages: x.pages, note: x.note, added_by: scope.by, created_at: now, updated_at: now });
    await changed(c, t, "knowledge.add", { kind: "pdf", title });
    return c.json({ source: await load(c, t, id) });
  });

  r.get("/:id", async (c) => {
    const t = await scope.tenantId(c);
    const row = await tenantDb(c.env.DB, t).first<any>(`SELECT ${LIST_COLS}, content FROM knowledge_sources WHERE tenant_id=?1 AND id=?2`, c.req.param("id"));
    if (!row) throw new ApiError(404, "NOT_FOUND");
    return c.json({ source: row });
  });

  r.get("/:id/file", async (c) => {
    const t = await scope.tenantId(c);
    const row = await tenantDb(c.env.DB, t).first<{ r2_key: string | null; title: string }>("SELECT r2_key, title FROM knowledge_sources WHERE tenant_id=?1 AND id=?2", c.req.param("id"));
    const obj = row?.r2_key ? await c.env.MEDIA.get(row.r2_key) : null;
    if (!obj) throw new ApiError(404, "NOT_FOUND");
    return new Response(obj.body, { headers: { "content-type": "application/pdf", "content-disposition": `inline; filename="${row!.title.replace(/[^\w.\- ]/g, "_")}"` } });
  });

  /** Re-read a link (the website may have changed). */
  r.post("/:id/refresh", async (c) => {
    const t = await scope.tenantId(c);
    const tdb = tenantDb(c.env.DB, t);
    const row = await tdb.first<{ id: string; kind: string; url: string | null; pages: number }>("SELECT id, kind, url, pages FROM knowledge_sources WHERE tenant_id=?1 AND id=?2", c.req.param("id"));
    if (!row) throw new ApiError(404, "NOT_FOUND");
    if (!row.url) throw fieldError("url", "Only links can be refreshed");
    const x = await extractFromLink(row.url, row.kind === "website" && row.pages > 1);
    await tdb.update("knowledge_sources", row.id, { title: x.title, content: x.content, chars: x.content.length, pages: x.pages, note: x.note, updated_at: nowIso() });
    await changed(c, t, "knowledge.refresh", { url: row.url });
    return c.json({ source: await load(c, t, row.id) });
  });

  r.delete("/:id", async (c) => {
    const t = await scope.tenantId(c);
    const tdb = tenantDb(c.env.DB, t);
    const row = await tdb.first<{ id: string; r2_key: string | null; title: string }>("SELECT id, r2_key, title FROM knowledge_sources WHERE tenant_id=?1 AND id=?2", c.req.param("id"));
    if (!row) throw new ApiError(404, "NOT_FOUND");
    if (row.r2_key) await c.env.MEDIA.delete(row.r2_key);
    await tdb.del("knowledge_sources", row.id);
    await changed(c, t, "knowledge.delete", { title: row.title });
    return c.json({ ok: true });
  });

  return r;
}
