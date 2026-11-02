import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api, taka, toPoisha } from "../../api";
import { useT } from "../../i18n";
import { useSession } from "../../auth/session";
import { Link2 } from "lucide-react";
import { Badge, Button, Card, ErrorText, Field, Input, Modal, PageHeader, Select, Table, Textarea, useApi } from "../../ui";

export interface Variant { id?: string; label: string; stock: number }
export interface Product {
  id: string; code: string; name_bn: string | null; name_en: string | null; category: string | null; description: string | null;
  price: number; sale_price: number | null; status: "active" | "hidden"; variants: Required<Variant>[]; images: { id: string; url: string }[];
}
export const pname = (p: { name_bn: string | null; name_en: string | null; code: string }) => p.name_bn || p.name_en || p.code;

export function ProductsPage() {
  const { t } = useT();
  const [q, setQ] = useState("");
  const { data, error, reload } = useApi<{ products: Product[] }>(`/api/products?q=${encodeURIComponent(q)}`);
  const [importOpen, setImportOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  return (
    <>
      <PageHeader title={t("products")} actions={<div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={() => setLinkOpen(true)}><Link2 size={15} className="mr-1 inline" />{t("import_link")}</Button>
        <Button variant="secondary" onClick={() => setImportOpen(true)}>{t("import_csv")}</Button>
        <a href="/api/reports/products.csv"><Button variant="secondary">{t("download_csv")}</Button></a>
        <Link to="/app/products/new"><Button>+ {t("new_product")}</Button></Link>
      </div>} />
      <Card>
        <Input placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-xs" />
        <ErrorText error={error} />
        <Table empty={data?.products.length === 0} head={["", t("code"), t("name"), t("category"), t("price"), t("stock"), t("status")]}>
          {data?.products.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50">
              <td className="px-3 py-2">{p.images[0] ? <img src={p.images[0].url} className="h-10 w-10 rounded object-cover" alt="" /> : <div className="h-10 w-10 rounded bg-slate-100" />}</td>
              <td className="px-3 py-2 font-mono text-xs">{p.code}</td>
              <td className="px-3 py-2"><Link to={`/app/products/${p.id}`} className="font-medium text-brand-700 hover:underline">{pname(p)}</Link></td>
              <td className="px-3 py-2">{p.category ?? "—"}</td>
              <td className="px-3 py-2">{p.sale_price != null ? <><b>{taka(p.sale_price)}</b> <s className="text-slate-400">{taka(p.price)}</s></> : taka(p.price)}</td>
              <td className="px-3 py-2">{p.variants.map((v) => <span key={v.id} className={"mr-1 inline-block rounded border px-1.5 text-xs " + (v.stock ? "border-slate-300" : "border-red-200 text-red-600")}>{v.label === "Default" ? "" : v.label + ": "}{v.stock}</span>)}</td>
              <td className="px-3 py-2"><Badge tone={p.status === "active" ? "green" : "slate"}>{t(p.status === "active" ? "visible" : "hidden")}</Badge></td>
            </tr>
          ))}
        </Table>
      </Card>
      <ImportModal open={importOpen} onClose={() => { setImportOpen(false); reload(); }} />
      {linkOpen && <ImportLinkModal onClose={(changed) => { setLinkOpen(false); if (changed) reload(); }} />}
    </>
  );
}

interface Found {
  name: string; description: string | null; category: string | null; price: number; sale_price: number | null; sku: string | null;
  images: string[]; url: string | null; variants: { label: string; in_stock: boolean | null }[];
}

