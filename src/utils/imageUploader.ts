/**
 * Utilidad para subir imágenes optimizadas a Supabase Storage
 * 
 * Funcionalidades:
 * - Sube múltiples versiones de cada imagen (thumbnail, medium, large, placeholder)
 * - Organiza las imágenes en carpetas por propiedad
 * - Retorna las URLs públicas de todas las versiones
 */

import { supabase } from '../lib/supabase';
import { OptimizedImage } from './imageOptimizer';

export interface UploadedImageUrls {
  thumbnail: string;
  medium: string;
  large: string;
  placeholder: string;
}

/**
 * Genera un nombre único para el archivo
 */
const generateUniqueFileName = (originalName: string, size: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const extension = 'webp'; // Todas las imágenes optimizadas son WebP
  const cleanName = originalName
    .replace(/\.[^/.]+$/, '') // Remover extensión original
    .replace(/[^a-zA-Z0-9]/g, '-') // Reemplazar caracteres especiales
    .toLowerCase()
    .substring(0, 30); // Limitar longitud
  
  return `${cleanName}-${size}-${timestamp}-${random}.${extension}`;
};

/**
 * Sube una imagen optimizada a Supabase Storage
 */
const uploadImageBlob = async (
  blob: Blob,
  fileName: string,
  propertyId?: string
): Promise<string> => {
  try {
    // Construir la ruta del archivo
    const folder = propertyId ? `properties/${propertyId}` : 'properties/temp';
    const filePath = `${folder}/${fileName}`;

    // Subir el archivo
    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, blob, {
        contentType: 'image/webp',
        cacheControl: '31536000', // Cache por 1 año
        upsert: false,
      });

    if (uploadError) {
      console.error('Error subiendo imagen:', uploadError);
      throw uploadError;
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error en uploadImageBlob:', error);
    throw error;
  }
};

/**
 * Sube todas las versiones de una imagen optimizada
 */
export const uploadOptimizedImage = async (
  optimizedImage: OptimizedImage,
  propertyId?: string,
  onProgress?: (progress: number) => void
): Promise<UploadedImageUrls> => {
  try {
    const baseName = optimizedImage.originalName;

    // Subir thumbnail (25%)
    onProgress?.(25);
    const thumbnailUrl = await uploadImageBlob(
      optimizedImage.thumbnail,
      generateUniqueFileName(baseName, 'thumbnail'),
      propertyId
    );

    // Subir medium (50%)
    onProgress?.(50);
    const mediumUrl = await uploadImageBlob(
      optimizedImage.medium,
      generateUniqueFileName(baseName, 'medium'),
      propertyId
    );

    // Subir large (75%)
    onProgress?.(75);
    const largeUrl = await uploadImageBlob(
      optimizedImage.large,
      generateUniqueFileName(baseName, 'large'),
      propertyId
    );

    // Subir placeholder (100%)
    onProgress?.(100);
    const placeholderUrl = await uploadImageBlob(
      optimizedImage.placeholder,
      generateUniqueFileName(baseName, 'placeholder'),
      propertyId
    );

    return {
      thumbnail: thumbnailUrl,
      medium: mediumUrl,
      large: largeUrl,
      placeholder: placeholderUrl,
    };
  } catch (error) {
    console.error('Error subiendo imagen optimizada:', error);
    throw error;
  }
};

/**
 * Sube múltiples imágenes optimizadas
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
 * Elimina una imagen y todas sus versiones de Supabase Storage
 */
export const deleteImageFromStorage = async (imageUrl: string): Promise<void> => {
  try {
    // Extraer la ruta del archivo de la URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/property-images/');
    if (pathParts.length < 2) return;

    const filePath = pathParts[1];

    // Eliminar el archivo
    const { error } = await supabase.storage
      .from('property-images')
      .remove([filePath]);

    if (error) {
      console.error('Error eliminando imagen:', error);
    }
  } catch (error) {
    console.error('Error en deleteImageFromStorage:', error);
  }
};

/**
 * Elimina múltiples imágenes de Supabase Storage
 */
export const deleteImagesFromStorage = async (imageUrls: string[]): Promise<void> => {
  for (const url of imageUrls) {
    await deleteImageFromStorage(url);
  }
};