import fs from 'fs';
import path from 'path';

// ── ENV ─────────────────────────────────────────────────────────────
const SUPABASE_URL =
  process.env.VITE_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

const SUPABASE_ANON_KEY =
  process.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

const SITE_ORIGIN = 'https://www.kuaeasyliving.com';

// ── BOT DETECTION ───────────────────────────────────────────────────
const BOT_REGEX =
  /facebookexternalhit|whatsapp|twitterbot|slackbot|linkedinbot|telegrambot|discordbot|googlebot/i;

function isBot(ua: string) {
  return BOT_REGEX.test(ua || '');
}

// ── HELPERS ─────────────────────────────────────────────────────────
function escapeHtml(str: string) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price);
}

// ── READ INDEX.HTML (SIN 206) ───────────────────────────────────────
function readHtml(): string | null {
  const paths = [
    path.join(process.cwd(), 'dist/index.html'),
    path.join(process.cwd(), 'out/index.html'),
  ];

  for (const p of paths) {
    try {
      return fs.readFileSync(p, 'utf-8');
    } catch {}
  }

  return null;
}

// ── FETCH PROPERTY ──────────────────────────────────────────────────
async function getProperty(slug: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  const url = `${SUPABASE_URL}/rest/v1/properties?slug=eq.${slug}&select=*&limit=1`;

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data[0] || null;
}

// ── BUILD META TAGS ─────────────────────────────────────────────────
function buildMeta(property: any, url: string) {
  const title = property.title || 'KÚA Easy Living';
  const desc =
    (property.description || '').substring(0, 150) ||
    'Encuentra tu espacio ideal con KÚA';

  const image =
    property.images?.[0]?.startsWith('http')
      ? property.images[0]
      : `${SITE_ORIGIN}${property.images?.[0] || ''}`;

  return `
    <title>${escapeHtml(title)}</title>

    <meta name="description" content="${escapeHtml(desc)}"/>

    <meta property="og:type" content="website"/>
    <meta property="og:title" content="${escapeHtml(title)}"/>
    <meta property="og:description" content="${escapeHtml(desc)}"/>
    <meta property="og:image" content="${image}"/>
    <meta property="og:url" content="${url}"/>

    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:title" content="${escapeHtml(title)}"/>
    <meta name="twitter:description" content="${escapeHtml(desc)}"/>
    <meta name="twitter:image" content="${image}"/>
  `;
}

// ── INJECT META ─────────────────────────────────────────────────────
function inject(html: string, meta: string) {
  return html.replace(/<head>/i, `<head>${meta}`);
}

// ── RESPONSE ───────────────────────────────────────────────────────
function send(res: any, html: string) {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Accept-Ranges', 'none'); // 🔥 evita 206
  res.status(200).send(html);
}

// ── HANDLER ────────────────────────────────────────────────────────
export default async function handler(req: any, res: any) {
  const ua = req.headers['user-agent'] || '';

  const baseHtml = readHtml();

  if (!baseHtml) {
    return send(res, '<html><body>Error</body></html>');
  }

  // Parse URL
  const url = new URL(req.url, SITE_ORIGIN);
  const parts = url.pathname.split('/').filter(Boolean);

  const slug = parts.slice(1).join('/');

  // 👉 Si NO es bot → SPA normal
  if (!isBot(ua)) {
    return send(res, baseHtml);
  }

  // 👉 BOT → prerender
  const property = await getProperty(slug);

  if (!property) {
    return send(res, baseHtml);
  }

  const meta = buildMeta(property, `${SITE_ORIGIN}${url.pathname}`);
  const html = inject(baseHtml, meta);

  return send(res, html);
}