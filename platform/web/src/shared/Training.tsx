import { useRef, useState } from "react";
import { FileText, Globe, ThumbsUp, RefreshCw, StickyNote, Trash2, Eye, type LucideIcon } from "lucide-react";
import { api, fmtDate } from "../api";
import { useT } from "../i18n";
import { Badge, Button, Card, ErrorText, Field, Input, Modal, Textarea, useApi } from "../ui";

export interface Source {
  id: string; kind: "website" | "facebook" | "pdf" | "text"; title: string; url: string | null; chars: number; pages: number;
  note: string | null; added_by: "client" | "agency"; created_at: string; updated_at: string;
}

const ICON: Record<Source["kind"], LucideIcon> = { website: Globe, facebook: ThumbsUp, pdf: FileText, text: StickyNote };

/** Add and manage what the chatbot learns from: links, PDFs and text. `base` is the client or the agency API path. */
export function TrainingPanel({ base }: { base: string }) {
  const { t } = useT();
  const list = useApi<{ sources: Source[] }>(base);
  const [busy, setBusy] = useState<"" | "link" | "pdf" | "text">("");
  const [err, setErr] = useState<unknown>(null);
  const [ok, setOk] = useState(false);
  const [url, setUrl] = useState("");
  const [follow, setFollow] = useState(true);
  const [text, setText] = useState({ title: "", content: "" });
  const [viewing, setViewing] = useState<(Source & { content: string }) | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const run = async (kind: typeof busy, fn: () => Promise<unknown>) => {
    setBusy(kind); setErr(null); setOk(false);
    try { await fn(); setOk(true); list.reload(); setTimeout(() => setOk(false), 4000); } catch (e) { setErr(e); } finally { setBusy(""); }
  };
  const addLink = () => run("link", async () => { await api(`${base}/link`, { json: { url, follow_links: follow } }); setUrl(""); });
  const addText = () => run("text", async () => { await api(`${base}/text`, { json: text }); setText({ title: "", content: "" }); });
  const addPdf = (file: File) => run("pdf", async () => { const fd = new FormData(); fd.append("file", file); await api(`${base}/pdf`, { body: fd }); });
  const refresh = (s: Source) => run("link", () => api(`${base}/${s.id}/refresh`, { method: "POST" }));
  const remove = async (s: Source) => { if (confirm(t("delete_source_confirm"))) { await api(`${base}/${s.id}`, { method: "DELETE" }); list.reload(); } };
  const view = async (s: Source) => setViewing((await api<{ source: Source & { content: string } }>(`${base}/${s.id}`)).source);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-slate-600">{t("training_intro")}</p>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card title={t("add_link")}>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (url.trim()) addLink(); }}>
            <Field label={t("link_hint")}><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… / facebook.com/…" inputMode="url" name="training_url" /></Field>
            <label className="flex items-start gap-2 text-sm text-slate-600"><input type="checkbox" className="mt-0.5" checked={follow} onChange={(e) => setFollow(e.target.checked)} />{t("follow_links")}</label>
            <Button type="submit" disabled={!url.trim() || !!busy}>{busy === "link" ? t("reading") : t("read_link")}</Button>
          </form>
        </Card>
        <Card title={t("upload_pdf")}>
          <p className="mb-3 text-sm text-slate-600">{t("pdf_hint")}</p>
          <input ref={fileRef} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) addPdf(f); e.target.value = ""; }} />
          <Button variant="secondary" disabled={!!busy} onClick={() => fileRef.current?.click()}>{busy === "pdf" ? t("reading") : t("choose_pdf")}</Button>
        </Card>
        <Card title={t("add_text")}>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); addText(); }}>
            <Field label={t("text_title")}><Input value={text.title} onChange={(e) => setText({ ...text, title: e.target.value })} placeholder={t("text_title_ph")} name="training_title" /></Field>
            <Field label={t("text_content")}><Textarea rows={4} value={text.content} onChange={(e) => setText({ ...text, content: e.target.value })} placeholder={t("text_content_ph")} name="training_text" /></Field>
            <Button type="submit" disabled={!text.title.trim() || !text.content.trim() || !!busy}>{t("save")}</Button>
          </form>
        </Card>
      </div>
      <ErrorText error={err ?? list.error} />
      {ok && <p className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">{t("training_saved")}</p>}

      <Card title={`${t("training_sources")}${list.data ? ` (${list.data.sources.length})` : ""}`}>
        {list.data?.sources.length === 0 && <p className="text-sm text-slate-500">{t("no_sources")}</p>}
        <ul className="divide-y divide-slate-100">
          {list.data?.sources.map((s) => {
            const Icon = ICON[s.kind];
            return (
              <li key={s.id} className="flex flex-wrap items-start gap-3 py-3" data-testid="training-source">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon size={18} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900">{s.title}</span>
                    <Badge tone="violet">{t("src_" + s.kind)}</Badge>
                    <Badge tone={s.added_by === "agency" ? "blue" : "slate"}>{t(s.added_by === "agency" ? "by_agency" : "by_client")}</Badge>
                  </div>
                  {s.url && <a href={s.url} target="_blank" rel="noreferrer" className="block truncate text-xs text-brand-700 hover:underline">{s.url}</a>}
                  <div className="text-xs text-slate-500">
                    {t("n_chars", { n: s.chars.toLocaleString("en-IN") })}{s.pages > 1 ? ` · ${t("n_pages", { n: s.pages })}` : ""} · {fmtDate(s.updated_at)}
                  </div>
                  {s.note && <p className="mt-1 text-xs text-amber-700">{s.note}</p>}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" title={t("view")} aria-label={t("view")} onClick={() => view(s)}><Eye size={16} /></Button>
                  {s.kind === "pdf" && <a href={`${base}/${s.id}/file`} target="_blank" rel="noreferrer"><Button size="sm" variant="ghost" title="PDF" aria-label="PDF"><FileText size={16} /></Button></a>}
                  {s.url && <Button size="sm" variant="ghost" title={t("refresh")} aria-label={t("refresh")} disabled={!!busy} onClick={() => refresh(s)}><RefreshCw size={16} /></Button>}
                  <Button size="sm" variant="ghost" className="text-red-600" title={t("delete")} aria-label={t("delete")} onClick={() => remove(s)}><Trash2 size={16} /></Button>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Modal open={!!viewing} title={viewing?.title ?? ""} onClose={() => setViewing(null)}>
        <pre className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 font-sans text-sm text-slate-700">{viewing?.content}</pre>
      </Modal>
    </div>
  );
}
