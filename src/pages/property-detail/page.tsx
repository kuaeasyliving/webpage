import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { formatPriceSupabase } from '../../hooks/useProperties';
import { usePropertyDetail } from '../../hooks/usePropertyDetail';
import ResponsiveImage, { SimpleResponsiveImage } from '../../components/base/ResponsiveImage';
import { getImageVersions } from '../../utils/imageUrlHelper';
import { normalizeOperation } from '../../utils/slugGenerator';
import PropertyCard from '../../components/feature/PropertyCard';

// ── Helpers de etiquetas y colores (coherentes con PropertyCard) ──────────────
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
  return operation.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTypeLabel(type: string): string {
  return type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
// ─────────────────────────────────────────────────────────────────────────────

export default function PropertyDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { property, agent, relatedProperties, loading, notFound } = usePropertyDetail(slug);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFloatingShare, setShowFloatingShare] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowFloatingShare(window.scrollY > 320);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset image index when property changes
  useEffect(() => { setCurrentImageIndex(0); }, [slug]);

  const handleShare = (platform: string) => {
    if (!property) return;
    const url = `${window.location.origin}/${normalizeOperation(property.operation)}/${property.slug || slug}`;
    const text = `${property.title} - ${property.operation} en ${property.city}`;
    const links: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`,
    };
    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    } else if (links[platform]) {
      window.open(links[platform], '_blank');
    }
    setShowShareMenu(false);
  };

  const handleWhatsAppContact = () => {
    if (!property) return;
    const refCode = `REF-${property.id.slice(0, 8).toUpperCase()}`;
    const agentPhone = agent?.phone?.replace(/\D/g, '') || '573001234567';
    const phoneNumber = agentPhone.startsWith('57') ? agentPhone : `57${agentPhone}`;
    const message = `Hola, estoy interesado en la propiedad: ${property.title} (${refCode}) - ${property.operation} en ${property.neighborhood}, ${property.city}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <section className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-6">
              <div className="h-4 bg-gray-200 rounded w-48"></div>
              <div className="h-8 bg-gray-200 rounded w-2/3"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <div className="w-full h-64 sm:h-[400px] bg-gray-200 rounded-2xl"></div>
                  <div className="h-40 bg-gray-200 rounded-2xl"></div>
                </div>
                <div className="space-y-4"><div className="h-80 bg-gray-200 rounded-2xl"></div></div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-24 text-center px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-home-line text-gray-400 text-4xl"></i>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Propiedad no disponible</h1>
          <p className="text-gray-600 mb-6">Este inmueble no está activo o no existe.</p>
          <Link to="/inmuebles" className="bg-[#d4816f] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#c27060] transition-colors cursor-pointer inline-flex items-center whitespace-nowrap min-h-[44px]">
            Ver inmuebles disponibles
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const referenceCode = `REF-${property.id.slice(0, 8).toUpperCase()}`;
  const galleryImages = property.images?.length > 0
    ? property.images
    : ['https://readdy.ai/api/search-image?query=modern%20real%20estate%20property%20interior%20elegant%20living%20room%20neutral%20tones%20natural%20light%20spacious%20comfortable&width=1200&height=800&seq=detail-placeholder&orientation=landscape'];

  const agentFullName = agent ? `${agent.first_name} ${agent.last_name}` : 'Agente Inmobiliario';
  const agentPhoneDisplay = agent?.phone || '+57 300 123 4567';
  const agentPhotoUrl = agent?.photo_url || null;

  const priceLabel = property.operation.includes('renta-corta') || property.operation.includes('Renta Corta')
    ? 'por noche'
    : property.operation.includes('arriendo') || property.operation.includes('Arriendo')
    ? 'por mes' : 'COP';

  const currentImageUrl = galleryImages[currentImageIndex];
  const currentImageVersions = getImageVersions(currentImageUrl);
  const propertyUrl = `${window.location.origin}/${normalizeOperation(property.operation)}/${property.slug || slug}`;
  const metaDescription = property.description
    ? property.description.substring(0, 160)
    : `${property.title} en ${property.operation.toLowerCase()} en ${property.neighborhood ? property.neighborhood + ', ' : ''}${property.city}. ${property.bedrooms > 0 ? `${property.bedrooms} hab, ${property.bathrooms} baños.` : ''} ${property.area_built > 0 ? `${property.area_built}m².` : ''}`.trim();
  const ogTitle = `${property.title} | ${property.operation} en ${property.city} — KÚA Easy Living`;
  const mainImageUrl = galleryImages[0];

  return (
    <div className="min-h-screen bg-white">
      <title>{ogTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={`${property.operation}, ${property.type}, ${property.city}, ${property.neighborhood}, inmuebles Colombia, KUA Easy Living`} />
      <link rel="canonical" href={propertyUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={propertyUrl} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={mainImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={property.title} />
      <meta property="og:locale" content="es_CO" />
      <meta property="og:site_name" content="KÚA Easy Living" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={mainImageUrl} />

      <Navbar />

      <section className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumbs */}
          <nav className="mt-4 sm:mt-0 mb-4 sm:mb-6 overflow-hidden">
            <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 flex-wrap gap-y-1">
              <li className="hidden sm:block"><Link to="/" className="hover:text-[#d4816f] transition-colors cursor-pointer">Inicio</Link></li>
              <li className="hidden sm:block"><i className="ri-arrow-right-s-line"></i></li>
              <li><Link to="/inmuebles" className="hover:text-[#d4816f] transition-colors cursor-pointer">Inmuebles</Link></li>
              <li><i className="ri-arrow-right-s-line"></i></li>
              <li className="text-gray-700 font-medium truncate max-w-[180px] sm:max-w-none">{property.title}</li>
            </ol>
          </nav>

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {property.status === 'Destacado' && (
                <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <i className="ri-star-fill text-xs"></i> Destacado
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOperationColor(property.operation)}`}>
                {formatOperationLabel(property.operation)}
              </span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">{formatTypeLabel(property.type)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-snug">{property.title}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-600 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className="ri-map-pin-line text-[#d4816f]"></i>
                </div>
                <span>{property.neighborhood}{property.neighborhood ? ', ' : ''}{property.city}, {property.department}</span>
              </div>
              <span className="hidden sm:inline text-gray-300">&bull;</span>
              <span className="text-xs font-mono font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{referenceCode}</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Carrusel */}
              <div className="relative mb-6 sm:mb-8 rounded-2xl overflow-hidden bg-gray-900">
                <div className="relative w-full" style={{ aspectRatio: '16/10', minHeight: '220px', maxHeight: '560px' }}>
                  {currentImageVersions ? (
                    <ResponsiveImage
                      thumbnail={currentImageVersions.thumbnail}
                      medium={currentImageVersions.medium}
                      large={currentImageVersions.large}
                      placeholder={currentImageVersions.placeholder}
                      alt={`${property.title} - Imagen ${currentImageIndex + 1}`}
                      className="w-full h-full"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      priority={currentImageIndex === 0}
                    />
                  ) : (
                    <SimpleResponsiveImage
                      src={currentImageUrl}
                      alt={`${property.title} - Imagen ${currentImageIndex + 1}`}
                      className="w-full h-full"
                      priority={currentImageIndex === 0}
                    />
                  )}
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-medium z-10">
                    {currentImageIndex + 1} / {galleryImages.length}
                  </div>
                  {galleryImages.length > 1 && (
                    <>
                      <button onClick={() => setCurrentImageIndex((p) => (p === 0 ? galleryImages.length - 1 : p - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all cursor-pointer z-10" aria-label="Imagen anterior">
                        <i className="ri-arrow-left-s-line text-xl sm:text-2xl text-gray-900"></i>
                      </button>
                      <button onClick={() => setCurrentImageIndex((p) => (p === galleryImages.length - 1 ? 0 : p + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all cursor-pointer z-10" aria-label="Imagen siguiente">
                        <i className="ri-arrow-right-s-line text-xl sm:text-2xl text-gray-900"></i>
                      </button>
                    </>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2 z-10">
                    <button onClick={() => setIsFavorite(!isFavorite)} className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 hover:bg-white text-gray-700'}`} aria-label="Favorito">
                      <i className={`${isFavorite ? 'ri-heart-fill' : 'ri-heart-line'} text-lg sm:text-xl`}></i>
                    </button>
                    <div className="relative">
                      <button onClick={() => setShowShareMenu(!showShareMenu)} className="w-10 h-10 sm:w-11 sm:h-11 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all cursor-pointer" aria-label="Compartir">
                        <i className="ri-share-line text-lg sm:text-xl text-gray-700"></i>
                      </button>
                      {showShareMenu && (
                        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl border border-gray-100 py-1.5 w-48 z-20">
                          {[
                            { key: 'whatsapp', icon: 'ri-whatsapp-fill', color: 'text-green-600', label: 'WhatsApp' },
                            { key: 'facebook', icon: 'ri-facebook-fill', color: 'text-[#1877F2]', label: 'Facebook' },
                            { key: 'twitter', icon: 'ri-twitter-fill', color: 'text-sky-500', label: 'Twitter / X' },
                            { key: 'copy', icon: copied ? 'ri-check-line' : 'ri-file-copy-line', color: copied ? 'text-green-600' : 'text-gray-600', label: copied ? '¡Copiado!' : 'Copiar enlace' },
                          ].map((s) => (
                            <button key={s.key} onClick={() => handleShare(s.key)} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer transition-colors">
                              <i className={`${s.icon} ${s.color} text-base`}></i> {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {galleryImages.length > 1 && (
                  <div className="flex gap-2 p-2.5 bg-gray-800 overflow-x-auto scrollbar-none">
                    {galleryImages.map((img, index) => {
                      const tv = getImageVersions(img);
                      return (
                        <button key={index} onClick={() => setCurrentImageIndex(index)} className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${currentImageIndex === index ? 'border-[#d4816f] opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`} aria-label={`Ver imagen ${index + 1}`}>
                          <img src={tv ? tv.thumbnail : img} alt={`Miniatura ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Mobile CTA — ELIMINADO */}

              {/* Price & Data Panel */}
              <div className="bg-[#f5f1ed] rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5 sm:mb-6">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Precio de {formatOperationLabel(property.operation)}</p>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900">{formatPriceSupabase(property.price, property.currency)}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{priceLabel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Referencia</p>
                    <p className="text-base sm:text-xl font-bold text-gray-900 font-mono">{referenceCode}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {[
                    { show: property.area_built > 0, icon: 'ri-ruler-line', label: 'Área', value: `${property.area_built}m²` },
                    { show: property.area_private > 0, icon: 'ri-layout-line', label: 'Privada', value: `${property.area_private}m²` },
                    { show: property.bedrooms > 0, icon: 'ri-hotel-bed-line', label: 'Hab.', value: String(property.bedrooms) },
                    { show: property.bathrooms > 0, icon: 'ri-drop-line', label: 'Baños', value: String(property.bathrooms) },
                    { show: property.parking > 0, icon: 'ri-car-line', label: 'Parq.', value: String(property.parking) },
                  ].filter((x) => x.show).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 sm:gap-3 bg-white rounded-xl p-3 sm:p-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#d4816f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className={`${item.icon} text-[#d4816f] text-base sm:text-xl`}></i>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 truncate">{item.label}</p>
                        <p className="text-sm sm:text-base font-bold text-gray-900">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Descripción</h2>
                <div className="prose prose-gray max-w-none">
                  {property.description ? (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">{property.description}</p>
                  ) : (
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      {property.title} en {property.operation.toLowerCase()} ubicado en {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}.
                      {property.area_built > 0 ? ` Esta propiedad de ${property.area_built}m²` : ' Este inmueble'}
                      {property.bedrooms > 0 ? ` cuenta con ${property.bedrooms} habitaciones y ${property.bathrooms} baños.` : '.'}
                      {property.parking > 0 ? ` Incluye ${property.parking} parqueadero${property.parking > 1 ? 's' : ''}.` : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Features */}
              {((property.features_internal?.length > 0) || (property.features_external?.length > 0)) && (
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">Características</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {property.features_internal?.length > 0 && (
                      <div className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <i className="ri-home-smile-line text-[#d4816f]"></i> Internas
                        </h3>
                        <div className="space-y-2.5">
                          {property.features_internal.map((feat, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0"><i className="ri-check-line text-[#d4816f] text-lg"></i></div>
                              <span className="text-sm text-gray-700">{feat.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {property.features_external?.length > 0 && (
                      <div className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <i className="ri-building-line text-[#d4816f]"></i> Externas
                        </h3>
                        <div className="space-y-2.5">
                          {property.features_external.map((feat, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0"><i className="ri-check-line text-[#d4816f] text-lg"></i></div>
                              <span className="text-sm text-gray-700">{feat.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Map */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Ubicación</h2>
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent((property.neighborhood || '') + ', ' + (property.city || '') + ', Colombia')}`}
                    width="100%" height="300" style={{ border: 0 }} loading="lazy"
                    title={`Mapa de ${property.title}`} className="sm:h-[400px]"
                  ></iframe>
                </div>
              </div>

              {/* Agente a cargo e Info Adicional — solo mobile, entre Ubicación e Inmuebles Similares */}
              <div className="lg:hidden space-y-4 mb-6 sm:mb-8">
                {/* Agente a cargo */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">Agente a cargo</p>
                  <div className="text-center mb-5">
                    <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-4 border-[#d4816f]/20 bg-gray-100 flex items-center justify-center">
                      {agentPhotoUrl ? <img src={agentPhotoUrl} alt={agentFullName} className="w-full h-full object-cover" /> : <i className="ri-user-3-line text-gray-400 text-3xl"></i>}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{agentFullName}</h3>
                    <p className="text-sm text-gray-500 mb-3">Agente Inmobiliario</p>
                    <a href={`tel:${agentPhoneDisplay.replace(/\s/g, '')}`} className="flex items-center justify-center gap-2 text-sm text-gray-700 font-medium hover:text-[#d4816f] transition-colors cursor-pointer">
                      <i className="ri-phone-line text-[#d4816f]"></i><span>{agentPhoneDisplay}</span>
                    </a>
                  </div>
                </div>

                {/* Información Adicional */}
                <div className="bg-[#f5f1ed] rounded-2xl p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Información Adicional</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      { icon: 'ri-shield-check-line', text: 'Propiedad verificada y con documentación al día' },
                      { icon: 'ri-calendar-check-line', text: 'Disponible para visitas con cita previa' },
                      { icon: 'ri-home-gear-line', text: `Asesoría completa en el proceso de ${property.operation.toLowerCase()}` },
                      { icon: 'ri-user-star-line', text: `Agente: ${agentFullName}` },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"><i className={`${item.icon} text-[#d4816f] text-lg`}></i></div>
                        <p className="text-gray-700 text-xs leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Related */}
              {relatedProperties.length > 0 && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">Inmuebles Similares</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    {relatedProperties.map((rp) => (
                      <PropertyCard key={rp.id} property={rp} variant="related" animate={false} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
                <div className="hidden lg:block bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">Agente a cargo</p>
                  <div className="text-center mb-5 sm:mb-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mx-auto mb-3 sm:mb-4 border-4 border-[#d4816f]/20 bg-gray-100 flex items-center justify-center">
                      {agentPhotoUrl ? <img src={agentPhotoUrl} alt={agentFullName} className="w-full h-full object-cover" /> : <i className="ri-user-3-line text-gray-400 text-3xl sm:text-4xl"></i>}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{agentFullName}</h3>
                    <p className="text-sm text-gray-500 mb-3">Agente Inmobiliario</p>
                    <a href={`tel:${agentPhoneDisplay.replace(/\s/g, '')}`} className="flex items-center justify-center gap-2 text-sm text-gray-700 font-medium hover:text-[#d4816f] transition-colors cursor-pointer">
                      <i className="ri-phone-line text-[#d4816f]"></i><span>{agentPhoneDisplay}</span>
                    </a>
                  </div>
                  <button onClick={handleWhatsAppContact} className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer min-h-[56px]">
                    <i className="ri-whatsapp-line text-2xl"></i> Contactar
                  </button>
                </div>

                <div className="hidden lg:block bg-[#f5f1ed] rounded-2xl p-5 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Información Adicional</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      { icon: 'ri-shield-check-line', text: 'Propiedad verificada y con documentación al día' },
                      { icon: 'ri-calendar-check-line', text: 'Disponible para visitas con cita previa' },
                      { icon: 'ri-home-gear-line', text: `Asesoría completa en el proceso de ${property.operation.toLowerCase()}` },
                      { icon: 'ri-user-star-line', text: `Agente: ${agentFullName}` },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"><i className={`${item.icon} text-[#d4816f] text-lg`}></i></div>
                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => navigate('/inmuebles')} className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer min-h-[48px] text-sm">
                  <i className="ri-arrow-left-line"></i> Ver todos los inmuebles
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Barra flotante mobile */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ${showFloatingShare ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="h-3 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
        <div className="bg-white border-t border-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-gray-900 leading-tight truncate">{formatPriceSupabase(property.price, property.currency)}</p>
              <p className="text-xs text-gray-500 leading-tight">{property.operation}</p>
            </div>
            <button onClick={() => { const url = `${window.location.origin}/${normalizeOperation(property.operation)}/${property.slug || slug}`; navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }} className="flex flex-col items-center gap-0.5 w-12 min-h-[48px] justify-center cursor-pointer" aria-label="Copiar enlace">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"><i className={`${copied ? 'ri-check-line text-emerald-600' : 'ri-link text-gray-700'} text-lg`}></i></div>
              <span className="text-[10px] text-gray-500 leading-none">{copied ? '¡Listo!' : 'Copiar'}</span>
            </button>
            <button onClick={() => { const url = `${window.location.origin}/${normalizeOperation(property.operation)}/${property.slug || slug}`; const text = `${property.title} — ${property.operation} en ${property.city}`; window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank'); }} className="flex flex-col items-center gap-0.5 w-12 min-h-[48px] justify-center cursor-pointer" aria-label="Compartir en Telegram">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors"><i className="ri-telegram-fill text-sky-500 text-lg"></i></div>
              <span className="text-[10px] text-gray-500 leading-none">Telegram</span>
            </button>
            <button onClick={handleWhatsAppContact} className="flex-shrink-0 bg-[#25D366] hover:bg-[#20BA5A] active:bg-[#1aad57] text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 whitespace-nowrap cursor-pointer min-h-[48px] transition-colors" aria-label="Contactar por WhatsApp">
              <i className="ri-whatsapp-line text-xl"></i><span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
