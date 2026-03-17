/**
 * Componente de imagen responsiva optimizada
 * 
 * Características:
 * - Carga automática de la versión óptima según el tamaño de pantalla
 * - Lazy loading nativo del navegador
 * - Placeholder blur effect durante la carga
 * - Soporte para srcset y sizes
 * - Optimización automática de rendimiento
 */

import { useState, useEffect } from 'react';

export interface ResponsiveImageProps {
  /** URL de la imagen thumbnail (400px) */
  thumbnail: string;
  /** URL de la imagen medium (800px) */
  medium: string;
  /** URL de la imagen large (1600px) */
  large: string;
  /** URL del placeholder blur (muy ligero, 1-3KB) */
  placeholder: string;
  /** Texto alternativo para accesibilidad */
  alt: string;
  /** Clases CSS adicionales */
  className?: string;
  /** Atributo sizes para responsive images */
  sizes?: string;
  /** Prioridad de carga (true = eager, false = lazy) */
  priority?: boolean;
  /** Callback cuando la imagen se carga completamente */
  onLoad?: () => void;
}

/**
 * Componente de imagen responsiva con optimización automática
 */
export default function ResponsiveImage({
  thumbnail,
  medium,
  large,
  placeholder,
  alt,
  className = '',
  sizes = '(max-width: 640px) 400px, (max-width: 1024px) 800px, 1600px',
  priority = false,
  onLoad,
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);

  useEffect(() => {
    // Precargar la imagen si es prioritaria
    if (priority) {
      const img = new Image();
      img.src = medium;
      img.onload = () => {
        setCurrentSrc(medium);
        setIsLoaded(true);
        onLoad?.();
      };
    }
  }, [priority, medium, onLoad]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder blur (se muestra mientras carga) */}
      {!isLoaded && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Imagen principal con srcset responsivo */}
      <img
        src={medium}
        srcSet={`${thumbnail} 400w, ${medium} 800w, ${large} 1600w`}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        decoding="async"
      />

      {/* Indicador de carga */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
          <div className="w-8 h-8 border-3 border-gray-300 border-t-[#d4816f] rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

/**
 * Componente simplificado para imágenes que solo tienen una URL
 * (para compatibilidad con imágenes antiguas que no tienen múltiples versiones)
 */
export function SimpleResponsiveImage({
  src,
  alt,
  className = '',
  priority = false,
  onLoad,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder mientras carga */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse">
          <div className="w-full h-full flex items-center justify-center">
            <i className="ri-image-line text-gray-300 text-4xl"></i>
          </div>
        </div>
      )}

      {/* Imagen */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        decoding="async"
      />
    </div>
  );
}