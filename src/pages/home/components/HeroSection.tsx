import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <img
          src="https://static.readdy.ai/image/cb7ded29cef3cb483302975a65930c02/30c2176a870dbe28e75653220cc1abb3.jpeg"
          alt="KÚA EASY LIVING"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center">
        <div className="w-full max-w-7xl text-center mt-[-70px] md:mt-[-60px] px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Badge — separado con margen amplio del título */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mb-8 sm:mb-12 flex justify-center -translate-y-10 sm:-translate-y-16"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/70 rounded-full backdrop-blur-sm bg-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4816f] inline-block flex-shrink-0"></span>
                <span className="text-white text-xs sm:text-sm font-medium tracking-widest uppercase">
                  Renta Corta y Tradicional
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4816f] inline-block flex-shrink-0"></span>
              </div>
            </motion.div>

            {/* Título */}
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-black text-white leading-tight tracking-wide mb-6 sm:mb-8">
              Encuentra tu espacio ideal
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              en KÚA EASY LIVING
            </h1>

            {/* Descripción */}
            <p className="text-base sm:text-xl text-white/90 max-w-xl sm:max-w-2xl mx-auto px-2 mb-8 sm:mb-12">
              Encuentra tu espacio ideal y deja que nosotros nos encarguemos del resto
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-6 sm:px-0">
              <Link
                to="/inmuebles"
                className="w-full sm:w-auto bg-white text-gray-900 px-8 py-4 rounded-full text-sm sm:text-base font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2 whitespace-nowrap cursor-pointer min-h-[52px]"
              >
                <span>Explorar Propiedades</span>
                <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-arrow-right-line text-white text-sm"></i>
                </div>
              </Link>

              <Link
                to="/contacto"
                className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-full text-sm sm:text-base font-semibold hover:bg-white hover:text-gray-900 transition-all duration-200 whitespace-nowrap cursor-pointer text-center min-h-[52px] flex items-center justify-center"
              >
                Contáctanos
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator — mejorado: más alto, más visible, con texto */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        {/* Mouse scroll container */}
        <div className="w-7 h-12 sm:w-8 sm:h-14 border-2 border-white/60 rounded-full flex justify-center pt-2 backdrop-blur-[1px]">
          <motion.div
            animate={{ y: [0, 20, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-3 bg-white rounded-full"
          />
        </div>
        {/* Texto debajo */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-white/60 text-[10px] sm:text-xs tracking-widest uppercase font-medium"
        >
          Explorar
        </motion.p>
      </motion.div>
    </section>
  );
}
