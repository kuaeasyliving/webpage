/**
 * Sistema de optimización automática de imágenes
 * 
 * Funcionalidades:
 * - Compresión automática de imágenes usando browser-image-compression
 * - Conversión a WebP
 * - Generación de múltiples tamaños (thumbnail, medium, large)
 * - Soporte para HEIC/HEIF/JPG/PNG
 * - Validación de tamaño y formato
 */

import imageCompression from 'browser-image-compression';

// Configuración de tamaños de imagen
export const IMAGE_SIZES = {
  thumbnail: 400,
  medium: 800,
  large: 1600,
  placeholder: 20, // Mini imagen para blur effect
} as const;

// Configuración de calidad de compresión
export const COMPRESSION_QUALITY = {
  webp: 0.85,
  jpeg: 0.85,
  placeholder: 0.3,
} as const;

// Tamaño máximo de archivo antes de optimización (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Formatos de imagen soportados
export const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

export interface OptimizedImage {
  thumbnail: Blob;
  medium: Blob;
  large: Blob;
  placeholder: Blob;
  originalName: string;
}

export interface OptimizationProgress {
  stage: 'validating' | 'converting' | 'resizing' | 'compressing' | 'complete';
  progress: number;
  message: string;
}

/**
 * Valida si el archivo es una imagen válida
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Validar tipo de archivo
  const fileType = file.type.toLowerCase();
  const isSupported = SUPPORTED_FORMATS.some(format => fileType.includes(format.split('/')[1]));
  
  if (!isSupported && !file.name.toLowerCase().match(/\.(heic|heif)$/)) {
    return {
      valid: false,
      error: 'Formato no soportado. Use JPG, PNG, WebP, HEIC o HEIF',
    };
  }

  return { valid: true };
};

/**
 * Convierte una imagen a WebP usando canvas
 */
const convertToWebP = async (file: File, maxWidth: number, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calcular nuevas dimensiones manteniendo proporción
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      // Crear canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo crear el contexto del canvas'));
        return;
      }

      // Configurar para mejor calidad
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a blob WebP
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Error al crear el blob de la imagen'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Error al cargar la imagen'));
    };

    img.src = url;
  });
};

/**
 * Comprime y redimensiona una imagen usando browser-image-compression
 */
const compressImage = async (
  file: File,
  maxWidthOrHeight: number,
  quality: number
): Promise<Blob> => {
  try {
    const options = {
      maxWidthOrHeight,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: quality,
      alwaysKeepResolution: false,
    };

    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error comprimiendo con browser-image-compression:', error);
    // Fallback a conversión manual con canvas
    return convertToWebP(file, maxWidthOrHeight, quality);
  }
};

/**
 * Genera un placeholder borroso de baja resolución
 */
const generatePlaceholder = async (file: File): Promise<Blob> => {
  try {
    const options = {
      maxWidthOrHeight: IMAGE_SIZES.placeholder,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: COMPRESSION_QUALITY.placeholder,
    };

    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error generando placeholder:', error);
    // Fallback a conversión manual
    return convertToWebP(file, IMAGE_SIZES.placeholder, COMPRESSION_QUALITY.placeholder);
  }
};

/**
 * Optimiza una imagen generando múltiples versiones
 */
export const optimizeImage = async (
  file: File,
  onProgress?: (progress: OptimizationProgress) => void
): Promise<OptimizedImage> => {
  try {
    // 1. Validar archivo
    onProgress?.({
      stage: 'validating',
      progress: 10,
      message: 'Validando imagen...',
    });

    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 2. Procesar formato
    onProgress?.({
      stage: 'converting',
      progress: 20,
      message: 'Procesando formato...',
    });

    // browser-image-compression maneja automáticamente HEIC y otros formatos

    // 3. Generar versión thumbnail
    onProgress?.({
      stage: 'compressing',
      progress: 35,
      message: 'Generando thumbnail...',
    });

    const thumbnail = await compressImage(
      file,
      IMAGE_SIZES.thumbnail,
      COMPRESSION_QUALITY.webp
    );

    // 4. Generar versión medium
    onProgress?.({
      stage: 'compressing',
      progress: 55,
      message: 'Generando versión media...',
    });

    const medium = await compressImage(
      file,
      IMAGE_SIZES.medium,
      COMPRESSION_QUALITY.webp
    );

    // 5. Generar versión large
    onProgress?.({
      stage: 'compressing',
      progress: 75,
      message: 'Generando versión grande...',
    });

    const large = await compressImage(
      file,
      IMAGE_SIZES.large,
      COMPRESSION_QUALITY.webp
    );

    // 6. Generar placeholder
    onProgress?.({
      stage: 'compressing',
      progress: 90,
      message: 'Generando placeholder...',
    });

    const placeholder = await generatePlaceholder(file);

    // 7. Completado
    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Optimización completada',
    });

    return {
      thumbnail,
      medium,
      large,
      placeholder,
      originalName: file.name,
    };
  } catch (error) {
    console.error('Error optimizando imagen:', error);
    throw error;
  }
};

/**
 * Optimiza múltiples imágenes en lote
 */
export const optimizeImages = async (
  files: File[],
  onProgress?: (index: number, progress: OptimizationProgress) => void
): Promise<OptimizedImage[]> => {
  const results: OptimizedImage[] = [];

  for (let i = 0; i < files.length; i++) {
    const optimized = await optimizeImage(files[i], (progress) => {
      onProgress?.(i, progress);
    });
    results.push(optimized);
  }

  return results;
};

/**
 * Calcula el tamaño total de las imágenes optimizadas
 */
export const calculateOptimizedSize = (optimized: OptimizedImage): number => {
  return (
    optimized.thumbnail.size +
    optimized.medium.size +
    optimized.large.size +
    optimized.placeholder.size
  );
};

/**
 * Formatea el tamaño de archivo para mostrar al usuario
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Calcula el porcentaje de reducción de tamaño
 */
export const calculateCompressionRatio = (
  originalSize: number,
  optimizedSize: number
): number => {
  return Math.round(((originalSize - optimizedSize) / originalSize) * 100);
};