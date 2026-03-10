import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <img
          src="https://static.readdy.ai/image/cb7ded29cef3cb483302975a65930c02/30c2176a870dbe28e75653220cc1abb3.jpeg"
          alt="KÚA EASY LIVING"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
      </div>

      <div className="relative h-full flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="inline-block px-6 py-2 border-2 border-white rounded-full mb-2">
              <span className="text-white text-sm font-medium">Renta Corta y Tradicional</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-tight tracking-wide">
              Encuentra tu espacio ideal
              <br />
              en KÚA EASY LIVING
            </h1>

            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Encuentra tu espacio ideal y deja que nosotros nos encarguemos del resto
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link
                to="/inmuebles"
                className="bg-white text-gray-900 px-8 py-4 rounded-full text-base font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
              >
                <span>Explorar Propiedades</span>
                <div className="w-8 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                  <i className="ri-arrow-right-line text-white"></i>
                </div>
              </Link>

              <Link
                to="/contacto"
                className="border-2 border-white text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-white hover:text-gray-900 transition-all duration-200 whitespace-nowrap cursor-pointer"
              >
                Contáctanos
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-7 border-2 border-white rounded-full flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}