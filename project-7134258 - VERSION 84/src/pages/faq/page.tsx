import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { faqs } from '../../mocks/faqs';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const categories = ['Renta Corta', 'Renta Tradicional', 'Pagos y Políticas'];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-2 lg:sticky lg:top-32 h-fit"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Preguntas
                <br />
                Frecuentes
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Todo lo que necesitas saber sobre nuestros servicios de renta
              </p>
              <div className="w-full h-80 rounded-3xl overflow-hidden">
                <img
                  src="https://static.readdy.ai/image/cb7ded29cef3cb483302975a65930c02/58b057f276340e2ed2f12dac84325f58.jpeg"
                  alt="Servicio al cliente"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </motion.div>

            <div className="lg:col-span-3 space-y-12">
              {categories.map((category, catIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#d4816f]">
                    {category}
                  </h2>
                  <div className="space-y-4">
                    {faqs
                      .filter((faq) => faq.category === category)
                      .map((faq, index) => {
                        const globalIndex = faqs.findIndex((f) => f.id === faq.id);
                        const isOpen = openIndex === globalIndex;
                        
                        return (
                          <div
                            key={faq.id}
                            className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300"
                          >
                            <button
                              onClick={() => toggleFAQ(globalIndex)}
                              className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
                            >
                              <span className="text-lg font-bold text-gray-900 pr-4">
                                {faq.question}
                              </span>
                              <i
                                className={`ri-add-line text-2xl text-[#d4816f] transition-transform duration-300 w-6 h-6 flex items-center justify-center flex-shrink-0 ${
                                  isOpen ? 'rotate-45' : ''
                                }`}
                              ></i>
                            </button>
                            <div
                              className={`overflow-hidden transition-all duration-300 ${
                                isOpen ? 'max-h-96' : 'max-h-0'
                              }`}
                            >
                              <div className="px-6 pb-5">
                                <p className="text-gray-600 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-24 bg-[#f5f1ed] rounded-[40px] p-12 md:p-16 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿No encontraste lo que buscaste?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Nuestro equipo está disponible para responder todas tus preguntas personalmente
            </p>
            <a
              href="https://wa.me/573001345428"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#d4816f] text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-[#c27060] transition-colors duration-200 whitespace-nowrap cursor-pointer inline-block"
            >
              Contáctanos directamente
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}