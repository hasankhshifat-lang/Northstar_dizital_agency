import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv } from "../env";
import { clientGroup } from "../auth/middleware";
import { tenantDb } from "../lib/db";
import { ApiError } from "../lib/errors";
import { parseBody } from "../lib/validate";
import { ensureDefaultRules, RULE_TYPES, type RuleRow } from "./rules";

export const followupRoutes = new Hono<AppEnv>();
followupRoutes.use("*", ...clientGroup("followups"));

const view = (r: RuleRow) => ({ ...r, enabled: !!r.enabled });

followupRoutes.get("/rules", async (c) => {
  await ensureDefaultRules(c.env.DB, c.var.tenant.id);
  const rows = await tenantDb(c.env.DB, c.var.tenant.id).all<RuleRow>("SELECT id, type, enabled, delay_minutes, message_template, offer_text, whatsapp_template_name FROM followup_rules WHERE tenant_id=?1");
  rows.sort((a, b) => RULE_TYPES.indexOf(a.type) - RULE_TYPES.indexOf(b.type));
  return c.json({ rules: rows.map(view) });
});

followupRoutes.put("/rules/:id", async (c) => {
  const body = await parseBody(c, z.object({
    enabled: z.boolean(),
    delay_minutes: z.number().int().min(5).max(60 * 24 * 365),
    message_template: z.string().trim().min(1).max(1000),
    offer_text: z.string().trim().max(300).nullish(),
    whatsapp_template_name: z.string().trim().max(120).nullish(),
  }));
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  if (!(await tdb.update("followup_rules", c.req.param("id"), { ...body, offer_text: body.offer_text || null, whatsapp_template_name: body.whatsapp_template_name || null }))) throw new ApiError(404, "NOT_FOUND");
  return c.json({ rule: view((await tdb.get<RuleRow>("followup_rules", c.req.param("id")))!) });
});