/** Find products at a link (or in a catalog file), pick which to keep, and import them in batches of 10. */
function ImportLinkModal({ onClose }: { onClose: (changed: boolean) => void }) {
  const { t } = useT();
  const [url, setUrl] = useState("");
  const [found, setFound] = useState<Found[] | null>(null);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [stock, setStock] = useState("10");
  const [status, setStatus] = useState("active");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<{ imported: number; skipped: { name: string; reason: string }[] } | null>(null);
  const [error, setError] = useState<unknown>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const preview = async (init: { json?: unknown; body?: BodyInit }) => {
    setBusy(true); setError(null); setFound(null); setResult(null);
    try {
      const r = await api<{ products: Found[] }>("/api/products/import-link/preview", init);
      setFound(r.products);
      setPicked(new Set(r.products.map((_, i) => i)));
    } catch (e) { setError(e); } finally { setBusy(false); }
  };
  const save = async () => {
    if (!found) return;
    const chosen = found.filter((_, i) => picked.has(i));
    setBusy(true); setError(null);
    const total = { imported: 0, skipped: [] as { name: string; reason: string }[] };
    try {
      for (let i = 0; i < chosen.length; i += 10) {
        setProgress({ done: i, total: chosen.length });
        const r = await api<{ imported: unknown[]; skipped: { name: string; reason: string }[] }>("/api/products/import-link/save", {
          json: { products: chosen.slice(i, i + 10).map(({ url: _u, ...p }) => p), stock: Math.max(0, Number(stock) || 0), status },
        });
        total.imported += r.imported.length;
        total.skipped.push(...r.skipped);
      }
      setResult(total);
      setFound(null);
    } catch (e) { setError(e); } finally { setBusy(false); setProgress(null); }
  };
  const toggle = (i: number) => { const n = new Set(picked); if (n.has(i)) n.delete(i); else n.add(i); setPicked(n); };

  return (
    <Modal open title={t("import_link")} onClose={() => onClose(!!result?.imported)}>
      {!found && !result && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">{t("import_link_help")}</p>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (url.trim()) preview({ json: { url } }); }}>
            <Input aria-label={t("product_link")} placeholder="https://yourshop.com/collections/all" value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" name="import_url" />
            <Button type="submit" disabled={busy || !url.trim()} className="shrink-0">{busy ? t("finding") : t("find_products")}</Button>
          </form>
          <p className="rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-800">{t("import_fb_help")}</p>
          <div>
            <p className="mb-1 text-sm font-medium text-slate-700">{t("or_upload_catalog")}</p>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,.xml,text/csv,text/xml,application/xml" hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) { const fd = new FormData(); fd.append("file", f); preview({ body: fd }); } e.target.value = ""; }} />
            <Button variant="secondary" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>{t("upload")}</Button>
          </div>
        </div>
      )}
      {found && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-emerald-700">{t("found_n", { n: found.length })}</p>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={picked.size === found.length} onChange={(e) => setPicked(new Set(e.target.checked ? found.map((_, i) => i) : []))} />{t("select_all")}</label>
          </div>
          <ul className="max-h-[45vh] divide-y divide-slate-100 overflow-y-auto rounded-xl ring-1 ring-slate-200">
            {found.map((p, i) => (
              <li key={i}>
                <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-slate-50">
                  <input type="checkbox" checked={picked.has(i)} onChange={() => toggle(i)} />
                  {p.images[0] ? <img src={p.images[0]} alt="" className="h-10 w-10 shrink-0 rounded object-cover" referrerPolicy="no-referrer" loading="lazy" /> : <div className="h-10 w-10 shrink-0 rounded bg-slate-100" />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{p.name}</span>
                    <span className="block truncate text-xs text-slate-500">{[p.sku, p.category, p.variants.length ? t("n_options", { n: p.variants.length }) : null].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span className="shrink-0 text-sm">{p.sale_price != null ? <><b>{taka(p.sale_price)}</b> <s className="text-slate-400">{taka(p.price)}</s></> : taka(p.price)}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("stock_each")}><Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} /></Field>
            <Field label={t("import_as")}><Select value={status} onChange={(e) => setStatus(e.target.value)}><option value="active">{t("visible")}</option><option value="hidden">{t("hidden")}</option></Select></Field>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button disabled={busy || picked.size === 0} onClick={save}>{progress ? t("importing_progress", progress) : t("import_n", { n: picked.size })}</Button>
            <Button variant="ghost" disabled={busy} onClick={() => setFound(null)}>{t("back")}</Button>
          </div>
        </div>
      )}
      {result && (
        <div className="space-y-3">
          <p className="font-medium text-emerald-700">{t("import_done", { n: result.imported })}</p>
          {result.skipped.length > 0 && (
            <>
              <p className="text-sm text-slate-600">{t("skipped_n", { n: result.skipped.length })}</p>
              <Table head={[t("name"), t("error")]}>
                {result.skipped.map((s, i) => <tr key={i}><td className="px-3 py-1">{s.name}</td><td className="px-3 py-1 text-amber-700">{s.reason}</td></tr>)}
              </Table>
            </>
          )}
          <Button onClick={() => onClose(true)}>{t("close")}</Button>
        </div>
      )}
      <div className="mt-3"><ErrorText error={error} /></div>
    </Modal>
  );
}

function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT();
  const [result, setResult] = useState<{ imported: number; errors: { line: number; message: string }[] } | null>(null);
  const [error, setError] = useState<unknown>(null);
  const upload = async (file: File) => {
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    try { setResult(await api("/api/products/import", { body: fd })); } catch (e) { setError(e); }
  };
  return (
    <Modal open={open} title={t("import_csv")} onClose={() => { setResult(null); onClose(); }}>
      <p className="mb-3 text-sm text-slate-600">{t("import_help")}</p>
      <input type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      <ErrorText error={error} />
      {result && (
        <div className="mt-4 space-y-2">
          <p className="font-medium text-emerald-700">{t("imported_n", { n: result.imported })}</p>
          {result.errors.length > 0 && (
            <Table head={[t("line"), t("error")]}>
              {result.errors.map((e, i) => <tr key={i}><td className="px-3 py-1">{e.line}</td><td className="px-3 py-1 text-red-700">{e.message}</td></tr>)}
            </Table>
          )}
        </div>
      )}
    </Modal>
  );
}

