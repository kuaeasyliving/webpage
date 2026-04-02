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
// FIX: Agregado 'facebot' que es el UA secundario de Facebook
const BOT_REGEX =
  /facebookexternalhit|facebot|whatsapp|twitterbot|slackbot|linkedinbot|telegrambot|discordbot|googlebot/i;

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

// ── READ INDEX.HTML (SIN 206) ───────────────────────────────────────
// FIX: Múltiples rutas candidatas para robustez en distintos entornos Vercel
function readHtml(): string | null {
  const candidates = [
    path.join(process.cwd(), 'out', 'index.html'),
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(__dirname, '..', 'out', 'index.html'),
  ];
  for (const candidate of candidates) {
    try {
      const html = fs.readFileSync(candidate, 'utf-8');
      if (html && html.includes('<html')) return html;
    } catch {
      // try next
    }
  }
  console.error('ERROR: No se encontro index.html');
  return null;
}

// ── FETCH PROPERTY ──────────────────────────────────────────────────
async function getProperty(slug: string) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/properties?slug=eq.${encodeURIComponent(slug)}&select=id,title,description,images,city,neighborhood,operation,type,price,currency,bedrooms,area_built&limit=1`;

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!res.ok) {
      console.error('SUPABASE ERROR:', res.status);
      return null;
    }

    const data = await res.json();
    return data[0] || null;

  } catch (e) {
    console.error('FETCH ERROR:', e);
    return null;
  }
}

// ── BUILD META TAGS ─────────────────────────────────────────────────
function buildMeta(property: any, canonicalUrl: string) {
  const title = `${property.title || 'Inmueble'} | KUA Easy Living`;
  const rawDesc = (property.description || '').trim();
  const desc = rawDesc
    ? rawDesc.substring(0, 150) + (rawDesc.length > 150 ? '...' : '')
    : `${property.type || 'Inmueble'} en ${property.operation || 'arriendo'} - ${property.city || 'Eje Cafetero'}. KUA Easy Living.`;

  // FIX CRITICO: 'images' estaba referenciada como variable sin definir en el handler original
  // Esto causaba un ReferenceError en runtime que rompía toda la función serverless
  const imageUrls: string[] = Array.isArray(property.images) ? property.images : [];
  const rawImage = imageUrls.length > 0 ? imageUrls[0] : '';
  const image = rawImage.startsWith('http')
    ? rawImage
    : rawImage
    ? `${SITE_ORIGIN}${rawImage}`
    : '';

  return `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(desc)}"/>
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}"/>

    <meta property="og:site_name" content="KUA Easy Living"/>
    <meta property="og:type" content="website"/>
    <meta property="og:title" content="${escapeHtml(title)}"/>
    <meta property="og:description" content="${escapeHtml(desc)}"/>
    <meta property="og:image" content="${escapeHtml(image)}"/>
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}"/>
    <meta property="og:locale" content="es_CO"/>

    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:title" content="${escapeHtml(title)}"/>
    <meta name="twitter:description" content="${escapeHtml(desc)}"/>
    <meta name="twitter:image" content="${escapeHtml(image)}"/>
  `;
}

// ── INJECT META ─────────────────────────────────────────────────────
// FIX: Elimina los tags genéricos del index.html base antes de inyectar
// los específicos de la propiedad, para evitar duplicados que confunden a Facebook
function inject(html: string, meta: string) {
  return html
    .replace(/<title>[^<]*<\/title>/gi, '')
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:[^"']*["'][^>]*>/gi, '')
    .replace(/<meta\s+(name|property)=["']twitter:[^"']*["'][^>]*>/gi, '')
    .replace(/<head([^>]*)>/i, `<head$1>${meta}`);
}

// ── RESPONSE ───────────────────────────────────────────────────────
function send(res: any, html: string, extra: Record<string, string> = {}) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Accept-Ranges', 'none'); // evita 206 Partial Content
  res.setHeader('X-Content-Type-Options', 'nosniff');
  for (const [k, v] of Object.entries(extra)) {
    res.setHeader(k, v);
  }
  res.status(200).send(html);
}

// ── HANDLER ────────────────────────────────────────────────────────
export default async function handler(req: any, res: any) {
  const ua = req.headers['user-agent'] || '';

  const baseHtml = readHtml();

  if (!baseHtml) {
    return send(res, '<!doctype html><html lang="es"><head><meta charset="utf-8"/></head><body><div id="root"></div></body></html>');
  }

  // Parse URL
  const url = new URL(req.url, SITE_ORIGIN);
  const parts = url.pathname.split('/').filter(Boolean);
  const slug = parts.slice(1).join('/');

  // FIX: Verificar bot Y slug antes de prerender
  // Antes: solo verificaba slug, servía prerender a usuarios normales también
  if (!slug || !isBot(ua)) {
    return send(res, baseHtml, {
      'Cache-Control': 'no-store',
      'X-KUA-Prerender': 'skip',
      'X-KUA-Bot': String(isBot(ua)),
    });
  }

  // Bot con slug → prerender
  try {
    const property = await getProperty(slug);

    if (!property) {
      console.warn('PRERENDER MISS:', slug);
      return send(res, baseHtml, {
        'Cache-Control': 'no-cache',
        'X-KUA-Prerender': 'miss',
      });
    }

    const meta = buildMeta(property, `${SITE_ORIGIN}${url.pathname}`);
    const html = inject(baseHtml, meta);

    console.log('PRERENDER HIT:', req.url, '| UA:', ua.substring(0, 60));

    // FIX CRITICO: Antes había res.status(200).send(html) Y send(res, html) — DOBLE respuesta
    // Node.js lanza "Cannot set headers after they are sent" → crash silencioso
    return send(res, html, {
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=600',
      'X-KUA-Prerender': 'hit',
      'X-KUA-Slug': slug,
      'X-KUA-Bot': ua.substring(0, 60),
    });

  } catch (e) {
    console.error('PRERENDER ERROR:', e);
    return send(res, baseHtml, {
      'Cache-Control': 'no-cache',
      'X-KUA-Prerender': 'error',
    });
  }
}
