import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="relative h-[600px] overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/c/c2/Plaza-bolivar.jpg"
          alt="Comienza tu búsqueda"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30"></div>
      </div>

      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-6xl font-sans lowercase text-white mb-8 leading-tight">
                comienza tu
                <br />
                búsqueda hoy
              </h2>

              <div className="flex items-center space-x-4 mb-8">
                <Link
                  to="/inmuebles"
                  className="bg-white text-gray-900 px-8 py-4 rounded-full text-base font-semibold hover:bg-gray-100 transition-all duration-200 whitespace-nowrap cursor-pointer"
                >
                  Explorar propiedades
                </Link>
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors duration-200">
                  <i className="ri-arrow-right-line text-white text-xl w-6 h-6 flex items-center justify-center"></i>
                </div>
              </div>

              <div className="text-white text-lg font-light space-y-2">
                <p>Propiedades disponibles y alianzas estratégicas</p>
                <p>Atención personalizada 24/7</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}