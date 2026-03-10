import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Property, Agent } from '../../lib/supabase';
import { formatPriceSupabase } from '../../hooks/useProperties';

interface NearbyPlace {
  icon: string;
  name: string;
  distance: string;
  type: string;
}

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProperty = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        setProperty(null);
        setLoading(false);
        return;
      }

      const prop = data as Property;
      setProperty(prop);

      if (prop.agent) {
        const { data: agentData } = await supabase
          .from('agents')
          .select('*')
          .eq('id', prop.agent)
          .maybeSingle();
        setAgent(agentData as Agent | null);
      }

      const { data: related } = await supabase
        .from('properties')
        .select('*')
        .in('status', ['Publicado', 'Destacado'])
        .eq('operation', data.operation)
        .neq('id', id)
        .limit(3);

      setRelatedProperties((related as Property[]) || []);
      setLoading(false);

      // Cargar puntos de interés reales
      fetchNearbyPlaces(prop.neighborhood, prop.city, prop.department);
    };

    fetchProperty();
  }, [id]);

  const fetchNearbyPlaces = async (neighborhood: string, city: string, department: string) => {
    setNearbyLoading(true);
    setNearbyError(false);
    try {
      const res = await fetch('https://qyedksvaanepyupemsxb.supabase.co/functions/v1/nearby-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ neighborhood, city, department }),
      });
      const data = await res.json();
      console.log('[nearby-places] Response status:', res.status, 'data:', JSON.stringify(data));
      if (!res.ok) {
        console.error('[nearby-places] Error response:', data);
        setNearbyError(true);
        return;
      }
      if (data.places && data.places.length > 0) {
        setNearbyPlaces(data.places);
      } else {
        console.warn('[nearby-places] No places returned. Full response:', data);
        setNearbyError(true);
      }
    } catch (e) {
      console.error('[nearby-places] Fetch exception:', e);
      setNearbyError(true);
    } finally {
      setNearbyLoading(false);
    }
  };

  const handleShare = (platform: string) => {
    if (!property) return;
    const url = window.location.href;
    const text = `${property.title} - ${property.operation} en ${property.city}`;
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        break;
      default:
        break;
    }
    setShowShareMenu(false);
  };

  const handleWhatsAppContact = () => {
    if (!property) return;
    const refCode = `REF-${property.id.slice(0, 8).toUpperCase()}`;
    const agentPhone = agent?.phone ? agent.phone.replace(/\D/g, '') : '573001234567';
    const phoneNumber = agentPhone.startsWith('57') ? agentPhone : `57${agentPhone}`;
    const message = `Hola, estoy interesado en la propiedad: ${property.title} (${refCode}) - ${property.operation} en ${property.neighborhood}, ${property.city}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <section className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="animate-pulse space-y-6">
              <div className="h-4 bg-gray-200 rounded w-64"></div>
              <div className="h-8 bg-gray-200 rounded w-2/3"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <div className="w-full h-[500px] bg-gray-200 rounded-2xl"></div>
                  <div className="h-40 bg-gray-200 rounded-2xl"></div>
                  <div className="h-32 bg-gray-200 rounded-2xl"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-96 bg-gray-200 rounded-2xl"></div>
                  <div className="h-48 bg-gray-200 rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  // Not found
  if (!property) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-24 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-home-line text-gray-400 text-4xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Propiedad no disponible</h1>
          <p className="text-gray-600 mb-6">Este inmueble no está activo o no existe.</p>
          <Link
            to="/inmuebles"
            className="bg-[#d4816f] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#c27060] transition-colors cursor-pointer inline-block whitespace-nowrap"
          >
            Ver inmuebles disponibles
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const referenceCode = `REF-${property.id.slice(0, 8).toUpperCase()}`;
  const galleryImages = property.images && property.images.length > 0
    ? property.images
    : ['https://readdy.ai/api/search-image?query=modern%20real%20estate%20property%20interior%20elegant%20living%20room%20neutral%20tones%20natural%20light%20spacious%20comfortable&width=1200&height=800&seq=detail-placeholder&orientation=landscape'];

  const agentFullName = agent
    ? `${agent.first_name} ${agent.last_name}`
    : 'Agente Inmobiliario';

  const agentPhoneDisplay = agent?.phone || '+57 300 123 4567';

  const agentPhotoUrl = agent?.photo_url || null;

  const priceLabel = property.operation.includes('Renta Corta')
    ? 'por noche'
    : property.operation.includes('Arriendo')
    ? 'por mes'
    : 'COP';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li><Link to="/" className="hover:text-[#d4816f] transition-colors cursor-pointer">Inicio</Link></li>
              <li><i className="ri-arrow-right-s-line"></i></li>
              <li><Link to="/inmuebles" className="hover:text-[#d4816f] transition-colors cursor-pointer">Inmuebles</Link></li>
              <li><i className="ri-arrow-right-s-line"></i></li>
              <li><span className="text-gray-700">{property.operation}</span></li>
              <li><i className="ri-arrow-right-s-line"></i></li>
              <li className="text-gray-900 font-medium">{property.neighborhood || property.city}</li>
            </ol>
          </nav>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {property.status === 'Destacado' && (
                <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <i className="ri-star-fill text-xs"></i> Destacado
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${property.operation.includes('Arriendo') ? 'bg-[#d4816f] text-white' : 'bg-emerald-500 text-white'}`}>
                {property.operation}
              </span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">{property.type}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{property.title}</h1>
            <div className="flex items-center gap-4 text-gray-600 flex-wrap">
              <div className="flex items-center gap-2">
                <i className="ri-map-pin-line w-5 h-5 flex items-center justify-center"></i>
                <span className="text-base">{property.neighborhood}, {property.city}, {property.department}</span>
              </div>
              <span className="text-gray-400">&bull;</span>
              <span className="text-sm font-medium text-gray-500">{referenceCode}</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">

              {/* ── CARRUSEL ── */}
              <div className="relative mb-8 rounded-2xl overflow-hidden bg-gray-900">
                {/* Imagen principal: object-contain para no recortar nada */}
                <div className="relative w-full flex items-center justify-center" style={{ minHeight: '340px', maxHeight: '600px' }}>
                  <img
                    key={currentImageIndex}
                    src={galleryImages[currentImageIndex]}
                    alt={`${property.title} - Imagen ${currentImageIndex + 1}`}
                    className="max-w-full max-h-[600px] w-auto h-auto object-contain"
                    style={{ display: 'block', margin: '0 auto' }}
                  />

                  {/* Contador */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                    {currentImageIndex + 1} / {galleryImages.length}
                  </div>

                  {/* Flechas */}
                  {galleryImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer z-10"
                      >
                        <i className="ri-arrow-left-s-line text-2xl text-gray-900"></i>
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer z-10"
                      >
                        <i className="ri-arrow-right-s-line text-2xl text-gray-900"></i>
                      </button>
                    </>
                  )}

                  {/* Acciones flotantes */}
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 hover:bg-white text-gray-700'}`}
                    >
                      <i className={`${isFavorite ? 'ri-heart-fill' : 'ri-heart-line'} text-xl`}></i>
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="w-11 h-11 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer"
                      >
                        <i className="ri-share-line text-xl text-gray-700"></i>
                      </button>
                      {showShareMenu && (
                        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 w-48 z-20">
                          {[
                            { key: 'facebook', icon: 'ri-facebook-fill', color: 'text-[#1877F2]', label: 'Facebook' },
                            { key: 'twitter', icon: 'ri-twitter-fill', color: 'text-sky-500', label: 'Twitter' },
                            { key: 'whatsapp', icon: 'ri-whatsapp-fill', color: 'text-green-600', label: 'WhatsApp' },
                            { key: 'copy', icon: 'ri-file-copy-line', color: 'text-gray-600', label: 'Copiar enlace' },
                          ].map((s) => (
                            <button
                              key={s.key}
                              onClick={() => handleShare(s.key)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                            >
                              <i className={`${s.icon} ${s.color}`}></i> {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Miniaturas */}
                {galleryImages.length > 1 && (
                  <div className="flex gap-2 p-3 bg-gray-800 overflow-x-auto">
                    {galleryImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${currentImageIndex === index ? 'border-[#d4816f]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={img} alt={`Miniatura ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price & Data Panel */}
              <div className="bg-[#f5f1ed] rounded-2xl p-8 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Precio de {property.operation}</p>
                    <p className="text-4xl font-bold text-gray-900">{formatPriceSupabase(property.price, property.currency)}</p>
                    <p className="text-sm text-gray-600 mt-1">{priceLabel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Código de Referencia</p>
                    <p className="text-xl font-bold text-gray-900">{referenceCode}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {property.area_built > 0 && (
                    <div className="flex items-center gap-3 bg-white rounded-xl p-4">
                      <div className="w-10 h-10 bg-[#d4816f]/10 rounded-lg flex items-center justify-center">
                        <i className="ri-ruler-line text-[#d4816f] text-xl"></i>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Área Construida</p>
                        <p className="text-base font-bold text-gray-900">{property.area_built}m²</p>
                      </div>
                    </div>
                  )}
                  {property.area_private > 0 && (
                    <div className="flex items-center gap-3 bg-white rounded-xl p-4">
                      <div className="w-10 h-10 bg-[#d4816f]/10 rounded-lg flex items-center justify-center">
                        <i className="ri-layout-line text-[#d4816f] text-xl"></i>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Área Privada</p>
                        <p className="text-base font-bold text-gray-900">{property.area_private}m²</p>
                      </div>
                    </div>
                  )}
                  {property.bedrooms > 0 && (
                    <div className="flex items-center gap-3 bg-white rounded-xl p-4">
                      <div className="w-10 h-10 bg-[#d4816f]/10 rounded-lg flex items-center justify-center">
                        <i className="ri-hotel-bed-line text-[#d4816f] text-xl"></i>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Habitaciones</p>
                        <p className="text-base font-bold text-gray-900">{property.bedrooms}</p>
                      </div>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="flex items-center gap-3 bg-white rounded-xl p-4">
                      <div className="w-10 h-10 bg-[#d4816f]/10 rounded-lg flex items-center justify-center">
                        <i className="ri-drop-line text-[#d4816f] text-xl"></i>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Baños</p>
                        <p className="text-base font-bold text-gray-900">{property.bathrooms}</p>
                      </div>
                    </div>
                  )}
                  {property.parking > 0 && (
                    <div className="flex items-center gap-3 bg-white rounded-xl p-4">
                      <div className="w-10 h-10 bg-[#d4816f]/10 rounded-lg flex items-center justify-center">
                        <i className="ri-car-line text-[#d4816f] text-xl"></i>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Parqueaderos</p>
                        <p className="text-base font-bold text-gray-900">{property.parking}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción</h2>
                <div className="prose prose-gray max-w-none">
                  {property.description ? (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
                  ) : (
                    <>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {property.title} en {property.operation.toLowerCase()} ubicado en {property.neighborhood}, {property.city}
                        {property.area_built > 0 ? ` Esta propiedad de ${property.area_built}m² construidos` : ' Este inmueble'}
                        {property.bedrooms > 0 ? ` cuenta con ${property.bedrooms} habitaciones y ${property.bathrooms} baños.` : '.'}
                        {property.parking > 0 ? ` Incluye ${property.parking} parqueadero${property.parking > 1 ? 's' : ''}.` : ''}
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        El inmueble se encuentra en una zona privilegiada con excelente conectividad y acceso a servicios.
                        Cuenta con acabados de primera calidad y una distribución funcional que maximiza cada espacio.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Features */}
              {((property.features_internal && property.features_internal.length > 0) ||
                (property.features_external && property.features_external.length > 0)) && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Características</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {property.features_internal && property.features_internal.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <i className="ri-home-smile-line text-[#d4816f]"></i> Características Internas
                        </h3>
                        <div className="space-y-3">
                          {property.features_internal.map((feat, i) => {
                            const label = feat.replace(/-/g, ' ');
                            const formatted = label.charAt(0).toUpperCase() + label.slice(1);
                            return (
                              <div key={i} className="flex items-center gap-3">
                                <i className="ri-check-line text-[#d4816f] text-lg w-5 h-5 flex items-center justify-center"></i>
                                <span className="text-sm text-gray-700">{formatted}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {property.features_external && property.features_external.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <i className="ri-building-line text-[#d4816f]"></i> Características Externas
                        </h3>
                        <div className="space-y-3">
                          {property.features_external.map((feat, i) => {
                            const label = feat.replace(/-/g, ' ');
                            const formatted = label.charAt(0).toUpperCase() + label.slice(1);
                            return (
                              <div key={i} className="flex items-center gap-3">
                                <i className="ri-check-line text-[#d4816f] text-lg w-5 h-5 flex items-center justify-center"></i>
                                <span className="text-sm text-gray-700">{formatted}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location Map */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ubicación</h2>
                <div className="rounded-2xl overflow-hidden border border-gray-200 mb-4">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent((property.neighborhood || '') + ', ' + (property.city || '') + ', Colombia')}`}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    loading="lazy"
                    title={`Mapa de ${property.title}`}
                  ></iframe>
                </div>
                <div className="bg-[#f5f1ed] rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="ri-map-pin-2-line text-[#d4816f]"></i>
                    Puntos de Interés Cercanos
                    {!nearbyLoading && nearbyPlaces.length > 0 && (
                      <span className="ml-auto text-xs font-normal text-gray-500 flex items-center gap-1">
                        <i className="ri-google-fill text-[#4285F4]"></i> Google Maps
                      </span>
                    )}
                  </h3>

                  {nearbyLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                          <div className="w-10 h-10 bg-gray-300 rounded-lg flex-shrink-0"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!nearbyLoading && nearbyError && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No se pudieron cargar los puntos de interés para esta zona.
                    </p>
                  )}

                  {!nearbyLoading && !nearbyError && nearbyPlaces.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {nearbyPlaces.map((place, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                            <i className={`${place.icon} text-[#d4816f] text-xl`}></i>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{place.name}</p>
                            <p className="text-xs text-gray-500">{place.type} &bull; {place.distance}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Related Properties */}
              {relatedProperties.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Inmuebles Similares</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedProperties.map((rp) => (
                      <Link
                        key={rp.id}
                        to={`/inmuebles/${rp.id}`}
                        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer block"
                      >
                        <div className="relative w-full h-40 bg-gray-100">
                          {rp.images && rp.images.length > 0 ? (
                            <img src={rp.images[0]} alt={rp.title} className="w-full h-full object-cover object-top" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <i className="ri-image-line text-gray-300 text-3xl"></i>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">{rp.title}</h4>
                          <p className="text-xs text-gray-500 mb-2">{rp.neighborhood}, {rp.city}</p>
                          <p className="text-lg font-bold text-gray-900">{formatPriceSupabase(rp.price, rp.currency)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">

                {/* ── TARJETA AGENTE ── */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">Agente a cargo</p>
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-[#d4816f]/20 bg-gray-100 flex items-center justify-center">
                      {agentPhotoUrl ? (
                        <img src={agentPhotoUrl} alt={agentFullName} className="w-full h-full object-cover" />
                      ) : (
                        <i className="ri-user-3-line text-gray-400 text-4xl"></i>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{agentFullName}</h3>
                    <p className="text-sm text-gray-500 mb-3">Agente Inmobiliario</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-700 font-medium">
                      <i className="ri-phone-line text-[#d4816f]"></i>
                      <span>{agentPhoneDisplay}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleWhatsAppContact}
                    className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-lg"
                  >
                    <i className="ri-whatsapp-line text-2xl"></i> Contactar por WhatsApp
                  </button>
                </div>

                {/* Additional Info */}
                <div className="bg-[#f5f1ed] rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Información Adicional</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <i className="ri-shield-check-line text-[#d4816f] text-lg mt-0.5"></i>
                      <p className="text-gray-700">Propiedad verificada y con documentación al día</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-calendar-check-line text-[#d4816f] text-lg mt-0.5"></i>
                      <p className="text-gray-700">Disponible para visitas con cita previa</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-home-gear-line text-[#d4816f] text-lg mt-0.5"></i>
                      <p className="text-gray-700">Asesoría completa en el proceso de {property.operation.toLowerCase()}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-user-star-line text-[#d4816f] text-lg mt-0.5"></i>
                      <p className="text-gray-700">Agente: {agentFullName}</p>
                    </div>
                  </div>
                </div>

                {/* Back button */}
                <button
                  onClick={() => navigate('/inmuebles')}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-arrow-left-line"></i> Ver todos los inmuebles
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
