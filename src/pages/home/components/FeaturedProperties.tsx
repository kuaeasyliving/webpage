import { Link } from 'react-router-dom';
import { usePropertiesQuery } from '../../../hooks/usePropertiesQuery';
import PropertyCard from '../../../components/feature/PropertyCard';

export default function FeaturedProperties() {
  const { properties, loading } = usePropertiesQuery({ publicOnly: true });

  const displayProperties = [
    ...properties.filter((p) => p.status === 'Destacado'),
    ...properties.filter((p) => p.status === 'Publicado'),
  ].slice(0, 8);

  return (
    <section className="py-16 sm:py-24 bg-[#f5f1ed]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 sm:mb-12 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
              Nuestras Propiedades <span className="text-[#d4816f]">Destacadas</span>
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Inmuebles activos en venta y arriendo en el Eje Cafetero
            </p>
          </div>
          <Link
            to="/inmuebles"
            className="hidden sm:block bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors duration-200 whitespace-nowrap cursor-pointer flex-shrink-0"
          >
            Ver todas las propiedades
          </Link>
        </div>

        {loading && (
          <div className="overflow-x-auto pb-4 -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="flex space-x-4 sm:space-x-6" style={{ width: 'max-content' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-72 sm:w-80 bg-white rounded-2xl sm:rounded-3xl overflow-hidden animate-pulse">
                  <div className="w-full h-52 sm:h-56 bg-gray-200"></div>
                  <div className="p-4 sm:p-6 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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

        {!loading && displayProperties.length > 0 && (
          <div className="overflow-x-auto pb-4 -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="flex space-x-4 sm:space-x-6" style={{ width: 'max-content' }}>
              {displayProperties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  index={index}
                  variant="horizontal-scroll"
                  animate
                />
              ))}
            </div>
          </div>
        )}

        {!loading && displayProperties.length === 0 && (
          <div className="text-center py-16 sm:py-20">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-home-4-line text-gray-400 text-4xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Actualmente no hay inmuebles disponibles.</h3>
            <p className="text-gray-500 text-sm">Pronto publicaremos nuevas propiedades. ¡Vuelve pronto!</p>
          </div>
        )}

        <div className="mt-6 sm:mt-8 text-center sm:hidden">
          <Link
            to="/inmuebles"
            className="bg-gray-900 text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors duration-200 whitespace-nowrap cursor-pointer inline-flex items-center justify-center min-h-[48px]"
          >
            Ver todas las propiedades
          </Link>
        </div>
      </div>
    </section>
  );
}
