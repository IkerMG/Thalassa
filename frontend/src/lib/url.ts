const DOMAIN_RE = /^([a-zA-Z0-9-]+\.)+[a-z]{2,}(\/.*)?$/;

export function normalizeExternalUrl(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  const t = url.trim();
  if (/^https?:\/\//.test(t)) return t;
  if (t.startsWith('//')) return `https:${t}`;
  if (DOMAIN_RE.test(t)) return `https://${t}`;
  return null;
}
