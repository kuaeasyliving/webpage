/**
 * Utilidad para generar slugs SEO-friendly para propiedades inmobiliarias
 * 
 * Genera URLs descriptivas del formato:
 * - venta-apartamento-pinares-pereira-3-habitaciones
 * - arriendo-casa-centro-pereira-4-habitaciones
 * - renta-corta-cabana-santa-rosa-vista-montana
 */

/**
 * Normaliza texto removiendo tildes y caracteres especiales
 * Convierte: "Pereira" → "pereira", "Bogotá" → "bogota"
 */
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres con tildes
    .replace(/[\u0300-\u036f]/g, '') // Elimina marcas diacríticas (tildes)
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
    .replace(/^-|-$/g, ''); // Elimina guiones al inicio/final
};

/**
 * Normaliza el tipo de operación para la URL
 * Convierte: "Arriendo tradicional" → "arriendo"
 * Convierte: "Arriendo renta corta" → "renta-corta"
 * Convierte: "Venta" → "venta"
 */
export const normalizeOperation = (operation: string): string => {
  const op = operation.toLowerCase();
  
  if (op.includes('renta corta') || op.includes('renta-corta')) {
    return 'renta-corta';
  }
  
  if (op.includes('arriendo')) {
    return 'arriendo';
  }
  
  if (op.includes('venta')) {
    return 'venta';
  }
  
  // Fallback: normalizar cualquier operación
  return normalizeText(operation);
};

/**
 * Normaliza el tipo de propiedad para la URL
 * Convierte: "Apartamento" → "apartamento"
 * Convierte: "Casa Campestre" → "casa-campestre"
 */
const normalizePropertyType = (type: string): string => {
  return normalizeText(type);
};

/**
 * Interfaz para los datos necesarios para generar el slug
 */
export interface PropertySlugData {
  operation: string; // "Venta", "Arriendo tradicional", "Arriendo renta corta"
  type: string; // "Apartamento", "Casa", "Cabaña", etc.
  neighborhood?: string; // "Pinares", "Centro", "Santa Rosa de Cabal"
  city: string; // "Pereira", "Dosquebradas", etc.
  bedrooms?: number; // 3, 4, etc.
  title?: string; // Título de la propiedad (usado como fallback)
}

/**
 * Genera un slug SEO-friendly para una propiedad
 * 
 * Ejemplos de salida:
 * - venta-apartamento-pinares-pereira-3-habitaciones
 * - arriendo-casa-centro-pereira-4-habitaciones
 * - renta-corta-cabana-santa-rosa-de-cabal-vista-montana
 * 
 * @param data Datos de la propiedad
 * @returns Slug optimizado para SEO
 */
export const generatePropertySlug = (data: PropertySlugData): string => {
  const parts: string[] = [];
  
  // 1. Operación (venta, arriendo, renta-corta)
  parts.push(normalizeOperation(data.operation));
  
  // 2. Tipo de propiedad (apartamento, casa, cabana)
  parts.push(normalizePropertyType(data.type));
  
  // 3. Barrio/Zona (si existe)
  if (data.neighborhood && data.neighborhood.trim()) {
    parts.push(normalizeText(data.neighborhood));
  }
  
  // 4. Ciudad
  parts.push(normalizeText(data.city));
  
  // 5. Número de habitaciones (si existe y es mayor a 0)
  if (data.bedrooms && data.bedrooms > 0) {
    parts.push(`${data.bedrooms}-habitaciones`);
  }
  
  // Unir todas las partes con guiones
  let slug = parts.filter(Boolean).join('-');
  
  // Si el slug está vacío o muy corto, usar el título como fallback
  if (!slug || slug.length < 5) {
    slug = data.title ? normalizeText(data.title) : 'propiedad';
  }
  
  // Limitar longitud máxima del slug (recomendado: 60-80 caracteres)
  if (slug.length > 80) {
    slug = slug.substring(0, 80).replace(/-[^-]*$/, ''); // Cortar en el último guion
  }
  
  return slug;
};

/**
 * Genera un slug único agregando un sufijo numérico si es necesario
 * Útil cuando ya existe un slug igual en la base de datos
 * 
 * @param baseSlug Slug base generado
 * @param existingSlugs Array de slugs que ya existen
 * @returns Slug único
 */
export const generateUniqueSlug = (
  baseSlug: string,
  existingSlugs: string[]
): string => {
  let slug = baseSlug;
  let counter = 1;
  
  // Si el slug ya existe, agregar sufijo numérico
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

/**
 * Extrae la operación desde un slug
 * Útil para routing y filtrado
 * 
 * @param slug Slug completo
 * @returns Operación normalizada ("venta", "arriendo", "renta-corta")
 */
export const extractOperationFromSlug = (slug: string): string | null => {
  const parts = slug.split('-');
  const firstPart = parts[0];
  
  if (firstPart === 'venta') return 'venta';
  if (firstPart === 'arriendo') return 'arriendo';
  if (firstPart === 'renta' && parts[1] === 'corta') return 'renta-corta';
  
  return null;
};

/**
 * Valida si un slug tiene el formato correcto
 * 
 * @param slug Slug a validar
 * @returns true si el slug es válido
 */
export const isValidSlug = (slug: string): boolean => {
  // Debe tener solo letras minúsculas, números y guiones
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  
  // Debe tener al menos 5 caracteres
  // No debe tener guiones consecutivos
  // No debe empezar ni terminar con guión
  return (
    slugRegex.test(slug) &&
    slug.length >= 5 &&
    slug.length <= 100 &&
    !slug.includes('--')
  );
};

/**
 * Convierte un slug a un título legible
 * Útil para breadcrumbs o títulos de página
 * 
 * @param slug Slug a convertir
 * @returns Título legible
 */
export const slugToTitle = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Genera una URL completa para una propiedad
 * 
 * @param operation Operación de la propiedad
 * @param slug Slug de la propiedad
 * @returns URL completa (ej: "/venta/apartamento-pinares-pereira-3-habitaciones")
 */
export const generatePropertyUrl = (operation: string, slug: string): string => {
  const normalizedOperation = normalizeOperation(operation);
  return `/${normalizedOperation}/${slug}`;
};

/**
 * Parsea una URL de propiedad y extrae operación y slug
 * 
 * @param url URL completa o pathname
 * @returns Objeto con operación y slug, o null si no es válida
 */
export const parsePropertyUrl = (
  url: string
): { operation: string; slug: string } | null => {
  // Limpiar la URL (remover dominio si existe)
  const pathname = url.includes('://') ? new URL(url).pathname : url;
  
  // Formato esperado: /operacion/slug
  const match = pathname.match(/^\/(venta|arriendo|renta-corta)\/([a-z0-9-]+)$/);
  
  if (!match) return null;
  
  return {
    operation: match[1],
    slug: match[2],
  };
};