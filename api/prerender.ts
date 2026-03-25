/**
 * Vercel Serverless Function — OG Prerender
 *
 * Intercepta las URLs de propiedades y sirve el index.html con
 * Open Graph meta tags inyectados para que los bots de redes sociales
 * (Facebook, WhatsApp, Telegram, LinkedIn, Twitter/X) generen
 * previews correctos al compartir un link.
 *
 * Flujo:
 *  1. Recibe la URL completa vía req.url (gracias a vercel.json routes)
 *  2. Parsea pathname → extrae operation + slug del path
 *  3. Consulta la propiedad en Supabase REST API (sin cliente JS)
 *  4. Obtiene el index.html del sitio y le inyecta los OG tags
 *  5. Retorna HTML 200 modificado — el React app hidrata normalmente
 *
 * Para usuarios normales:  SPA se carga igual con meta tags ya presentes (SEO)
 * Para bots:               Leen los OG tags y generan el preview correcto.
 *
 * IMPORTANTE: Siempre responde 200. Nunca redirige a /.
 * Accept-Ranges: none evita respuestas 206 Partial Content.
 */

const SUPABASE_URL =
  process.env.VITE_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';

const SUPABASE_ANON_KEY =
  process.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const SITE_ORIGIN = 'https://www.kuaeasyliving.com';

// ── Mapeo de operaciones a etiquetas legibles ─────────────────────────────────
const OPERATION_LABELS: Record<string, string> = {
  'arriendo-renta-corta':   'Renta Corta',
  'renta-corta':            'Renta Corta',
  'arriendo-tradicional':   'Arriendo Tradicional',
  'arriendo':               'Arriendo Tradicional',
  'venta':                  'Venta',
};

