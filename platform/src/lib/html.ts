export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

export const taka = (poisha: number | null | undefined) =>
  poisha == null ? "" : "৳" + (poisha / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const page = (title: string, body: string, extraHead = "") => `<!doctype html>
<html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>${extraHead}
<style>
body{font-family:"Hind Siliguri",system-ui,sans-serif;margin:0;background:#f8fafc;color:#0f172a}
.wrap{max-width:720px;margin:0 auto;padding:24px}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px}
.price{font-size:28px;font-weight:700}.old{text-decoration:line-through;color:#94a3b8;margin-left:8px;font-size:18px}
.btn{display:inline-block;background:#2952d9;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600}
img.hero{width:100%;border-radius:12px;object-fit:cover;max-height:480px}
.thumbs{display:flex;gap:8px;margin-top:8px}.thumbs img{width:72px;height:72px;object-fit:cover;border-radius:8px}
table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #e2e8f0;text-align:left}
.muted{color:#64748b}.right{text-align:right}
@media print{body{background:#fff}.noprint{display:none}.card{border:none}}
</style></head><body><div class="wrap">${body}</div></body></html>`;
