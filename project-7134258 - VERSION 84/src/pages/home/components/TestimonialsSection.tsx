import { motion } from 'framer-motion';
import { testimonials } from '../../../mocks/testimonials';
import { testimonials_pr } from '../../../mocks/testimonials_pr';

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-[#f5f1ed]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header for tenant testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-[#d4816f] rounded-full"></div>
            <span className="text-[#d4816f] text-sm font-medium uppercase tracking-wider">
              Testimonios
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Lo que dicen nuestros inquilinos
          </h2>
          <p className="text-xl text-gray-600 font-light">
            Experiencias reales de quienes confían en KÚA EASY LIVING
          </p>
        </motion.div>

        {/* Tenant testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <i
                    key={i}
                    className="ri-star-fill text-[#d4816f] text-lg w-5 h-5 flex items-center justify-center"
                  ></i>
                ))}
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">
                {testimonial.title}
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {testimonial.comment}
              </p>
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">{testimonial.rentalType}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Header for property‑owner testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center my-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Nuestros propietarios aliados opinan
          </h2>
          <p className="text-xl text-gray-600 font-light">
            Experiencias reales de quienes confían en KÚA EASY LIVING
          </p>
        </motion.div>

        {/* Property‑owner testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials_pr.map((testimonial_pr, index) => (
            <motion.div
              key={testimonial_pr.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex space-x-1 mb-4">
                {[...Array(testimonial_pr.rating)].map((_, i) => (
                  <i
                    key={i}
                    className="ri-star-fill text-[#d4816f] text-lg w-5 h-5 flex items-center justify-center"
                  ></i>
                ))}
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">
                {testimonial_pr.title}
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {testimonial_pr.comment}
              </p>
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={testimonial_pr.avatar}
                    alt={testimonial_pr.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{testimonial_pr.name}</p>
                  <p className="text-xs text-gray-500">{testimonial_pr.rentalType}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}