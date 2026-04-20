import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { usePropertiesPaginated } from '../../hooks/usePropertiesPaginated';
import type { OperationFilter } from '../../hooks/usePropertiesQuery';
import PropertyCard from '../../components/feature/PropertyCard';

const FILTERS: { label: string; value: OperationFilter; icon: string }[] = [
  { label: 'Todos', value: 'all', icon: 'ri-home-4-line' },
  { label: 'Venta', value: 'venta', icon: 'ri-price-tag-3-line' },
  { label: 'Renta Tradicional', value: 'arriendo-tradicional', icon: 'ri-key-line' },
  { label: 'Renta Corta', value: 'arriendo-renta-corta', icon: 'ri-calendar-check-line' },
];

export default function Properties() {
  const [filter, setFilter] = useState<OperationFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    properties,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    total,
  } = usePropertiesPaginated({ publicOnly: true, operation: filter, search: searchTerm });

  const handleFilterChange = (newFilter: OperationFilter) => {
    setFilter(newFilter);
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-28 sm:pt-32 pb-16 sm:pb-24 bg-gradient-to-b from-[#f5f1ed] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-3 sm:mb-4">
              Nuestros <span className="text-[#d4816f]">Inmuebles</span>
            </h1>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Descubre la propiedad perfecta para ti en el Eje Cafetero. Solo mostramos inmuebles activos y verificados.
            </p>
          </motion.div>

          {/* Search */}
          <div className="max-w-lg mx-auto mb-6 sm:mb-8">
            <div className="relative">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
              <input
                type="text"
                placeholder="Buscar por título, ciudad o barrio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#d4816f] focus:border-transparent bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label="Limpiar búsqueda"
                >
                  <i className="ri-close-line text-lg"></i>
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8 sm:mb-12">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleFilterChange(f.value)}
                  className={`flex items-center justify-center gap-2 px-3 sm:px-6 py-3 rounded-2xl sm:rounded-full text-sm font-medium transition-all duration-200 cursor-pointer min-h-[48px] w-full sm:w-auto ${
                    filter === f.value
                      ? 'bg-[#d4816f] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <i className={`${f.icon} text-base`}></i>
                  <span className="whitespace-nowrap">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          {!loading && properties.length > 0 && (
            <p className="text-sm text-gray-500 mb-4 sm:mb-6">
              Mostrando <strong className="text-gray-900">{properties.length}</strong>
              {!searchTerm && total > properties.length && (
                <> de <strong className="text-gray-900">{total}</strong></>
              )} inmuebles activos
            </p>
          )}

          {/* Loading Skeletons — solo primer carga */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse">
                  <div className="w-full h-56 sm:h-64 bg-gray-200"></div>
                  <div className="p-5 sm:p-6 space-y-3">
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

          {/* Grid de propiedades */}
          {!loading && properties.length > 0 && (
            <>
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                  {properties.map((property, index) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      index={index}
                      variant="grid"
                      animate
                    />
                  ))}
                </div>
              </AnimatePresence>

              {/* Botón Cargar más */}
              {hasMore && (
                <div className="mt-10 sm:mt-14 flex flex-col items-center gap-3">
                  {/* Barra de progreso visual */}
                  <div className="w-full max-w-xs h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#d4816f] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((properties.length / total) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    {properties.length} de {total} inmuebles
                  </p>
                  <button
                    onClick={() => loadMore()}
                    disabled={loadingMore}
                    className="mt-2 inline-flex items-center gap-2.5 px-8 py-4 rounded-full border-2 border-[#d4816f] text-[#d4816f] font-semibold text-sm hover:bg-[#d4816f] hover:text-white transition-all duration-200 whitespace-nowrap cursor-pointer min-h-[52px] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Cargando...
                      </>
                    ) : (
                      <>
                        <i className="ri-add-line text-lg"></i>
                        Cargar más inmuebles
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Fin de resultados */}
              {!hasMore && !searchTerm && properties.length >= total && total > 0 && (
                <div className="mt-10 text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-400 bg-gray-50 px-5 py-3 rounded-full">
                    <i className="ri-check-double-line text-[#d4816f]"></i>
                    Has visto todos los inmuebles disponibles
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && properties.length === 0 && (
            <div className="text-center py-16 sm:py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-home-4-line text-gray-400 text-4xl"></i>
              </div>
              {searchTerm || filter !== 'all' ? (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron inmuebles</h3>
                  <p className="text-gray-500 text-sm mb-6">Intenta ajustar los filtros de búsqueda</p>
                  <button
                    onClick={() => { setFilter('all'); setSearchTerm(''); }}
                    className="px-5 py-3 text-sm font-medium text-[#d4816f] hover:bg-[#d4816f]/10 rounded-xl transition-colors whitespace-nowrap cursor-pointer min-h-[44px]"
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
