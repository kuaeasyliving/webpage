import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProperties, formatPriceSupabase } from '../../../hooks/useProperties';

export default function FeaturedProperties() {
  const { properties, loading } = useProperties({ publicOnly: true });

  // Destacadas primero, luego publicadas, máximo 8
  const displayProperties = [
    ...properties.filter((p) => p.status === 'Destacado'),
    ...properties.filter((p) => p.status === 'Publicado'),
  ].slice(0, 8);

  const formatLabel = (text: string) => {
    const spaced = text.replace(/-/g, ' ');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  return (
    <section className="py-24 bg-[#f5f1ed]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Nuestras Propiedades{' '}
              <span className="text-[#d4816f]">Destacadas</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Inmuebles activos en venta y arriendo en el Eje Cafetero
            </p>
          </div>
          <Link
            to="/inmuebles"
            className="hidden md:block bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors duration-200 whitespace-nowrap cursor-pointer"
          >
            Ver todas las propiedades
          </Link>
        </div>

        {/* Skeletons de carga */}
        {loading && (
          <div className="overflow-x-auto pb-4">
            <div className="flex space-x-6" style={{ width: 'max-content' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-80 bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse">
                  <div className="w-full h-56 bg-gray-200"></div>
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
          </div>
        )}

        {/* Listado real */}
        {!loading && displayProperties.length > 0 && (
          <div className="overflow-x-auto pb-4">
            <div className="flex space-x-6" style={{ width: 'max-content' }}>
              {displayProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="w-80 bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  data-product-shop
                >
                  <div className="relative w-full h-56 bg-gray-100">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="ri-image-line text-gray-300 text-5xl"></i>
                      </div>
                    )}
                    {/* Operación y tipo — esquina superior */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          property.operation.includes('Arriendo')
                            ? 'bg-[#d4816f] text-white'
                            : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {formatLabel(property.operation)}
                      </span>
                    </div>
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
                    <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {property.title}
                    </h4>

                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <i className="ri-map-pin-line mr-1 w-4 h-4 flex items-center justify-center"></i>
                      <span>
                        {property.neighborhood && `${property.neighborhood}, `}{property.city}
                      </span>
                    </div>

                    {(property.bedrooms > 0 || property.area_built > 0) && (
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                        {property.bedrooms > 0 && (
                          <span className="flex items-center gap-1">
                            <i className="ri-hotel-bed-line"></i>
                            {property.bedrooms} Hab.
                          </span>
                        )}
                        {property.bathrooms > 0 && (
                          <span className="flex items-center gap-1">
                            <i className="ri-drop-line"></i>
                            {property.bathrooms} Baños
                          </span>
                        )}
                        {property.parking > 0 && (
                          <span className="flex items-center gap-1">
                            <i className="ri-car-line"></i>
                            {property.parking} Parq.
                          </span>
                        )}
                        {property.area_built > 0 && (
                          <span className="flex items-center gap-1">
                            <i className="ri-ruler-line"></i>
                            {property.area_built}m²
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
                          {property.operation.includes('Renta Corta')
                            ? 'por noche'
                            : property.operation.includes('Arriendo')
                            ? 'por mes'
                            : 'COP'}
                        </p>
                      </div>
                      <Link
                        to={`/inmuebles/${property.id}`}
                        className="bg-[#d4816f] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#c27060] transition-colors duration-200 whitespace-nowrap cursor-pointer"
                      >
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {!loading && displayProperties.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow">
              <i className="ri-home-4-line text-gray-400 text-4xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Actualmente no hay inmuebles disponibles.
            </h3>
            <p className="text-gray-500 text-sm">Pronto publicaremos nuevas propiedades. ¡Vuelve pronto!</p>
          </div>
        )}

        <div className="mt-8 md:hidden text-center">
          <Link
            to="/inmuebles"
            className="bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors duration-200 whitespace-nowrap cursor-pointer inline-block"
          >
            Ver todas las propiedades
          </Link>
        </div>
      </div>
    </section>
  );
}
