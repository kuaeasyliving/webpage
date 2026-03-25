/**
 * Vercel Serverless Function — OG Prerender
 *
 * Intercepta las URLs de propiedades y sirve el index.html con
 * Open Graph meta tags inyectados para que los bots de redes sociales
 * (Facebook, WhatsApp, Telegram, LinkedIn, Instagram, Twitter) generen
 * previews correctos al compartir un link.
 *
 * Flujo:
 *  1. Recibe operation + slug como query params (via vercel.json rewrites)
 *  2. Consulta la propiedad en Supabase REST API (sin cliente JS)
 *  3. Obtiene el index.html del sitio y le inyecta los OG tags
 *  4. Retorna el HTML modificado — el React app hidrata normalmente
 *
 * Para usuarios normales:  SPA se carga igual, sin impacto en performance.
 * Para bots:               Leen los OG tags y generan el preview correcto.
 */

const SUPABASE_URL = process.env.VITE_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY || '';

// User-agents de bots de redes sociales que necesitan OG prerendering
const SOCIAL_BOTS = [
  'facebookexternalhit',
  'facebookcatalog',
  'WhatsApp',
  'TelegramBot',
  'LinkedInBot',
  'Twitterbot',
  'Slackbot',
  'Discordbot',
  'SkypeUriPreview',
  'GoogleBot',
  'Googlebot',
  'bingbot',
  'DuckDuckBot',
  'applebot',
  'ia_archiver',
];

function isSocialBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return SOCIAL_BOTS.some((bot) => ua.includes(bot.toLowerCase()));
}

function escapeAttr(str: string): string {
  return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function fetchPropertyBySlug(slug: string): Promise<Record<string, any> | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  try {
    const url = `${SUPABASE_URL}/rest/v1/properties?slug=eq.${encodeURIComponent(slug)}&select=title,description,images,city,neighborhood,department,operation,type,price,currency,bedrooms,bathrooms,area_built&limit=1`;
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data[0] || null;
  } catch {
    return null;
  }
}

function formatPrice(price: number, currency: string): string {
  if (!price) return '';
  const fmt = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency || 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return fmt.format(price);
}

function buildMetaTags(property: Record<string, any>, propertyUrl: string): string {
  const priceLabel = property.operation?.includes('renta-corta')
    ? 'por noche'
    : property.operation?.includes('arriendo')
    ? 'por mes'
    : '';

  const priceStr = property.price
    ? `${formatPrice(property.price, property.currency)}${priceLabel ? ' ' + priceLabel : ''} — `
    : '';

  const locationStr = [property.neighborhood, property.city]
    .filter(Boolean)
    .join(', ');

  const title = `${property.title} | ${property.operation} en ${property.city} — KÚA Easy Living`;

  const description = property.description
    ? property.description.substring(0, 160).replace(/\n/g, ' ')
    : `${priceStr}${property.type || ''} en ${property.operation?.toLowerCase() || ''} — ${locationStr}. ${
        property.bedrooms > 0 ? `${property.bedrooms} hab, ${property.bathrooms} baños. ` : ''
      }${property.area_built > 0 ? `${property.area_built}m².` : ''}`.trim();

  const image = property.images?.[0] || '';

  return `
  <!-- === KÚA Easy Living — OG Prerender === -->
  <title>${escapeAttr(title)}</title>
  <meta name="description" content="${escapeAttr(description)}" />
  <link rel="canonical" href="${escapeAttr(propertyUrl)}" />

  <!-- Open Graph (Facebook, Instagram, WhatsApp, Telegram, LinkedIn) -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="KÚA Easy Living" />
  <meta property="og:url" content="${escapeAttr(propertyUrl)}" />
  <meta property="og:title" content="${escapeAttr(title)}" />
  <meta property="og:description" content="${escapeAttr(description)}" />
  <meta property="og:image" content="${escapeAttr(image)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeAttr(property.title)}" />
  <meta property="og:locale" content="es_CO" />

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@kuaeasyliving" />
  <meta name="twitter:title" content="${escapeAttr(title)}" />
  <meta name="twitter:description" content="${escapeAttr(description)}" />
  <meta name="twitter:image" content="${escapeAttr(image)}" />
  <meta name="twitter:image:alt" content="${escapeAttr(property.title)}" />

  <!-- Schema.org structured data -->
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Residence","name":"${escapeAttr(property.title)}","description":"${escapeAttr(description)}","url":"${escapeAttr(propertyUrl)}","image":"${escapeAttr(image)}","address":{"@type":"PostalAddress","addressLocality":"${escapeAttr(property.city)}","addressRegion":"${escapeAttr(property.department || '')}","addressCountry":"CO"},"numberOfBedrooms":${property.bedrooms || 0},"numberOfBathroomsTotal":${property.bathrooms || 0}}</script>
  <!-- === END OG Prerender === -->
`;
}

export default async function handler(req: any, res: any): Promise<void> {
  const { operation, slug } = req.query || {};

  if (!slug || !operation) {
    res.status(400).send('Bad Request: missing operation or slug');
    return;
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host || 'kuaeasyliving.com';
  const protocol = String(host).includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const propertyUrl = `${baseUrl}/${operation}/${slug}`;

  const userAgent = req.headers['user-agent'] || '';
  const isBot = isSocialBot(userAgent);

  try {
    // Para bots: siempre inyectar OG tags
    // Para usuarios: también inyectamos (React hidrata igual, sin impacto)
    const [property, indexRes] = await Promise.all([
      isBot ? fetchPropertyBySlug(String(slug)) : Promise.resolve(null),
      fetch(`${baseUrl}/`),
    ]);

    if (!indexRes.ok) {
      res.status(502).send('Could not fetch index.html');
      return;
    }

    let indexHtml = await indexRes.text();

    if (isBot && property) {
      const ogTags = buildMetaTags(property, propertyUrl);
      // Inyectar los OG tags justo después del <head>
      indexHtml = indexHtml.replace(/<head([^>]*)>/i, `<head$1>${ogTags}`);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Cache por 1 hora para bots, no cachear para usuarios
    res.setHeader(
      'Cache-Control',
      isBot
        ? 's-maxage=3600, stale-while-revalidate=600'
        : 'no-cache, no-store, must-revalidate'
    );
    res.status(200).send(indexHtml);
  } catch (err) {
    // Fallback: intentar servir index.html sin modificar
    try {
      const fallback = await fetch(`${baseUrl}/`);
      const html = await fallback.text();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.status(200).send(html);
    } catch {
      res.status(500).send('Internal Server Error');
    }
  }
}
