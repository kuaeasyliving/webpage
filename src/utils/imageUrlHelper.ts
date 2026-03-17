/**
 * Utilidades para trabajar con URLs de imágenes optimizadas
 * 
 * Ayuda a extraer las diferentes versiones de imágenes desde las URLs
 * almacenadas en Supabase Storage
 */

export interface ImageVersions {
  thumbnail: string;
  medium: string;
  large: string;
  placeholder: string;
}

/**
 * Detecta si una URL de imagen tiene versiones optimizadas
 * Las imágenes optimizadas tienen sufijos como -thumbnail, -medium, -large, -placeholder
 */
export const hasOptimizedVersions = (imageUrl: string): boolean => {
  return imageUrl.includes('-thumbnail') || 
         imageUrl.includes('-medium') || 
         imageUrl.includes('-large') ||
         imageUrl.includes('-placeholder');
};

/**
 * Extrae todas las versiones de una imagen optimizada
 * Si la URL es de una versión específica, genera las URLs de las otras versiones
 */
export const getImageVersions = (imageUrl: string): ImageVersions | null => {
  if (!imageUrl) return null;

  // Si la imagen tiene versiones optimizadas
  if (hasOptimizedVersions(imageUrl)) {
    // Extraer la base de la URL (sin el sufijo de tamaño)
    const baseUrl = imageUrl
      .replace(/-thumbnail-/, '-SIZE-')
      .replace(/-medium-/, '-SIZE-')
      .replace(/-large-/, '-SIZE-')
      .replace(/-placeholder-/, '-SIZE-');

    return {
      thumbnail: baseUrl.replace('-SIZE-', '-thumbnail-'),
      medium: baseUrl.replace('-SIZE-', '-medium-'),
      large: baseUrl.replace('-SIZE-', '-large-'),
      placeholder: baseUrl.replace('-SIZE-', '-placeholder-'),
    };
  }

  // Si es una imagen antigua sin optimización, retornar null
  return null;
};

/**
 * Obtiene la versión medium de una imagen (la más común para mostrar)
 * Si no tiene versiones optimizadas, retorna la URL original
 */
export const getMediumVersion = (imageUrl: string): string => {
  const versions = getImageVersions(imageUrl);
  return versions ? versions.medium : imageUrl;
};

/**
 * Obtiene la versión thumbnail de una imagen (para listados)
 * Si no tiene versiones optimizadas, retorna la URL original
 */
export const getThumbnailVersion = (imageUrl: string): string => {
  const versions = getImageVersions(imageUrl);
  return versions ? versions.thumbnail : imageUrl;
};

/**
 * Obtiene la versión large de una imagen (para galerías)
 * Si no tiene versiones optimizadas, retorna la URL original
 */
export const getLargeVersion = (imageUrl: string): string => {
  const versions = getImageVersions(imageUrl);
  return versions ? versions.large : imageUrl;
};

/**
 * Obtiene el placeholder de una imagen (para blur effect)
 * Si no tiene versiones optimizadas, retorna la URL original
 */
export const getPlaceholderVersion = (imageUrl: string): string => {
  const versions = getImageVersions(imageUrl);
  return versions ? versions.placeholder : imageUrl;
};

/**
 * Convierte un array de URLs de imágenes a un array de versiones optimizadas
 * Útil para procesar las imágenes de una propiedad
 */
export const convertToOptimizedImages = (imageUrls: string[]): Array<ImageVersions | string> => {
  return imageUrls.map(url => {
    const versions = getImageVersions(url);
    return versions || url;
  });
};

/**
 * Verifica si una propiedad tiene imágenes optimizadas
 */
export const propertyHasOptimizedImages = (images: string[]): boolean => {
  if (!images || images.length === 0) return false;
  return hasOptimizedVersions(images[0]);
};