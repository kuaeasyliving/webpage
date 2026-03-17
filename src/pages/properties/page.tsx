import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useProperties, formatPriceSupabase } from '../../hooks/useProperties';
import ResponsiveImage, { SimpleResponsiveImage } from '../../components/base/ResponsiveImage';
import { getImageVersions } from '../../utils/imageUrlHelper';
import { normalizeOperation } from '../../utils/slugGenerator';

type FilterType = 'all' | 'venta' | 'arriendo-tradicional' | 'arriendo-renta-corta';

export default function Properties() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { properties, loading } = useProperties({ publicOnly: true, search: searchTerm });

  const formatLabel = (text: string) => {
    const spaced = text.replace(/-/g, ' ');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  const filteredProperties = properties.filter((property) => {
    if (filter === 'all') return true;
    return property.operation === filter;
  });

  // Función para generar URL SEO-friendly
  const getPropertyUrl = (property: any) => {
    if (!property.slug) {
      return `/inmuebles/${property.id}`;
    }
    return `/${normalizeOperation(property.operation)}/${property.slug}`;
  };

  const filters: { label: string; value: FilterType }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Venta', value: 'venta' },
    { label: 'Arriendo Tradicional', value: 'arriendo-tradicional' },
    { label: 'Renta Corta', value: 'arriendo-renta-corta' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-24 bg-gradient-to-b from-[#f5f1ed] to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Nuestros <span className="text-[#d4816f]">Inmuebles</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre la propiedad perfecta para ti en el Eje Cafetero. Solo mostramos inmuebles activos y verificados.
            </p>
          </motion.div>

          {/* Search */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="relative">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
              <input
                type="text"
                placeholder="Buscar por título, ciudad o barrio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#d4816f] focus:border-transparent bg-white"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex justify-center flex-wrap gap-3 mb-12">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  filter === f.value
                    ? 'bg-[#d4816f] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Results count */}
          {!loading && (
            <p className="text-sm text-gray-500 mb-6">
              Mostrando <strong className="text-gray-900">{filteredProperties.length}</strong> inmuebles activos
            </p>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse">
                  <div className="w-full h-64 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-7 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-10 bg-gray-200 rounded-full w-28"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property, index) => {
                const imageUrl = property.images && property.images.length > 0 ? property.images[0] : null;
                const imageVersions = imageUrl ? getImageVersions(imageUrl) : null;

                return (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                    data-product-shop
                  >
                    <div className="relative w-full h-64 bg-gray-100">
                      {imageVersions ? (
                        <ResponsiveImage
                          thumbnail={imageVersions.thumbnail}
                          medium={imageVersions.medium}
                          large={imageVersions.large}
                          placeholder={imageVersions.placeholder}
                          alt={property.title}
                          className="w-full h-64"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : imageUrl ? (
                        <SimpleResponsiveImage
                          src={imageUrl}
                          alt={property.title}
                          className="w-full h-64"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="ri-image-line text-gray-300 text-5xl"></i>
                        </div>
                      )}
                      {/* Operación — esquina superior izquierda */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            property.operation === 'arriendo-tradicional'
                              ? 'bg-emerald-500 text-white'
                              : property.operation === 'arriendo-renta-corta'
                              ? 'bg-sky-500 text-white'
                              : 'bg-rose-700 text-white'
                          }`}
                        >
                          {formatLabel(property.operation)}
                        </span>
                      </div>
                      {/* Tipo — esquina superior derecha */}
                      <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                        {formatLabel(property.type)}
                      </div>
                      {/* Destacado — esquina inferior izquierda */}
                      {property.status === 'Destacado' && (
                        <div className="absolute bottom-4 left-4">
                          <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <i className="ri-star-fill text-xs"></i>
                            Destacado
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{property.title}</h3>
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <i className="ri-map-pin-line mr-1 w-4 h-4 flex items-center justify-center"></i>
                        <span>{property.neighborhood}, {property.city}</span>
                      </div>
                      {(property.bedrooms > 0 || property.area_built > 0) && (
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                          {property.bedrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <i className="ri-hotel-bed-line"></i>{property.bedrooms} Hab.
                            </span>
                          )}
                          {property.bathrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <i className="ri-drop-line"></i>{property.bathrooms} Baños
                            </span>
                          )}
                          {property.parking > 0 && (
                            <span className="flex items-center gap-1">
                              <i className="ri-car-line"></i>{property.parking} Parq.
                            </span>
                          )}
                          {property.area_built > 0 && (
                            <span className="flex items-center gap-1">
                              <i className="ri-ruler-line"></i>{property.area_built}m²
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatPriceSupabase(property.price, property.currency)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {property.operation === 'arriendo-renta-corta'
                              ? 'por noche'
                              : property.operation === 'arriendo-tradicional'
                              ? 'por mes'
                              : 'COP'}
                          </p>
                        </div>
                        <Link
                          to={getPropertyUrl(property)}
                          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 whitespace-nowrap cursor-pointer ${
                            property.operation !== 'venta'
                              ? 'bg-[#d4816f] text-white hover:bg-[#c27060]'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                        >
                          Ver detalles
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProperties.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-home-4-line text-gray-400 text-4xl"></i>
              </div>
              {searchTerm || filter !== 'all' ? (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron inmuebles</h3>
                  <p className="text-gray-500 text-sm mb-6">Intenta ajustar los filtros de búsqueda</p>
                  <button
                    onClick={() => { setFilter('all'); setSearchTerm(''); }}
                    className="px-4 py-2 text-sm font-medium text-[#d4816f] hover:bg-[#d4816f]/10 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Limpiar filtros
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Actualmente no hay inmuebles disponibles.</h3>
                  <p className="text-gray-500 text-sm">Pronto publicaremos nuevas propiedades. ¡Vuelve pronto!</p>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}