/**
 * Vercel Serverless Function — OG Prerender
 *
 * SOLUCIÓN AL PROBLEMA DE 206 / HTML INCOMPLETO:
 * ───────────────────────────────────────────────
 * El error 206 (Partial Content) ocurría porque la función hacía un HTTP
 * fetch interno a origin/index.html, y el CDN de Vercel respondía con
 * respuesta parcial al detectar (o heredar) headers de rango de la request.
 *
 * La solución es leer index.html directamente del filesystem con fs.readFileSync.
 * Esto funciona gracias a "includeFiles": "out/index.html" en vercel.json, que
 * empaqueta el HTML estático junto con la función serverless.
 *
 * FLUJO:
 *  1. Detecta si la request viene de un bot (Facebook, WhatsApp, etc.)
 *  2. Si ES bot → consulta Supabase REST, inyecta OG tags en index.html → 200
 *  3. Si NO es bot → sirve index.html sin procesar → 200 (SPA hidrata normal)
 *  4. Nunca redirige. Nunca responde 206.
 */

import fs   from 'fs';
import path from 'path';

// ── Variables de entorno ──────────────────────────────────────────────────────
const SUPABASE_URL =
  process.env.VITE_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

const SUPABASE_ANON_KEY =
  process.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

const SITE_ORIGIN = 'https://www.kuaeasyliving.com';

// ── Caché en memoria (entre invocaciones del mismo contenedor) ────────────────
const PROPERTY_CACHE = new Map<string, { data: Record<string, unknown>; ts: number }>();
const HTML_CACHE: { html: string | null; ts: number } = { html: null, ts: 0 };
const CACHE_TTL_PROPERTY_MS = 1000 * 60 * 10; // 10 min
const CACHE_TTL_HTML_MS     = 1000 * 60 * 60; // 60 min

// ── Detección de bots ─────────────────────────────────────────────────────────
const BOT_UA_PATTERN =
  /facebookexternalhit|whatsapp|twitterbot|slackbot|linkedinbot|telegrambot|discordbot|googlebot|bingbot|applebot|pinterestbot|ia_archiver|Iframely/i;

function isBot(userAgent: string): boolean {
  return BOT_UA_PATTERN.test(userAgent || '');
}

// ── Mapeo de operaciones ──────────────────────────────────────────────────────
const OPERATION_LABELS: Record<string, string> = {
  'arriendo-renta-corta': 'Renta Corta',
  'renta-corta':          'Renta Corta',
  'arriendo-tradicional': 'Arriendo Tradicional',
  'arriendo':             'Arriendo Tradicional',
  'venta':                'Venta',
};

