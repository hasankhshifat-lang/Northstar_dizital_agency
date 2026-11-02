import { decodeText, fetchUrl, fieldError, htmlToText, isFacebookUrl, mapLimit, metaContent, pageTitle, parsePublicUrl, sameSiteLinks, tidy } from "../lib/fetch";

export const MAX_SOURCE_CHARS = 100_000;
const MAX_EXTRA_PAGES = 8;
/** Pages most likely to explain the business, read first when following links. */
const USEFUL = /about|contact|faq|help|shipping|delivery|return|refund|policy|polic|terms|service|pricing|price|payment|order|how|story|team|location|branch/i;

export interface Extracted { kind: "website" | "facebook"; title: string; url: string; content: string; pages: number; note: string | null }

function pageText(html: string): string {
  const parts = [metaContent(html, "description") ?? metaContent(html, "og:description"), htmlToText(html)].filter(Boolean) as string[];
  return tidy(parts.join("\n\n"));
}

/** Read a website (the page plus up to 8 useful same-site pages) or the public part of a Facebook page. */
export async function extractFromLink(raw: string, followLinks: boolean): Promise<Extracted> {
  const u = parsePublicUrl(raw);
  const facebook = isFacebookUrl(u);
  if (facebook) {
    u.hostname = "www.facebook.com";
    const page = await fetchUrl(u).catch(() => null);
    const html = page ? decodeText(page) : "";
    const lines = [pageTitle(html), metaContent(html, "og:description"), metaContent(html, "description")].filter((x): x is string => !!x && !/log ?in|sign ?up|facebook$/i.test(x));
    const content = tidy([...new Set(lines)].join("\n\n"));
    if (content.length < 40) {
      throw fieldError("url", "Facebook only shows this page to people who are logged in, so it can't be read automatically. Open the page's About section, copy the text, and add it with \"Add text\" instead.");
    }
    return {
      kind: "facebook", title: pageTitle(html) ?? u.pathname.replace(/\//g, " ").trim() ?? "Facebook page", url: u.toString(), content, pages: 1,
      note: "Facebook only shares a short summary of public pages. For better answers, also paste the About text and your posts' key details with \"Add text\".",
    };
  }

  const first = await fetchUrl(u);
  const html = decodeText(first);
  if (!/html/.test(first.contentType) && !/<html|<body/i.test(html.slice(0, 2000))) throw fieldError("url", "This link isn't a web page. Upload PDFs with \"Upload PDF\" instead.");
  const sections = [`# ${pageTitle(html) ?? u.hostname}\n${first.url}\n\n${pageText(html)}`];
  let pages = 1;
  if (followLinks) {
    const links = sameSiteLinks(html, first.url);
    const ranked = [...links.filter((l) => USEFUL.test(new URL(l).pathname)), ...links.filter((l) => !USEFUL.test(new URL(l).pathname))].slice(0, MAX_EXTRA_PAGES);
    const results = await mapLimit(ranked, 4, async (link) => {
      const f = await fetchUrl(new URL(link), { maxBytes: 2 * 1024 * 1024, timeoutMs: 10000 });
      if (!/html/.test(f.contentType)) return null;
      const h = decodeText(f);
      return `# ${pageTitle(h) ?? link}\n${link}\n\n${pageText(h)}`;
    });
    for (const r of results) if (r && r.length > 80) { sections.push(r); pages++; }
  }
  let content = sections.join("\n\n---\n\n");
  let note: string | null = null;
  if (content.length > MAX_SOURCE_CHARS) { content = content.slice(0, MAX_SOURCE_CHARS); note = "Only the first 100,000 characters were kept."; }
  if (htmlToText(html).length < 100 && pages === 1) note = "This page had very little text (it may be built with JavaScript). If answers are missing, paste the key details with \"Add text\".";
  return { kind: "website", title: pageTitle(html) ?? u.hostname, url: first.url, content, pages, note };
}

/** Text of a PDF. Scanned PDFs (images only) have no text and are refused with a clear message. */
export async function extractPdf(bytes: Uint8Array): Promise<{ content: string; pages: number; note: string | null }> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  let pdf;
  try { pdf = await getDocumentProxy(bytes); } catch { throw fieldError("file", "This file couldn't be opened as a PDF"); }
  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  let content = tidy(Array.isArray(text) ? text.join("\n\n") : text);
  if (content.replace(/\s/g, "").length < 20) throw fieldError("file", "This PDF has no selectable text (it may be scanned pictures). Type or paste the important parts with \"Add text\" instead.");
  let note: string | null = null;
  if (content.length > MAX_SOURCE_CHARS) { content = content.slice(0, MAX_SOURCE_CHARS); note = "Only the first 100,000 characters were kept."; }
  return { content, pages: totalPages, note };
}
