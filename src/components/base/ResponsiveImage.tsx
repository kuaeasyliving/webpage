/**
 * ResponsiveImage — Progressive blur-up loading
 *
 * Técnica "blur-up" (usada por Medium, Next.js Image, Gatsby):
 *  1. Muestra el placeholder (imagen ~2-4KB) con blur intenso
 *  2. Carga la imagen real en segundo plano
 *  3. Hace crossfade suave: placeholder borroso → imagen nítida
 *
 * No hay spinner — el blur es el indicador de carga.
 * GPU-accelerated via will-change: opacity + transform (translate3d).
 */

import { useState, useRef, useEffect, useCallback } from 'react';

export interface ResponsiveImageProps {
  thumbnail: string;
  medium: string;
  large: string;
  placeholder: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  objectPosition?: string;
}

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
  objectPosition = 'center',
}: ResponsiveImageProps) {
  const [stage, setStage] = useState<'placeholder' | 'loading' | 'loaded'>(
    priority ? 'loading' : 'placeholder'
  );
  const [placeholderError, setPlaceholderError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainImgRef = useRef<HTMLImageElement>(null);

  const handleMainLoad = useCallback(() => {
    setStage('loaded');
    onLoad?.();
  }, [onLoad]);

  // IntersectionObserver para lazy-load real (mejor que loading="lazy" nativo)
  useEffect(() => {
    if (priority || stage !== 'placeholder') return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStage('loading');
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' } // Precargar 200px antes de que entre en viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [priority, stage]);

  // Si la imagen ya está en caché, detectarlo rápido
  useEffect(() => {
    if (stage === 'loading' && mainImgRef.current?.complete && mainImgRef.current?.naturalWidth > 0) {
      setStage('loaded');
      onLoad?.();
    }
  }, [stage, onLoad]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ isolation: 'isolate' }}
    >
      {/* ① Placeholder blur — siempre presente en el DOM para el crossfade */}
      {!placeholderError ? (
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          onError={() => setPlaceholderError(true)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition,
            filter: 'blur(20px)',
            transform: 'scale(1.08)', // evita bordes borrosos
            willChange: 'opacity',
            opacity: stage === 'loaded' ? 0 : 1,
            transition: 'opacity 600ms ease',
          }}
        />
      ) : (
        /* Fallback: skeleton si el placeholder falla */
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"
          style={{
            opacity: stage === 'loaded' ? 0 : 1,
            transition: 'opacity 600ms ease',
          }}
        />
      )}

      {/* ② Imagen principal — carga progresiva con fade-in */}
      {stage !== 'placeholder' && (
        <img
          ref={mainImgRef}
          src={medium}
          srcSet={`${thumbnail} 400w, ${medium} 800w, ${large} 1600w`}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={handleMainLoad}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition,
            willChange: 'opacity',
            opacity: stage === 'loaded' ? 1 : 0,
            transition: 'opacity 600ms ease',
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   SimpleResponsiveImage — para imágenes sin
   versiones optimizadas (compat. con antiguas)
───────────────────────────────────────── */
export function SimpleResponsiveImage({
  src,
  alt,
  className = '',
  priority = false,
  onLoad,
  objectPosition = 'center',
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  objectPosition?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [started, setStarted] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority || started) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [priority, started]);

  useEffect(() => {
    if (started && imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setLoaded(true);
      onLoad?.();
    }
  }, [started, onLoad]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Skeleton */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"
        style={{
          opacity: loaded ? 0 : 1,
          transition: 'opacity 500ms ease',
        }}
      />

      {started && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => { setLoaded(true); onLoad?.(); }}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 500ms ease',
            willChange: 'opacity',
          }}
        />
      )}
    </div>
  );
}