function formatOperationLabel(operation: string): string {
  if (!operation) return '';
  const key = operation.toLowerCase().trim().replace(/\s+/g, '-');
  if (OPERATION_LABELS[key]) return OPERATION_LABELS[key];
  return key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTypeLabel(type: string): string {
  if (!type) return '';
  return type
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPrice(price: number, currency: string): string {
  if (!price) return '';
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'COP',
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

// ── Consulta a Supabase REST ──────────────────────────────────────────────────
async function fetchPropertyBySlug(slug: string): Promise<Record<string, unknown> | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const endpoint =
      `${SUPABASE_URL}/rest/v1/properties` +
      `?slug=eq.${encodeURIComponent(slug)}` +
      `&select=id,title,description,images,city,neighborhood,department,operation,type,price,currency,bedrooms,bathrooms,area_built,status` +
      `&limit=1`;

    const response = await fetch(endpoint, {
      headers: {
        apikey:         SUPABASE_ANON_KEY,
        Authorization:  `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return (data as unknown[])[0] as Record<string, unknown> ?? null;
  } catch {
    return null;
  }
}

// ── Construir bloque de meta tags OG + Twitter Card + Schema.org ──────────────
function buildMetaTags(
  property: Record<string, unknown>,
  propertyUrl: string
): string {
  const operationLabel = formatOperationLabel(String(property.operation || ''));
  const typeLabel      = formatTypeLabel(String(property.type || ''));
  const city           = String(property.city || '');
  const neighborhood   = String(property.neighborhood || '');
  const department     = String(property.department || '');
  const title          = String(property.title || '');
  const bedrooms       = Number(property.bedrooms) || 0;
  const bathrooms      = Number(property.bathrooms) || 0;
  const areaBuilt      = Number(property.area_built) || 0;
  const price          = Number(property.price) || 0;
  const currency       = String(property.currency || 'COP');

  const priceLabel = operationLabel === 'Renta Corta'
    ? 'por noche'
    : operationLabel.toLowerCase().includes('arriendo')
    ? 'por mes'
    : '';

  const priceStr = price
    ? `${formatPrice(price, currency)}${priceLabel ? ' ' + priceLabel : ''} — `
    : '';

  const locationStr = [neighborhood, city].filter(Boolean).join(', ');

  const ogTitle = `${title} | ${operationLabel} en ${city} — KÚA Easy Living`;

  let description = '';
  const rawDesc = String(property.description || '').trim();
  if (rawDesc) {
    description = rawDesc.substring(0, 155).replace(/\n/g, ' ').trim();
    if (rawDesc.length > 155) description += '…';
  } else {
    const parts: string[] = [
      `${typeLabel} en ${operationLabel.toLowerCase()} — ${locationStr}.`,
      priceStr ? `Desde ${priceStr.replace(' — ', '').trim()}.` : '',
      bedrooms > 0 ? `${bedrooms} hab, ${bathrooms} baños.` : '',
      areaBuilt > 0 ? `${areaBuilt}m² construidos.` : '',
      'KÚA Easy Living — Eje Cafetero, Colombia.',
    ];
    description = parts.filter(Boolean).join(' ').trim().substring(0, 155);
  }

  const images = property.images as string[] | undefined;
  const image  = images && images.length > 0 ? images[0] : '';

  const schema = JSON.stringify({
    '@context':  'https://schema.org',
    '@type':     'Residence',
    name:        title,
    description,
    url:         propertyUrl,
    image,
    address: {
      '@type':          'PostalAddress',
      streetAddress:    neighborhood,
      addressLocality:  city,
      addressRegion:    department,
      addressCountry:   'CO',
    },
    numberOfBedrooms:        bedrooms,
    numberOfBathroomsTotal:  bathrooms,
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

// ── Obtener index.html desde el CDN/estáticos de Vercel ──────────────────────
// Se hace un fetch explícito SIN cabecera Range para evitar respuestas 206.
async function fetchIndexHtml(origin: string): Promise<string | null> {
  // Intentamos primero /index.html, luego / como fallback
  const urls = [`${origin}/index.html`, `${origin}/`];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        // Cabeceras explícitas: sin Range, pedimos el recurso completo
        headers: {
          Accept:          'text/html,application/xhtml+xml',
          'Cache-Control': 'no-cache',
        },
      });
      // Aceptamos solo 200 (no 206 Partial Content)
      if (res.status === 200) {
        return await res.text();
      }
    } catch {
      // continúa al siguiente intento
    }
  }
  return null;
}

// ── Handler principal de Vercel ───────────────────────────────────────────────
export default async function handler(req: any, res: any): Promise<void> {
  // ── 1. Parsear la URL de la request para extraer operation y slug ──────────
  //
  // Con vercel.json "routes", req.url contiene el pathname original completo,
  // por ejemplo: /arriendo/mi-apartamento-pereira  →  operation=arriendo, slug=mi-apartamento-pereira
  //
  const host     = String(req.headers['x-forwarded-host'] || req.headers.host || 'kuaeasyliving.com');
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const origin   = `${protocol}://${host}`;

  // req.url puede incluir query string; parsear solo pathname
  let pathname = '/';
  try {
    const parsed = new URL(req.url, origin);
    pathname = parsed.pathname; // e.g. /arriendo/mi-apartamento
  } catch {
    pathname = req.url?.split('?')[0] || '/';
  }

  // Separar el pathname en segmentos: ["", "arriendo", "mi-apartamento"]
  const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean);
  // segments[0] = operation (e.g. "arriendo", "renta-corta", "venta")
  // segments[1..] = slug (puede contener "/" pero rara vez)
  const operation = segments[0] ?? '';
  const slug      = segments.slice(1).join('/');

  // URL canónica de esta propiedad (siempre sobre el dominio de producción)
  const propertyUrl = `${SITE_ORIGIN}${pathname}`;

  // ── 2. Responder sin redirects — siempre 200 ─────────────────────────────
  if (!slug || !operation) {
    // Si por algún motivo no hay slug/operation, servir index.html genérico
    const fallback = await fetchIndexHtml(origin);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Accept-Ranges', 'none');
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(fallback ?? '<!doctype html><html><body><div id="root"></div></body></html>');
    return;
  }

  try {
    // ── 3. Fetch paralelo: propiedad en Supabase + index.html estático ──────
    const [property, indexHtml] = await Promise.all([
      fetchPropertyBySlug(slug),
      fetchIndexHtml(origin),
    ]);

    if (!indexHtml) {
      // No se pudo obtener el HTML base — responder 200 con HTML mínimo
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Accept-Ranges', 'none');
      res.status(200).send('<!doctype html><html><head><meta charset="utf-8"/></head><body><div id="root"></div></body></html>');
      return;
    }

    let html = indexHtml;

    if (property) {
      const metaBlock = buildMetaTags(property, propertyUrl);

      // Limpiar tags genéricos del index.html y reemplazar con los de la propiedad
      html = html
        .replace(/<title>[^<]*<\/title>/gi, '')
        .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
        .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '')
        .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '')
        .replace(/<meta\s+(name|property)=["']twitter:[^"']+["'][^>]*>/gi, '')
        // Inyectar el bloque justo después de <head>
        .replace(/<head([^>]*)>/i, `<head$1>${metaBlock}`);
    }

    // ── 4. Respuesta: 200 OK — sin Accept-Ranges para evitar 206 ────────────
    res.setHeader('Content-Type',  'text/html; charset=utf-8');
    res.setHeader('Accept-Ranges', 'none');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
    res.setHeader('X-KUA-Prerender', property ? 'hit' : 'miss');
    res.setHeader('X-KUA-Slug',      slug);
    res.setHeader('X-KUA-Operation', operation);
    res.status(200).send(html);

  } catch {
    // ── 5. Fallback de emergencia: nunca redirigir, siempre 200 ─────────────
    try {
      const emergency = await fetchIndexHtml(origin);
      if (emergency) {
        res.setHeader('Content-Type',  'text/html; charset=utf-8');
        res.setHeader('Accept-Ranges', 'none');
        res.setHeader('Cache-Control', 'no-cache');
        res.status(200).send(emergency);
        return;
      }
    } catch { /* ignore */ }

    res.setHeader('Content-Type',  'text/html; charset=utf-8');
    res.setHeader('Accept-Ranges', 'none');
    res.status(200).send('<!doctype html><html><head><meta charset="utf-8"/></head><body><div id="root"></div></body></html>');
  }
}
