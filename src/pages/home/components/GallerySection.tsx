import { motion } from 'framer-motion';

const spaces = [
  {
    id: 1,
    name: 'Sala, la comodidad es irrenunciable',
    description: 'La sala o sala comedor es el corazón social del hogar. Es el lugar donde la familia comparte, conversa y recibe visitas. Mantenerla acogedora, bien iluminada y organizada ayuda a crear un ambiente cálido que invita a disfrutar momentos especiales juntos',
    image: 'https://readdy.ai/api/search-image?query=Modern%20luxury%20living%20room%20interior%20design%20with%20comfortable%20elegant%20furniture%2C%20large%20windows%20with%20natural%20daylight%2C%20contemporary%20minimalist%20style%2C%20neutral%20beige%20and%20cream%20color%20palette%2C%20simple%20clean%20background%2C%20professional%20real%20estate%20photography%2C%20spacious%20open%20concept%2C%20warm%20inviting%20atmosphere&width=600&height=400&seq=living1&orientation=landscape'
  },
  {
    id: 2,
    name: 'Cocina, que saque el chef interior',
    description: 'La cocina es uno de los espacios más importantes del hogar, porque allí se preparan los alimentos y se comparten pequeños momentos cotidianos. Una cocina funcional, limpia y bien distribuida facilita las tareas diarias y hace más agradable el tiempo en casa.',
    image: 'https://readdy.ai/api/search-image?query=Modern%20equipped%20kitchen%20interior%20with%20high-end%20appliances%2C%20sleek%20contemporary%20design%2C%20marble%20countertops%2C%20neutral%20white%20and%20beige%20tones%2C%20simple%20clean%20background%2C%20professional%20real%20estate%20photography%2C%20natural%20lighting%2C%20spacious%20functional%20layout%2C%20elegant%20minimalist%20style&width=600&height=400&seq=kitchen1&orientation=landscape'
  },
  {
    id: 3,
    name: 'Habitaciones, que inviten a descansar',
    description: 'Las habitaciones son el refugio personal dentro del hogar. Son espacios destinados al descanso, la privacidad y la tranquilidad. Mantenerlas cómodas, ordenadas y con una buena ventilación contribuye al bienestar, favorece el descanso y mejora la calidad de vida diaria',
    image: 'https://readdy.ai/api/search-image?query=Comfortable%20modern%20bedroom%20interior%20with%20cozy%20bed%2C%20elegant%20furniture%2C%20soft%20natural%20lighting%2C%20neutral%20warm%20color%20scheme%20with%20beige%20accents%2C%20simple%20clean%20background%2C%20professional%20real%20estate%20photography%2C%20peaceful%20relaxing%20atmosphere%2C%20contemporary%20design%20style&width=600&height=400&seq=bedroom1&orientation=landscape'
  }
];

export default function GallerySection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 leading-tight">
            Espacios diseñados
            <br />
            para tu comodidad
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {spaces.map((space, index) => (
            <motion.div
              key={space.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="border border-gray-200 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="w-full h-64 bg-white p-6 flex items-center justify-center">
                  <img
                    src={space.image}
                    alt={space.name}
                    className="w-full h-full object-cover object-top rounded-2xl shadow-lg"
                  />
                </div>
                <div className="p-6 bg-white">
                  <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">
                    {space.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {space.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}