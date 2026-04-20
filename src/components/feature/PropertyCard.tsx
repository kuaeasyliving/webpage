/**
 * PropertyCard — tarjeta de propiedad reutilizable
 *
 * Usada en:
 *  - FeaturedProperties (scroll horizontal, tamaño fijo)
 *  - Properties page (grid, ancho completo)
 *  - Related properties en el detalle (tamaño pequeño)
 *
 * Variantes:
 *  - "horizontal-scroll" : ancho fijo 288px/320px, para carruseles
 *  - "grid"              : ancho 100%, para grids 3 columnas
 *  - "related"           : tarjeta compacta para inmuebles similares
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ResponsiveImage, { SimpleResponsiveImage } from '../base/ResponsiveImage';
import { getImageVersions } from '../../utils/imageUrlHelper';
import { normalizeOperation } from '../../utils/slugGenerator';
import { formatPriceSupabase } from '../../hooks/useProperties';
import type { Property } from '../../lib/supabase';

type CardVariant = 'horizontal-scroll' | 'grid' | 'related';

interface PropertyCardProps {
  property: Property;
  index?: number;
  variant?: CardVariant;
  animate?: boolean;
}

const OPERATION_COLORS: Record<string, string> = {
  'arriendo-tradicional': 'bg-emerald-500 text-white',
  'arriendo-renta-corta': 'bg-sky-500 text-white',
  'arriendo renta corta': 'bg-sky-500 text-white',
  'renta-corta': 'bg-sky-500 text-white',
  'venta': 'bg-rose-700 text-white',
  default: 'bg-rose-700 text-white',
};

const OPERATION_LABELS: Record<string, string> = {
  'arriendo-renta-corta': 'Renta Corta',
  'arriendo-tradicional': 'Renta Tradicional',
  'venta': 'Venta',
};

function getOperationColor(operation: string): string {
  const key = operation.toLowerCase().replace(/\s+/g, '-');
  return OPERATION_COLORS[key] || OPERATION_COLORS[key.split('-')[0]] || OPERATION_COLORS.default;
}

function formatOperationLabel(operation: string): string {
  const key = operation.toLowerCase().replace(/\s+/g, '-');
  if (OPERATION_LABELS[key]) return OPERATION_LABELS[key];
  // fallback: capitalize each word
  return operation.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTypeLabel(type: string): string {
  return type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getPropertyUrl(property: Property): string {
  if (!property.slug) return `/inmuebles/${property.id}`;
  return `/${normalizeOperation(property.operation)}/${property.slug}`;
}

function getPriceLabel(operation: string): string {
  const op = operation.toLowerCase();
  if (op.includes('renta-corta') || op.includes('renta corta')) return 'por noche';
  if (op.includes('arriendo')) return 'por mes';
  return 'COP';
}

// ─────────────────────────────────────────────────────────
// Variante: Scroll horizontal (FeaturedProperties)
// ─────────────────────────────────────────────────────────
function HorizontalCard({ property, index = 0, animate = true }: PropertyCardProps) {
  const imageUrl = property.images?.[0] ?? null;
  const imageVersions = imageUrl ? getImageVersions(imageUrl) : null;

  const card = (
    <div
      className="w-72 sm:w-80 bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:-translate-y-1 transition-all duration-300"
      data-product-shop
    >
      <div className="relative w-full h-52 sm:h-56 bg-gray-100">
        {imageVersions ? (
          <ResponsiveImage
            thumbnail={imageVersions.thumbnail}
            medium={imageVersions.medium}
            large={imageVersions.large}
            placeholder={imageVersions.placeholder}
            alt={property.title}
            className="w-full h-52 sm:h-56"
            sizes="(max-width: 640px) 288px, 320px"
            priority={index < 2}
          />
        ) : imageUrl ? (
          <SimpleResponsiveImage src={imageUrl} alt={property.title} className="w-full h-52 sm:h-56" priority={index < 2} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <i className="ri-image-line text-gray-300 text-5xl"></i>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getOperationColor(property.operation)}`}>
            {formatOperationLabel(property.operation)}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-gray-700">
          {formatTypeLabel(property.type)}
        </div>
        {property.status === 'Destacado' && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <i className="ri-star-fill text-xs"></i> Destacado
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">{property.title}</h4>
        <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-3">
          <div className="w-4 h-4 flex items-center justify-center mr-1 flex-shrink-0">
            <i className="ri-map-pin-line"></i>
          </div>
          <span className="truncate">
            {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
          </span>
        </div>
        {(property.bedrooms > 0 || property.area_built > 0) && (
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 mb-4 flex-wrap">
            {property.bedrooms > 0 && <span className="flex items-center gap-1"><i className="ri-hotel-bed-line"></i>{property.bedrooms} Hab.</span>}
            {property.bathrooms > 0 && <span className="flex items-center gap-1"><i className="ri-drop-line"></i>{property.bathrooms} Baños</span>}
            {property.parking > 0 && <span className="flex items-center gap-1"><i className="ri-car-line"></i>{property.parking} Parq.</span>}
            {property.area_built > 0 && <span className="flex items-center gap-1"><i className="ri-ruler-line"></i>{property.area_built}m²</span>}
          </div>
        )}
        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
          <div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatPriceSupabase(property.price, property.currency)}</p>
            <p className="text-xs text-gray-500">{getPriceLabel(property.operation)}</p>
          </div>
          <Link
            to={getPropertyUrl(property)}
            className="bg-[#d4816f] text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-[#c27060] transition-colors duration-200 whitespace-nowrap cursor-pointer min-h-[44px] flex items-center"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );

  if (!animate) return card;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      {card}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Variante: Grid (Properties page)
// ─────────────────────────────────────────────────────────
function GridCard({ property, index = 0, animate = true }: PropertyCardProps) {
  const imageUrl = property.images?.[0] ?? null;
  const imageVersions = imageUrl ? getImageVersions(imageUrl) : null;

  const card = (
    <div
      className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:-translate-y-1"
      data-product-shop
    >
      <div className="relative w-full h-56 sm:h-64 bg-gray-100">
        {imageVersions ? (
          <ResponsiveImage
            thumbnail={imageVersions.thumbnail}
            medium={imageVersions.medium}
            large={imageVersions.large}
            placeholder={imageVersions.placeholder}
            alt={property.title}
            className="w-full h-56 sm:h-64"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : imageUrl ? (
          <SimpleResponsiveImage src={imageUrl} alt={property.title} className="w-full h-56 sm:h-64" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <i className="ri-image-line text-gray-300 text-5xl"></i>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getOperationColor(property.operation)}`}>
            {formatOperationLabel(property.operation)}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-gray-700">
          {formatTypeLabel(property.type)}
        </div>
        {property.status === 'Destacado' && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <i className="ri-star-fill text-xs"></i> Destacado
            </span>
          </div>
        )}
      </div>
      <div className="p-5 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">{property.title}</h3>
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <div className="w-4 h-4 flex items-center justify-center mr-1 flex-shrink-0">
            <i className="ri-map-pin-line"></i>
          </div>
          <span className="truncate">{property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}</span>
        </div>
        {(property.bedrooms > 0 || property.area_built > 0) && (
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 flex-wrap">
            {property.bedrooms > 0 && <span className="flex items-center gap-1"><i className="ri-hotel-bed-line"></i>{property.bedrooms} Hab.</span>}
            {property.bathrooms > 0 && <span className="flex items-center gap-1"><i className="ri-drop-line"></i>{property.bathrooms} Baños</span>}
            {property.parking > 0 && <span className="flex items-center gap-1"><i className="ri-car-line"></i>{property.parking} Parq.</span>}
            {property.area_built > 0 && <span className="flex items-center gap-1"><i className="ri-ruler-line"></i>{property.area_built}m²</span>}
          </div>
        )}
        <div className="flex justify-between items-center pt-1 border-t border-gray-50">
          <div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatPriceSupabase(property.price, property.currency)}</p>
            <p className="text-xs text-gray-500">{getPriceLabel(property.operation)}</p>
          </div>
          <Link
            to={getPropertyUrl(property)}
            className={`px-5 py-3 rounded-full text-sm font-semibold transition-colors duration-200 whitespace-nowrap cursor-pointer min-h-[44px] flex items-center ${
              property.operation !== 'venta'
                ? 'bg-[#d4816f] text-white hover:bg-[#c27060]'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );

  if (!animate) return card;
  return (
    <motion.div
      key={property.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3) }}
    >
      {card}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Variante: Related (inmuebles similares en detalle)
// ─────────────────────────────────────────────────────────
function RelatedCard({ property }: PropertyCardProps) {
  const imageUrl = property.images?.[0] ?? null;
  const imageVersions = imageUrl ? getImageVersions(imageUrl) : null;

  return (
    <Link
      to={getPropertyUrl(property)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer block"
    >
      <div className="relative w-full h-40 bg-gray-100">
        {imageVersions ? (
          <ResponsiveImage
            thumbnail={imageVersions.thumbnail}
            medium={imageVersions.medium}
            large={imageVersions.large}
            placeholder={imageVersions.placeholder}
            alt={property.title}
            className="w-full h-40"
            sizes="(max-width: 640px) 100vw, 280px"
          />
        ) : imageUrl ? (
          <SimpleResponsiveImage src={imageUrl} alt={property.title} className="w-full h-40" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <i className="ri-image-line text-gray-300 text-3xl"></i>
          </div>
        )}
      </div>
      <div className="p-4">
        <h4 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">{property.title}</h4>
        <p className="text-xs text-gray-500 mb-2">{property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}</p>
        <p className="text-base font-bold text-gray-900">{formatPriceSupabase(property.price, property.currency)}</p>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────
// Export principal — selecciona variante automáticamente
// ─────────────────────────────────────────────────────────
export default function PropertyCard({ variant = 'grid', ...props }: PropertyCardProps) {
  if (variant === 'horizontal-scroll') return <HorizontalCard {...props} />;
  if (variant === 'related') return <RelatedCard {...props} />;
  return <GridCard {...props} />;
}