export function ProductFormPage() {
  const { t } = useT();
  const { id } = useParams();
  const isNew = !id || id === "new";
  const nav = useNavigate();
  const { me } = useSession();
  const [p, setP] = useState<Product | null>(null);
  const [f, setF] = useState({ code: "", name_bn: "", name_en: "", category: "", description: "", price: "", sale_price: "", status: "active" });
  const [variants, setVariants] = useState<Variant[]>([{ label: "Default", stock: 0 }]);
  const [error, setError] = useState<unknown>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = (prod: Product) => {
    setP(prod);
    setF({ code: prod.code, name_bn: prod.name_bn ?? "", name_en: prod.name_en ?? "", category: prod.category ?? "", description: prod.description ?? "",
      price: String(prod.price / 100), sale_price: prod.sale_price == null ? "" : String(prod.sale_price / 100), status: prod.status });
    setVariants(prod.variants);
  };
  useEffect(() => { if (!isNew) api<{ product: Product }>(`/api/products/${id}`).then((r) => load(r.product), setError); }, [id]);

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const body = {
      code: f.code, name_bn: f.name_bn || null, name_en: f.name_en || null, category: f.category || null, description: f.description || null,
      price: toPoisha(f.price), sale_price: f.sale_price === "" ? null : toPoisha(f.sale_price), status: f.status,
      variants: variants.map((v) => ({ ...(v.id ? { id: v.id } : {}), label: v.label, stock: Number(v.stock) })),
    };
    try {
      const r = await api<{ product: Product }>(isNew ? "/api/products" : `/api/products/${id}`, { method: isNew ? "POST" : "PATCH", json: body });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      if (isNew) nav(`/app/products/${r.product.id}`, { replace: true }); else load(r.product);
    } catch (err) { setError(err); }
  };
  const uploadImage = async (file: File) => {
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    try { load((await api<{ product: Product }>(`/api/products/${id}/images`, { body: fd })).product); } catch (e) { setError(e); }
  };
  const removeImage = async (imgId: string) => load((await api<{ product: Product }>(`/api/products/${id}/images/${imgId}`, { method: "DELETE" })).product);
  const del = async () => {
    if (!confirm(t("delete_confirm_product"))) return;
    await api(`/api/products/${id}`, { method: "DELETE" });
    nav("/app/products");
  };

  return (
    <>
      <PageHeader title={isNew ? t("new_product") : t("edit_product")} actions={!isNew && p && me?.tenant && (
        <a href={`/p/${me.tenant.slug}/${encodeURIComponent(p.code)}`} target="_blank" rel="noreferrer"><Button variant="secondary">{t("public_page")} ↗</Button></a>
      )} />
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("code")}><Input required value={f.code} onChange={set("code")} name="code" placeholder="KD9101" /></Field>
            <Field label={t("category")}><Input value={f.category} onChange={set("category")} /></Field>
            <Field label={t("name_bn")}><Input value={f.name_bn} onChange={set("name_bn")} name="name_bn" /></Field>
            <Field label={t("name_en")}><Input value={f.name_en} onChange={set("name_en")} name="name_en" /></Field>
            <Field label={t("price")}><Input required type="number" min="0" step="0.01" value={f.price} onChange={set("price")} name="price" /></Field>
            <Field label={t("sale_price")}><Input type="number" min="0" step="0.01" value={f.sale_price} onChange={set("sale_price")} /></Field>
            <div className="sm:col-span-2"><Field label={t("description")}><Textarea value={f.description} onChange={set("description")} /></Field></div>
            <Field label={t("status")} hint={t("hidden_hint")}>
              <Select value={f.status} onChange={set("status")}><option value="active">{t("visible")}</option><option value="hidden">{t("hidden")}</option></Select>
            </Field>
          </div>
          <h3 className="mt-6 mb-2 font-medium">{t("variants")}</h3>
          <div className="space-y-2">
            {variants.map((v, i) => (
              <div key={v.id ?? i} className="flex gap-2">
                <Input aria-label={t("variant")} value={v.label} onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <Input aria-label={t("stock")} type="number" min="0" className="max-w-28" value={v.stock} onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, stock: Number(e.target.value) } : x)))} />
                <Button type="button" variant="ghost" disabled={variants.length === 1} onClick={() => setVariants(variants.filter((_, j) => j !== i))}>✕</Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={() => setVariants([...variants, { label: "", stock: 0 }])}>{t("add_variant")}</Button>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Button type="submit">{t("save")}</Button>
            {saved && <span className="text-sm text-emerald-700">{t("saved")}</span>}
            {!isNew && <Button type="button" variant="ghost" className="ml-auto text-red-600" onClick={del}>{t("delete")}</Button>}
          </div>
          <div className="mt-3"><ErrorText error={error} /></div>
        </Card>
        <Card title={t("photos")}>
          {isNew ? <p className="text-sm text-slate-500">{t("save_first_photos")}</p> : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {p?.images.map((img) => (
                  <div key={img.id} className="group relative">
                    <img src={img.url} className="aspect-square w-full rounded-lg object-cover" alt="" />
                    <button type="button" onClick={() => removeImage(img.id)} className="absolute top-1 right-1 hidden rounded bg-white/90 px-1.5 text-xs group-hover:block">✕</button>
                  </div>
                ))}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); e.target.value = ""; }} />
              <Button type="button" variant="secondary" className="mt-3" disabled={(p?.images.length ?? 0) >= 8} onClick={() => fileRef.current?.click()}>{t("upload_photo")}</Button>
            </>
          )}
        </Card>
      </form>
    </>
  );
}
