/**
 * Hook personalizado para gestionar la optimización y subida de imágenes
 * 
 * Proporciona una interfaz simple para:
 * - Optimizar imágenes automáticamente
 * - Subir imágenes optimizadas a Supabase
 * - Mostrar progreso de optimización y subida
 * - Manejar errores
 */

import { useState, useCallback } from 'react';
import {
  optimizeImage,
  OptimizedImage,
  OptimizationProgress,
  formatFileSize,
  calculateOptimizedSize,
  calculateCompressionRatio,
} from '../utils/imageOptimizer';
import {
  uploadOptimizedImage,
  UploadedImageUrls,
} from '../utils/imageUploader';

export interface ImageProcessingState {
  isProcessing: boolean;
  currentFile: string | null;
  progress: number;
  stage: string;
  error: string | null;
  optimizedImages: OptimizedImage[];
  uploadedUrls: UploadedImageUrls[];
}

export interface CompressionStats {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  originalSizeFormatted: string;
  optimizedSizeFormatted: string;
}

export const useImageOptimization = () => {
  const [state, setState] = useState<ImageProcessingState>({
    isProcessing: false,
    currentFile: null,
    progress: 0,
    stage: '',
    error: null,
    optimizedImages: [],
    uploadedUrls: [],
  });

  /**
   * Optimiza una sola imagen
   */
  const optimizeSingleImage = useCallback(
    async (file: File): Promise<OptimizedImage | null> => {
      try {
        setState((prev) => ({
          ...prev,
          isProcessing: true,
          currentFile: file.name,
          error: null,
        }));

        const optimized = await optimizeImage(file, (progress: OptimizationProgress) => {
          setState((prev) => ({
            ...prev,
            progress: progress.progress,
            stage: progress.message,
          }));
        });

        setState((prev) => ({
          ...prev,
          optimizedImages: [...prev.optimizedImages, optimized],
          isProcessing: false,
          currentFile: null,
          progress: 0,
          stage: '',
        }));

        return optimized;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          error: errorMessage,
          currentFile: null,
        }));
        return null;
      }
    },
    []
  );

  /**
   * Optimiza múltiples imágenes
   */
  const optimizeMultipleImages = useCallback(
    async (files: File[]): Promise<OptimizedImage[]> => {
      const results: OptimizedImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setState((prev) => ({
          ...prev,
          isProcessing: true,
          currentFile: `${file.name} (${i + 1}/${files.length})`,
          error: null,
        }));

        try {
          const optimized = await optimizeImage(file, (progress: OptimizationProgress) => {
            const overallProgress = ((i / files.length) * 100) + (progress.progress / files.length);
            setState((prev) => ({
              ...prev,
              progress: Math.round(overallProgress),
              stage: progress.message,
            }));
          });

          results.push(optimized);
        } catch (error) {
          console.error(`Error optimizando ${file.name}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          setState((prev) => ({
            ...prev,
            error: `Error en ${file.name}: ${errorMessage}`,
          }));
        }
      }

      setState((prev) => ({
        ...prev,
        optimizedImages: [...prev.optimizedImages, ...results],
        isProcessing: false,
        currentFile: null,
        progress: 0,
        stage: '',
      }));

      return results;
    },
    []
  );

  /**
   * Sube una imagen optimizada a Supabase
   */
  const uploadSingleImage = useCallback(
    async (
      optimizedImage: OptimizedImage,
      propertyId?: string
    ): Promise<UploadedImageUrls | null> => {
      try {
        setState((prev) => ({
          ...prev,
          isProcessing: true,
          currentFile: optimizedImage.originalName,
          error: null,
        }));

        const urls = await uploadOptimizedImage(
          optimizedImage,
          propertyId,
          (progress: number) => {
            setState((prev) => ({
              ...prev,
              progress,
              stage: 'Subiendo imagen...',
            }));
          }
        );

        setState((prev) => ({
          ...prev,
          uploadedUrls: [...prev.uploadedUrls, urls],
          isProcessing: false,
          currentFile: null,
          progress: 0,
          stage: '',
        }));

        return urls;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          error: errorMessage,
          currentFile: null,
        }));
        return null;
      }
    },
    []
  );

  /**
   * Optimiza y sube una imagen en un solo paso
   */
  const processAndUploadImage = useCallback(
    async (file: File, propertyId?: string): Promise<UploadedImageUrls | null> => {
      const optimized = await optimizeSingleImage(file);
      if (!optimized) return null;

      return await uploadSingleImage(optimized, propertyId);
    },
    [optimizeSingleImage, uploadSingleImage]
  );

  /**
   * Optimiza y sube múltiples imágenes
   */
  const processAndUploadMultipleImages = useCallback(
    async (files: File[], propertyId?: string): Promise<UploadedImageUrls[]> => {
      const results: UploadedImageUrls[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const urls = await processAndUploadImage(file, propertyId);
        if (urls) {
          results.push(urls);
        }
      }

      return results;
    },
    [processAndUploadImage]
  );

  /**
   * Calcula estadísticas de compresión
   */
  const getCompressionStats = useCallback(
    (originalFile: File, optimizedImage: OptimizedImage): CompressionStats => {
      const originalSize = originalFile.size;
      const optimizedSize = calculateOptimizedSize(optimizedImage);
      const compressionRatio = calculateCompressionRatio(originalSize, optimizedSize);

      return {
        originalSize,
        optimizedSize,
        compressionRatio,
        originalSizeFormatted: formatFileSize(originalSize),
        optimizedSizeFormatted: formatFileSize(optimizedSize),
      };
    },
    []
  );

  /**
   * Limpia el estado
   */
  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      currentFile: null,
      progress: 0,
      stage: '',
      error: null,
      optimizedImages: [],
      uploadedUrls: [],
    });
  }, []);

  /**
   * Limpia solo el error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // Estado
    isProcessing: state.isProcessing,
    currentFile: state.currentFile,
    progress: state.progress,
    stage: state.stage,
    error: state.error,
    optimizedImages: state.optimizedImages,
    uploadedUrls: state.uploadedUrls,

    // Métodos
    optimizeSingleImage,
    optimizeMultipleImages,
    uploadSingleImage,
    processAndUploadImage,
    processAndUploadMultipleImages,
    getCompressionStats,
    reset,
    clearError,
  };
};