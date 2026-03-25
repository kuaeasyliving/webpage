/**
 * Utilidades para trabajar con URLs de imágenes optimizadas
 *
 * Formato de URL esperado (sistema nuevo):
 *   {base}-{timestamp}-{random}-thumbnail.webp
 *   {base}-{timestamp}-{random}-medium.webp
 *   {base}-{timestamp}-{random}-large.webp
 *   {base}-{timestamp}-{random}-placeholder.webp
 *
 * Las 4 versiones comparten el mismo prefijo, por lo que son
 * reconstruibles a partir de cualquiera de ellas.
 */

export interface ImageVersions {
  thumbnail: string;
  medium: string;
  large: string;
  placeholder: string;
}

/**
 * Detecta si una URL pertenece al sistema de imágenes optimizadas
 * (nuevo formato con nombre base compartido).
 */
export const hasOptimizedVersions = (imageUrl: string): boolean => {
  if (!imageUrl) return false;
  return /-(thumbnail|medium|large|placeholder)\.webp(\?.*)?$/.test(imageUrl);
};

/**
 * Extrae la URL base (sin el sufijo de tamaño) para poder
 * reconstruir las 4 versiones de la imagen.
 *
 * Funciona con el nuevo formato:  nombre-ts-rnd-{size}.webp
 * Para imágenes antiguas sin versiones devuelve null.
 */
export const getImageVersions = (imageUrl: string): ImageVersions | null => {
  if (!imageUrl) return null;

  // Detectar el sufijo de tamaño al final (antes de .webp y posibles query params)
  const match = imageUrl.match(/^(.*?)-(thumbnail|medium|large|placeholder)(\.webp)(\?.*)?$/);
  if (!match) return null;

  const baseUrl = match[1];   // todo antes del sufijo de tamaño
  const ext = match[3];       // .webp
  const query = match[4] || ''; // query params opcionales

  return {
    thumbnail: `${baseUrl}-thumbnail${ext}${query}`,
    medium:    `${baseUrl}-medium${ext}${query}`,
    large:     `${baseUrl}-large${ext}${query}`,
    placeholder: `${baseUrl}-placeholder${ext}${query}`,
  };
};

/**
 * Versión medium de una imagen (la más usada en páginas de detalle).
 * Retorna la URL original si no tiene versiones optimizadas.
 */
export const getMediumVersion = (imageUrl: string): string => {
  const versions = getImageVersions(imageUrl);
  return versions ? versions.medium : imageUrl;
};

/**
 * Versión thumbnail de una imagen (listados de propiedades).
 * Retorna la URL original si no tiene versiones optimizadas.
 */
export const getThumbnailVersion = (imageUrl: string): string => {
  const versions = getImageVersions(imageUrl);
  return versions ? versions.thumbnail : imageUrl;
};

/**
 * Versión large de una imagen (galerías / vista ampliada).
 * Retorna la URL original si no tiene versiones optimizadas.
 */
export const getLargeVersion = (imageUrl: string): string => {
  const versions = getImageVersions(imageUrl);
  return versions ? versions.large : imageUrl;
};

/**
 * URL del placeholder (blur effect durante la carga).
 * Retorna la URL original si no tiene versiones optimizadas.
 */
export const getPlaceholderVersion = (imageUrl: string): string => {
  const versions = getImageVersions(imageUrl);
  return versions ? versions.placeholder : imageUrl;
};

/**
 * Convierte un array de URLs a un array con las versiones optimizadas disponibles.
 */
export const convertToOptimizedImages = (imageUrls: string[]): Array<ImageVersions | string> => {
  return imageUrls.map(url => getImageVersions(url) || url);
};

/**
 * Verifica si una propiedad tiene al menos una imagen con versiones optimizadas.
 */
export const propertyHasOptimizedImages = (images: string[]): boolean => {
  if (!images || images.length === 0) return false;
  return hasOptimizedVersions(images[0]);
};