function formatOperationLabel(op: string): string {
  const key = (op || '').toLowerCase().trim().replace(/\s+/g, '-');
  return OPERATION_LABELS[key] ?? key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTypeLabel(type: string): string {
  return (type || '')
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPrice(price: number, currency: string): string {
  if (!price) return '';
  try {
    return new Intl.NumberFormat('es-CO', {
      style:                 'currency',
      currency:              currency || 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency || 'COP'} ${price.toLocaleString('es-CO')}`;
  }
}

function escapeAttr(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Leer index.html del filesystem (sin HTTP fetch → sin 206) ─────────────────
//
// "includeFiles": "out/index.html" en vercel.json empaqueta el archivo
// junto con la función. process.cwd() apunta a /var/task en Vercel.
//
function readIndexHtmlFromFs(): string | null {
  const now = Date.now();
  if (HTML_CACHE.html && now - HTML_CACHE.ts < CACHE_TTL_HTML_MS) {
    return HTML_CACHE.html;
  }

  const candidates = [
    path.join(process.cwd(), 'out', 'index.html'),
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(__dirname, '..', 'out', 'index.html'),
    path.join(__dirname, '..', 'dist', 'index.html'),
    path.join(__dirname, 'out', 'index.html'),
  ];

  for (const candidate of candidates) {
    try {
      const html = fs.readFileSync(candidate, 'utf-8');
      if (html && html.includes('<html')) {
        HTML_CACHE.html = html;
        HTML_CACHE.ts   = now;
        return html;
      }
    } catch {
      // intenta el siguiente
    }
  }

  return null;
}

// ── Fallback HTML mínimo si el filesystem falla ───────────────────────────────
function buildMinimalHtml(metaBlock: string): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${metaBlock}
</head>
<body>
<div id="root"></div>
</body>
</html>`;
}

// ── Consulta a Supabase REST (sin cliente JS — compatible con Edge/Node) ───────
async function fetchPropertyBySlug(slug: string): Promise<Record<string, unknown> | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  // Caché
  const cached = PROPERTY_CACHE.get(slug);
  if (cached && Date.now() - cached.ts < CACHE_TTL_PROPERTY_MS) {
    return cached.data;
  }

  try {
    const endpoint =
      `${SUPABASE_URL}/rest/v1/properties` +
      `?slug=eq.${encodeURIComponent(slug)}` +
      `&select=id,title,description,images,city,neighborhood,department,operation,type,price,currency,bedrooms,bathrooms,area_built,status` +
      `&limit=1`;

    const response = await fetch(endpoint, {
      headers: {
        apikey:        SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept:        'application/json',
      },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as unknown[];
    const property = (data[0] as Record<string, unknown>) ?? null;

    if (property) {
      PROPERTY_CACHE.set(slug, { data: property, ts: Date.now() });
    }

    return property;
  } catch {
    return null;
  }
}

// ── Construir bloque de meta tags OG + Twitter Card + Schema.org ──────────────
function buildMetaTags(property: Record<string, unknown>, propertyUrl: string): string {
  const operationLabel = formatOperationLabel(String(property.operation ?? ''));
  const typeLabel      = formatTypeLabel(String(property.type ?? ''));
  const city           = String(property.city ?? '');
  const neighborhood   = String(property.neighborhood ?? '');
  const department     = String(property.department ?? '');
  const title          = String(property.title ?? '');
  const bedrooms       = Number(property.bedrooms) || 0;
  const bathrooms      = Number(property.bathrooms) || 0;
  const areaBuilt      = Number(property.area_built) || 0;
  const price          = Number(property.price) || 0;
  const currency       = String(property.currency ?? 'COP');

  const priceLabel = operationLabel.toLowerCase().includes('renta corta')
    ? 'por noche'
    : operationLabel.toLowerCase().includes('arriendo')
    ? 'por mes'
    : '';

  const locationStr = [neighborhood, city].filter(Boolean).join(', ');

  const ogTitle = `${title} | ${operationLabel} en ${city} — KÚA Easy Living`;

  // Descripción dinámica
  let description = '';
  const rawDesc = String(property.description ?? '').trim();
  if (rawDesc) {
    description = rawDesc.substring(0, 155).replace(/\n/g, ' ').trim();
    if (rawDesc.length > 155) description += '…';
  } else {
    const parts: string[] = [
      `${typeLabel} en ${operationLabel.toLowerCase()} — ${locationStr}.`,
      price > 0 ? `Desde ${formatPrice(price, currency)}${priceLabel ? ' ' + priceLabel : ''}.` : '',
      bedrooms > 0 ? `${bedrooms} hab, ${bathrooms} baños.` : '',
      areaBuilt > 0 ? `${areaBuilt}m² construidos.` : '',
      'KÚA Easy Living — Eje Cafetero, Colombia.',
    ];
    description = parts.filter(Boolean).join(' ').trim().substring(0, 155);
  }

  // Imagen — debe ser URL absoluta y pública
  const images = property.images as string[] | undefined;
  const rawImage = (images && images.length > 0) ? images[0] : '';
  // Garantizar URL absoluta
  const image = rawImage.startsWith('http') ? rawImage : rawImage ? `${SITE_ORIGIN}${rawImage}` : '';

  // Schema.org
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type':    'Residence',
    name:        title,
    description,
    url:         propertyUrl,
    image,
    address: {
      '@type':         'PostalAddress',
      streetAddress:   neighborhood,
      addressLocality: city,
      addressRegion:   department,
      addressCountry:  'CO',
    },
    numberOfBedrooms:       bedrooms,
    numberOfBathroomsTotal: bathrooms,
    ...(areaBuilt > 0
      ? { floorSize: { '@type': 'QuantitativeValue', value: areaBuilt, unitCode: 'MTK' } }
      : {}),
  });

  return `
  <!-- ====== KÚA Easy Living — OG Prerender (server-injected) ====== -->
  <title>${escapeAttr(ogTitle)}</title>
  <meta name="description" content="${escapeAttr(description)}" />
  <meta name="keywords" content="${escapeAttr(
    [operationLabel, typeLabel, city, neighborhood, 'inmuebles Colombia', 'KUA Easy Living', 'Eje Cafetero']
      .filter(Boolean).join(', ')
  )}" />
  <link rel="canonical" href="${escapeAttr(propertyUrl)}" />

  <!-- Open Graph (Facebook, WhatsApp, Instagram, Telegram, LinkedIn) -->
  <meta property="og:type"         content="website" />
  <meta property="og:site_name"    content="KÚA Easy Living" />
  <meta property="og:url"          content="${escapeAttr(propertyUrl)}" />
  <meta property="og:title"        content="${escapeAttr(ogTitle)}" />
  <meta property="og:description"  content="${escapeAttr(description)}" />
  <meta property="og:image"        content="${escapeAttr(image)}" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt"    content="${escapeAttr(title)}" />
  <meta property="og:locale"       content="es_CO" />

  <!-- Twitter / X Card -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:site"        content="@kuaeasyliving" />
  <meta name="twitter:title"       content="${escapeAttr(ogTitle)}" />
  <meta name="twitter:description" content="${escapeAttr(description)}" />
  <meta name="twitter:image"       content="${escapeAttr(image)}" />
  <meta name="twitter:image:alt"   content="${escapeAttr(title)}" />

  <!-- Schema.org Structured Data -->
  <script type="application/ld+json">${schema}</script>
  <!-- ====== END OG Prerender ====== -->
`;
}

// ── Inyectar meta tags en el HTML base ────────────────────────────────────────
function injectMetaTags(baseHtml: string, metaBlock: string): string {
  return baseHtml
    // Eliminar tags genéricos que puedan colisionar
    .replace(/<title>[^<]*<\/title>/gi, '')
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:[^"']*["'][^>]*>/gi, '')
    .replace(/<meta\s+(name|property)=["']twitter:[^"']*["'][^>]*>/gi, '')
    // Inyectar justo después de <head>
    .replace(/<head([^>]*)>/i, `<head$1>${metaBlock}`);
}

// ── Respuesta helper: siempre 200, sin Accept-Ranges ─────────────────────────
function sendHtml(
  res: any,
  html: string,
  headers: Record<string, string> = {}
): void {
  res.setHeader('Content-Type',  'text/html; charset=utf-8');
  res.setHeader('Accept-Ranges', 'none');          // evita 206 Partial Content
  res.setHeader('X-Content-Type-Options', 'nosniff');
  for (const [k, v] of Object.entries(headers)) {
    res.setHeader(k, v);
  }
  res.status(200).send(html);
}

// ── Handler principal ─────────────────────────────────────────────────────────
export default async function handler(req: any, res: any): Promise<void> {
  // ── 1. Parsear pathname ────────────────────────────────────────────────────
  const host     = String(req.headers['x-forwarded-host'] ?? req.headers.host ?? 'kuaeasyliving.com');
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const origin   = `${protocol}://${host}`;

  let pathname = '/';
  try {
    pathname = new URL(req.url, origin).pathname;
  } catch {
    pathname = (req.url as string)?.split('?')[0] ?? '/';
  }

  // Segmentos: /arriendo/mi-aparto → ["arriendo", "mi-aparto"]
  const segments  = pathname.replace(/\/$/, '').split('/').filter(Boolean);
  const operation = segments[0] ?? '';
  const slug      = segments.slice(1).join('/');

  // URL canónica (siempre producción)
  const propertyUrl = `${SITE_ORIGIN}${pathname}`;

  // ── 2. Detectar bot ────────────────────────────────────────────────────────
  const userAgent = String(req.headers['user-agent'] ?? '');
  const botRequest = isBot(userAgent);

  // ── 3. Leer index.html del filesystem (sin HTTP fetch → sin 206) ───────────
  const baseHtml = readIndexHtmlFromFs();

  // ── 4. Si no hay slug, no hay operación conocida, o no es bot ─────────────
  //     → servir index.html tal cual (SPA hidrata del lado del cliente)
  if (!botRequest || !slug || !operation) {
    if (baseHtml) {
      sendHtml(res, baseHtml, {
        'Cache-Control': 'no-store',
        'X-KUA-Prerender': 'skip',
        'X-KUA-Bot': String(botRequest),
      });
    } else {
      // Último recurso: HTML mínimo funcional
      sendHtml(res, buildMinimalHtml(''), { 'Cache-Control': 'no-store' });
    }
    return;
  }

  // ── 5. Bot + slug presente → prerender completo ───────────────────────────
  try {
    const property = await fetchPropertyBySlug(slug);

    if (!property) {
      // Propiedad no encontrada — devolver HTML sin OG tags (bot igual indexa)
      sendHtml(res, baseHtml ?? buildMinimalHtml(''), {
        'Cache-Control':  'no-cache',
        'X-KUA-Prerender': 'miss',
        'X-KUA-Slug':      slug,
      });
      return;
    }

    const metaBlock = buildMetaTags(property, propertyUrl);
    const html = baseHtml
      ? injectMetaTags(baseHtml, metaBlock)
      : buildMinimalHtml(metaBlock);

    sendHtml(res, html, {
      'Cache-Control':  's-maxage=3600, stale-while-revalidate=600',
      'X-KUA-Prerender': 'hit',
      'X-KUA-Slug':      slug,
      'X-KUA-Operation': operation,
      'X-KUA-Bot':       userAgent.substring(0, 60),
    });

  } catch {
    // Fallback de emergencia: nunca redirigir, siempre 200
    sendHtml(res, baseHtml ?? buildMinimalHtml(''), {
      'Cache-Control':  'no-cache',
      'X-KUA-Prerender': 'error',
    });
  }
}
