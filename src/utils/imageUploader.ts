/**
 * Utilidad para subir imágenes optimizadas a Supabase Storage
 *
 * BUCKET: "property-images" (público, ya existe en Supabase)
 * - Sube 4 versiones por imagen: thumbnail, medium, large, placeholder
 * - Organiza las imágenes en carpetas por propiedad
 * - Retorna las URLs públicas de todas las versiones
 */

import { supabase } from '../lib/supabase';
import { OptimizedImage } from './imageOptimizer';

// ─── Constante centralizada del bucket ───────────────────────────────────────
// Cambiar aquí si alguna vez se renombra el bucket en Supabase
export const STORAGE_BUCKET = 'property-images' as const;

// ─── Tipos ───────────────────────────────────────────────────────────────────
export interface UploadedImageUrls {
  thumbnail: string;
  medium: string;
  large: string;
  placeholder: string;
}

// ─── Helpers privados ────────────────────────────────────────────────────────

/**
 * Genera un nombre BASE único compartido para las 4 versiones de una imagen.
 * Formato: {nombreLimpio}-{timestamp}-{random}
 * Cada versión agrega su sufijo: -thumbnail.webp, -medium.webp, etc.
 */
const generateBaseFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const cleanName = originalName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .substring(0, 30);
  return `${cleanName}-${timestamp}-${random}`;
};

/**
 * Sube un blob al bucket de Supabase Storage.
 * Retorna la URL pública del archivo subido.
 *
 * @throws {Error} Si el bucket no existe o si hay un error de permisos/red
 */
const uploadImageBlob = async (
  blob: Blob,
  fileName: string,
  propertyId?: string
): Promise<string> => {
  const folder = propertyId ? `properties/${propertyId}` : 'properties/temp';
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, blob, {
      contentType: 'image/webp',
      cacheControl: '31536000', // Cache por 1 año
      upsert: true,             // upsert:true evita el error "already exists"
    });

  if (uploadError) {
    // Mensaje descriptivo para facilitar el diagnóstico
    console.error(`[Storage] Error subiendo "${filePath}" al bucket "${STORAGE_BUCKET}":`, uploadError);
    throw new Error(
      `No se pudo subir la imagen "${fileName}". ` +
      `Bucket: "${STORAGE_BUCKET}". ` +
      `Detalle: ${uploadError.message}`
    );
  }

  // Obtener URL pública
  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

  return publicUrl;
};

// ─── API pública ─────────────────────────────────────────────────────────────

/**
 * Sube todas las versiones de una imagen optimizada al bucket.
 * Retorna un objeto con las URLs públicas de las 4 versiones.
 */
export const uploadOptimizedImage = async (
  optimizedImage: OptimizedImage,
  propertyId?: string,
  onProgress?: (progress: number) => void
): Promise<UploadedImageUrls> => {
  // Nombre base compartido → las 4 versiones son reconstruibles
  const baseName = generateBaseFileName(optimizedImage.originalName);

  onProgress?.(10);
  const thumbnailUrl = await uploadImageBlob(
    optimizedImage.thumbnail,
    `${baseName}-thumbnail.webp`,
    propertyId
  );

  onProgress?.(40);
  const mediumUrl = await uploadImageBlob(
    optimizedImage.medium,
    `${baseName}-medium.webp`,
    propertyId
  );

  onProgress?.(70);
  const largeUrl = await uploadImageBlob(
    optimizedImage.large,
    `${baseName}-large.webp`,
    propertyId
  );

  onProgress?.(90);
  const placeholderUrl = await uploadImageBlob(
    optimizedImage.placeholder,
    `${baseName}-placeholder.webp`,
    propertyId
  );

  onProgress?.(100);

  return { thumbnail: thumbnailUrl, medium: mediumUrl, large: largeUrl, placeholder: placeholderUrl };
};

/**
 * Sube múltiples imágenes optimizadas en secuencia.
 */
export const uploadOptimizedImages = async (
  optimizedImages: OptimizedImage[],
  propertyId?: string,
  onProgress?: (imageIndex: number, progress: number) => void
): Promise<UploadedImageUrls[]> => {
  const results: UploadedImageUrls[] = [];

  for (let i = 0; i < optimizedImages.length; i++) {
    const urls = await uploadOptimizedImage(
      optimizedImages[i],
      propertyId,
      (progress) => onProgress?.(i, progress)
    );
    results.push(urls);
  }

  return results;
};

/**
 * Elimina una imagen y todas sus versiones de Supabase Storage.
 * No lanza error si el archivo no existe o la URL es inválida.
 */
export const deleteImageFromStorage = async (imageUrl: string): Promise<void> => {
  try {
    const url = new URL(imageUrl);
    // La ruta del objeto está después del nombre del bucket en la URL pública
    const marker = `/${STORAGE_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return;

    const filePath = url.pathname.substring(markerIndex + marker.length);

    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);

    if (error) {
      console.warn(`[Storage] No se pudo eliminar "${filePath}":`, error.message);
    }
  } catch (err) {
    console.warn('[Storage] Error en deleteImageFromStorage:', err);
  }
};

/**
 * Elimina múltiples imágenes de Supabase Storage.
 */
export const deleteImagesFromStorage = async (imageUrls: string[]): Promise<void> => {
  await Promise.allSettled(imageUrls.map(deleteImageFromStorage));
};

/**
 * Verifica que el bucket esté accesible desde el cliente actual.
 * Usa list() en lugar de getBucket() porque getBucket() requiere
 * service role key y siempre falla desde el frontend.
 * Retorna true si el bucket es accesible, false si hay un error.
 */
export const verifyStorageBucket = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', { limit: 1 });

    if (error) {
      console.error(`[Storage] Bucket "${STORAGE_BUCKET}" no accesible:`, error.message);
      return false;
    }
    console.info(`[Storage] Bucket "${STORAGE_BUCKET}" verificado correctamente.`);
    return true;
  } catch (err) {
    console.error('[Storage] Error verificando bucket:', err);
    return false;
  }
};
