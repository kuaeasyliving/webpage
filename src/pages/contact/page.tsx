import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const whatsappNumber = '573001345428';
    const message = `*SOLICITUD DE CONTACTO KÚA (Web)*\n\n*Nombre:* ${formData.name}\n*Email:* ${formData.email}\n*Telefono:* ${formData.phone}\n*Tipo de Renta:* ${formData.propertyType}\n*Mensaje:* ${formData.message}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    setSubmitStatus('success');
    setFormData({
      name: '',
      email: '',
      phone: '',
      propertyType: '',
      message: ''
    });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Contáctanos
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Estamos aquí para ayudarte a encontrar tu hogar ideal. Completa el formulario y nos pondremos en contacto contigo lo antes posible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="bg-[#f5f1ed] rounded-3xl p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-[#d4816f] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <i className="ri-map-pin-line text-2xl text-white w-6 h-6 flex items-center justify-center"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Dirección</h3>
                    <p className="text-gray-600">
                      Cl 19 No 8 31 Of 300 Ed Valerio Salazar, Centro
                      <br />
                      Pereira,Risaralda  660004
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#f5f1ed] rounded-3xl p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-[#d4816f] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <i className="ri-phone-line text-2xl text-white w-6 h-6 flex items-center justify-center"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Teléfono</h3>
                    <p className="text-gray-600">+57 300 134 5428</p>
                    <p className="text-sm text-gray-500 mt-1">Lunes a Sabado: 8:00 AM - 06:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#f5f1ed] rounded-3xl p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-[#d4816f] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <i className="ri-mail-line text-2xl text-white w-6 h-6 flex items-center justify-center"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                    <p className="text-gray-600">kuaeasyliving@gmail.com</p>
                    <p className="text-sm text-gray-500 mt-1">Respuesta en 24 horas</p>
                  </div>
                </div>
              </div>

              <div className="w-full h-80 rounded-3xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d1987.873112169442!2d-75.69562812686466!3d4.81357999846976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNMKwNDgnNDguOSJOIDc1wrA0MSczOS4xIlc!5e0!3m2!1ses-419!2sco!4v1771867595001!5m2!1ses-419!2sco"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación KÚA EASY LIVING"
                ></iframe>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <form id="contact-form" data-readdy-form onSubmit={handleSubmit} className="bg-white border-2 border-gray-200 rounded-3xl p-8 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d4816f] focus:border-transparent"
                    placeholder="Tu nombre y apellido"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d4816f] focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d4816f] focus:border-transparent"
                    placeholder="+57 300 1234 5678"
                  />
                </div>

                <div>
                  <label htmlFor="propertyType" className="block text-sm font-semibold text-gray-900 mb-2">
                    Tipo de renta *
                  </label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d4816f] focus:border-transparent cursor-pointer"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Renta Corta">Renta Corta</option>
                    <option value="Renta Tradicional">Renta Tradicional</option>
                    <option value="No estoy seguro">No estoy seguro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    maxLength={500}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d4816f] focus:border-transparent resize-none"
                    placeholder="Cuéntanos qué estás buscando..."
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">Máximo 500 caracteres</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#d4816f] text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-[#c27060] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                </button>

                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm">
                    ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm">
                    Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}