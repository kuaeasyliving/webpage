import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full h-[600px] rounded-[40px] overflow-hidden shadow-2xl"
            >
              <img
                src="https://readdy.ai/api/search-image?query=Professional real estate team in modern office environment, diverse business people working together, contemporary workspace with elegant design, warm welcoming atmosphere, neutral beige and white color palette, simple clean background, high-quality corporate photography, natural lighting, collaborative professional setting&width=800&height=1000&seq=team1&orientation=portrait"
                alt="Equipo KÚA EASY LIVING"
                className="w-full h-full object-cover object-top"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
                Sobre Nosotros
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Tu espacio en su mejor versión
              </h1>
              
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  En <strong className="text-gray-900">KÚA Easy Living</strong> somos una empresa inmobiliaria en Pereira especializada en renta de propiedades.
                </p>
                
                <p>
                  Conectamos propietarios e inquilinos con procesos claros, seguros y eficientes, brindando acompañamiento integral, respaldo legal y una gestión responsable en cada etapa del arrendamiento. 
                </p>
                
                <p>
                 Más que administrar inmuebles, creamos experiencias confiables para que cada espacio se convierta en una oportunidad.
                </p>
              </div>

              <div className="pt-4">
                <button className="bg-gray-900 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer">
                  <span>Conoce nuestras propiedades</span>
                  <i className="ri-arrow-right-up-line text-xl w-6 h-6 flex items-center justify-center"></i>
                </button>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {[
              {
                icon: 'ri-home-smile-line',
                title: 'Propiedades Premium',
                description: 'Inmuebles cuidadosamente seleccionados e inspeccionados, en las mejores ubicaciones'
              },
              {
                icon: 'ri-customer-service-2-line',
                title: 'Atención 24/7',
                description: 'Equipo profesional disponible en todo momento para resolver tus necesidades'
              },
              {
                icon: 'ri-shield-check-line',
                title: 'Confianza y Seguridad',
                description: 'Procesos transparentes y propiedades verificadas para tu tranquilidad'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#f5f1ed] rounded-3xl p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-[#d4816f] rounded-2xl flex items-center justify-center mb-6">
                  <i className={`${feature.icon} text-3xl text-white w-8 h-8 flex items-center justify-center`}></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Misión, Visión y Historia */}
          <div className="space-y-24 mb-24">

            {/* Misión */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-[#f5f1ed] px-4 py-2 rounded-full">
                  <i className="ri-focus-3-line text-[#d4816f] w-5 h-5 flex items-center justify-center"></i>
                  <span className="text-[#d4816f] text-sm font-semibold uppercase tracking-widest">Misión</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Transformar espacios en experiencias memorables
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                 En KÚA trabajamos con el propósito de brindar tranquilidad y confianza a los propietarios que nos conceden la administración de sus inmuebles, gestionándolos con responsabilidad, compromiso y el mismo cuidado como si fueran nuestros. Al mismo tiempo, creamos para nuestros huéspedes espacios acogedores, cómodos y auténticos, donde puedan sentirse como en casa y disfrutar experiencias confortables.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Trabajamos con pasión para que cada propiedad alcance su máximo potencial, generando valor real para quienes confían en nosotros.
                </p>
              </div>
              <div className="w-full h-[420px] rounded-[32px] overflow-hidden shadow-xl">
                <img
                  src="https://readdy.ai/api/search-image?query=Cozy and beautifully decorated living room interior with warm earthy tones, elegant furniture, soft natural lighting through large windows, plants and decorative elements, inviting and comfortable atmosphere, modern yet homey design, beige cream and terracotta color palette, high quality interior photography, simple clean background&width=800&height=600&seq=mision1&orientation=landscape"
                  alt="Misión KÚA Easy Living"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </motion.div>

            {/* Visión */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            >
              <div className="w-full h-[420px] rounded-[32px] overflow-hidden shadow-xl order-last lg:order-first">
                <img
                  src="https://readdy.ai/api/search-image?query=Aerial panoramic view of a beautiful Colombian coffee region landscape with green mountains, charming town architecture, lush vegetation, clear sky, warm golden hour light, vibrant natural colors, inspiring and aspirational scenery, high quality travel photography, simple clean background&width=800&height=600&seq=vision1&orientation=landscape"
                  alt="Visión KÚA Easy Living"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-[#f5f1ed] px-4 py-2 rounded-full">
                  <i className="ri-eye-line text-[#d4816f] w-5 h-5 flex items-center justify-center"></i>
                  <span className="text-[#d4816f] text-sm font-semibold uppercase tracking-widest">Visión</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Ser líderes en hospitalidad del Eje Cafetero
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                Ser la empresa líder en la administración de propiedades y alojamiento en el Eje Cafetero, reconocida por la confianza, la cercanía y la excelencia en el servicio. Aspiramos a consolidar una red de hogares temporales que conecten a propietarios e invitados, ofreciendo experiencias auténticas que reflejen la calidez, el confort y el espíritu de nuestra región.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Visualizamos un futuro donde cada propiedad que gestionamos sea un reflejo del espíritu y la calidez de nuestra región, posicionando al Eje Cafetero como destino de hospitalidad de clase mundial.
                </p>
              </div>
            </motion.div>

            {/* Nuestra Historia */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-[#f5f1ed] rounded-[40px] p-12 md:p-16"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full">
                    <i className="ri-history-line text-[#d4816f] w-5 h-5 flex items-center justify-center"></i>
                    <span className="text-[#d4816f] text-sm font-semibold uppercase tracking-widest">Nuestra Historia</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                    Una idea que nació del amor por los espacios
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    KÚA Easy Living nació de la convicción de que gestionar una propiedad debería ser simple, confiable y humano. Fundada en el corazón del Eje Cafetero, nuestra historia comenzó con un pequeño grupo de personas apasionadas por el diseño, la hospitalidad y el bienestar.
                  </p>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Con el tiempo, crecimos construyendo relaciones de confianza con propietarios e inquilinos, aprendiendo de cada experiencia y perfeccionando nuestro modelo de gestión. Hoy somos un equipo consolidado que combina tecnología, cercanía y vocación de servicio para ofrecer lo mejor de la hospitalidad regional.
                  </p>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Cada propiedad que administramos lleva consigo nuestra historia: la de un equipo que cree que los espacios bien cuidados transforman vidas.
                  </p>
                </div>
                <div className="w-full h-[480px] rounded-[28px] overflow-hidden shadow-xl">
                  <img
                    src="https://readdy.ai/api/search-image?query=Charming traditional Colombian coffee region house with colorful architecture, lush tropical garden, warm sunlight, vibrant flowers, rustic wooden details, welcoming entrance, authentic regional style, beautiful natural surroundings, high quality architectural photography, simple clean background, earthy warm tones&width=800&height=900&seq=historia1&orientation=portrait"
                    alt="Nuestra Historia KÚA Easy Living"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </motion.div>

          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#d4816f] to-[#c27060] rounded-[40px] p-12 md:p-16 text-center text-white"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              ¿Listo para encontrar tu espacio ideal?
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Nuestro equipo está listo para ayudarte a encontrar la propiedad perfecta que se adapte a tus necesidades
            </p>
            <a
              href= "https://wa.me/573001345428"
              className="bg-white text-gray-900 px-8 py-4 rounded-full text-base font-semibold hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap inline-block cursor-pointer"
            >
              Contáctanos ahora
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}