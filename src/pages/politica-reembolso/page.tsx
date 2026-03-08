import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

const sections = [
  { id: 'introduccion', label: 'Introducción' },
  { id: 'definiciones', label: 'Definiciones' },
  { id: 'reservaciones', label: 'Política de Reservaciones' },
  { id: 'cancelaciones', label: 'Cancelaciones y Reembolsos' },
  { id: 'modificaciones', label: 'Modificaciones de Reserva' },
  { id: 'fuerza-mayor', label: 'Casos de Fuerza Mayor' },
  { id: 'responsabilidades', label: 'Responsabilidades' },
  { id: 'contacto', label: 'Contacto' },
];

export default function PoliticaReembolso() {
  const [activeSection, setActiveSection] = useState('introduccion');

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#184e37]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full mb-6">
              <i className="ri-file-text-line text-[#d4816f] w-5 h-5 flex items-center justify-center"></i>
              <span className="text-white/80 text-sm font-medium uppercase tracking-widest">Políticas Comerciales</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Política de Reembolso y Reservación
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              KÚA Easy Living S.A.S. — Condiciones y términos para reservaciones, cancelaciones y reembolsos de nuestros servicios de alojamiento.
            </p>
            <p className="text-white/50 text-sm mt-4">
              Última actualización: enero de 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">

            {/* Sidebar */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="sticky top-28">
                <div className="bg-[#f5f1ed] rounded-2xl p-6">
                  <p className="text-xs uppercase tracking-widest text-[#d4816f] font-semibold mb-4">Contenido</p>
                  <nav className="space-y-1">
                    {sections.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleNavClick(s.id)}
                        className={`w-full text-left text-sm px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
                          activeSection === s.id
                            ? 'bg-[#184e37] text-white font-medium'
                            : 'text-gray-600 hover:bg-white hover:text-gray-900'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              <div className="space-y-16">

                {/* 1. Introducción */}
                <motion.div
                  id="introduccion"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="1" title="Introducción y Objeto" />
                  <div className="prose-content space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                      La presente Política de Reembolso y Reservación establece los términos y condiciones aplicables a las reservaciones, cancelaciones, modificaciones y reembolsos de los servicios de alojamiento ofrecidos por <strong className="text-gray-900">KÚA Easy Living S.A.S.</strong>
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      Al realizar una reserva con KÚA Easy Living, el huésped acepta expresamente los términos aquí establecidos y se compromete a cumplir con las condiciones de uso de nuestros servicios.
                    </p>
                    <div className="p-5 bg-[#184e37]/5 border border-[#184e37]/20 rounded-xl">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        <strong className="text-[#184e37]">Objetivo:</strong> Garantizar transparencia, claridad y equidad en las relaciones comerciales entre KÚA Easy Living y sus huéspedes, estableciendo procedimientos claros para la gestión de reservas, cancelaciones y reembolsos.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <Divider />

                {/* 2. Definiciones */}
                <motion.div
                  id="definiciones"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="2" title="Definiciones Clave" />
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Para efectos de esta política, se establecen las siguientes definiciones:
                  </p>
                  <div className="space-y-4">
                    {[
                      { term: 'Reservación', def: 'Solicitud confirmada de alojamiento en una propiedad gestionada por KÚA Easy Living para un período determinado.' },
                      { term: 'Huésped', def: 'Persona natural que realiza una reservación y/o utiliza los servicios de alojamiento de KÚA Easy Living.' },
                      { term: 'Check-in', def: 'Fecha y hora de ingreso del huésped a la propiedad reservada.' },
                      { term: 'Check-out', def: 'Fecha y hora de salida del huésped de la propiedad reservada.' },
                      { term: 'Cancelación', def: 'Anulación de una reservación confirmada antes de la fecha de check-in.' },
                      { term: 'Reembolso', def: 'Devolución total o parcial del monto pagado por una reservación cancelada, según los términos establecidos.' },
                      { term: 'Tarifa Total', def: 'Monto total de la reservación incluyendo alojamiento, impuestos, tasas y cargos adicionales aplicables.' },
                      { term: 'Fuerza Mayor', def: 'Eventos imprevisibles, inevitables e irresistibles que impiden el cumplimiento de las obligaciones contractuales.' },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-[#f5f1ed] rounded-xl">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#d4816f] mt-2"></div>
                        <div>
                          <span className="font-semibold text-gray-900">{item.term}: </span>
                          <span className="text-gray-600">{item.def}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <Divider />

                {/* 3. Política de Reservaciones */}
                <motion.div
                  id="reservaciones"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="3" title="Política de Reservaciones" />
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <i className="ri-calendar-check-line text-[#d4816f] w-5 h-5 flex items-center justify-center"></i>
                        Proceso de Reservación
                      </h3>
                      <div className="space-y-3">
                        {[
                          'Las reservaciones pueden realizarse a través de nuestro sitio web, plataformas asociadas o contacto directo con KÚA Easy Living.',
                          'Toda reservación requiere el suministro de información personal completa y veraz del huésped.',
                          'La reservación se considera confirmada una vez recibido el pago correspondiente y enviada la confirmación por correo electrónico.',
                          'El huésped recibirá un código de confirmación único que deberá presentar al momento del check-in.',
                        ].map((item, i) => (
                          <div key={i} className="flex gap-3 p-4 bg-white border border-gray-100 rounded-xl">
                            <span className="flex-shrink-0 w-6 h-6 bg-[#184e37]/10 text-[#184e37] rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                            <p className="text-gray-600 text-sm leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <i className="ri-money-dollar-circle-line text-[#d4816f] w-5 h-5 flex items-center justify-center"></i>
                        Confirmación y Pagos
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { title: 'Pago Anticipado', desc: 'Se requiere el pago del 50% del valor total al momento de la reservación como anticipo.' },
                          { title: 'Pago Restante', desc: 'El 50% restante debe ser cancelado 7 días antes de la fecha de check-in.' },
                          { title: 'Métodos de Pago', desc: 'Aceptamos transferencias bancarias, tarjetas de crédito/débito y pagos en línea.' },
                          { title: 'Comprobante', desc: 'Todo pago genera un comprobante electrónico enviado al correo del huésped.' },
                        ].map((item, i) => (
                          <div key={i} className="p-5 bg-[#f5f1ed] rounded-xl">
                            <p className="font-semibold text-gray-900 text-sm mb-2">{item.title}</p>
                            <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex gap-3">
                        <i className="ri-information-line text-amber-600 w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"></i>
                        <p className="text-amber-800 text-sm leading-relaxed">
                          <strong>Importante:</strong> Las reservaciones no confirmadas mediante pago dentro de las 24 horas siguientes a la solicitud serán automáticamente canceladas y la disponibilidad liberada.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <Divider />

                {/* 4. Cancelaciones y Reembolsos */}
                <motion.div
                  id="cancelaciones"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="4" title="Política de Cancelaciones y Reembolsos" />
                  
                  <div className="space-y-6">
                    <p className="text-gray-600 leading-relaxed">
                      Los reembolsos por cancelación se calcularán según el tiempo transcurrido entre la fecha de cancelación y la fecha de check-in programada:
                    </p>

                    <div className="space-y-4">
                      {[
                        {
                          icon: 'ri-calendar-line',
                          title: 'Cancelación con más de 30 días de anticipación',
                          percentage: '100%',
                          color: 'bg-green-500',
                          desc: 'Reembolso total del monto pagado, sin penalización.',
                        },
                        {
                          icon: 'ri-calendar-2-line',
                          title: 'Cancelación entre 15 y 30 días de anticipación',
                          percentage: '75%',
                          color: 'bg-blue-500',
                          desc: 'Reembolso del 75% del monto pagado. Se retiene el 25% como cargo administrativo.',
                        },
                        {
                          icon: 'ri-calendar-event-line',
                          title: 'Cancelación entre 7 y 14 días de anticipación',
                          percentage: '50%',
                          color: 'bg-orange-500',
                          desc: 'Reembolso del 50% del monto pagado. Se retiene el 50% como penalización.',
                        },
                        {
                          icon: 'ri-calendar-close-line',
                          title: 'Cancelación con menos de 7 días de anticipación',
                          percentage: '0%',
                          color: 'bg-red-500',
                          desc: 'No hay reembolso. Se retiene el 100% del monto pagado.',
                        },
                      ].map((item, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                          <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-[#f5f1ed] to-white">
                            <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <i className={`${item.icon} text-white w-6 h-6 flex items-center justify-center`}></i>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm mb-1">{item.title}</p>
                              <p className="text-gray-600 text-sm">{item.desc}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">{item.percentage}</p>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Reembolso</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <i className="ri-time-line text-[#d4816f] w-5 h-5 flex items-center justify-center"></i>
                        Procedimiento de Cancelación
                      </h3>
                      <div className="space-y-3">
                        {[
                          'Las cancelaciones deben solicitarse por escrito al correo electrónico kuaeasyliving@gmail.com o a través de WhatsApp +57 300 134 5428.',
                          'La solicitud debe incluir: código de reservación, nombre del huésped, fechas de la reserva y motivo de cancelación.',
                          'KÚA Easy Living confirmará la recepción de la solicitud dentro de las 24 horas hábiles siguientes.',
                          'Los reembolsos se procesarán dentro de los 10 días hábiles siguientes a la confirmación de cancelación.',
                          'El reembolso se realizará mediante el mismo método de pago utilizado en la reservación original.',
                        ].map((item, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <i className="ri-arrow-right-s-line text-[#d4816f] mt-0.5 w-5 h-5 flex items-center justify-center flex-shrink-0"></i>
                            <p className="text-gray-600 text-sm leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex gap-3">
                        <i className="ri-alert-line text-red-600 w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"></i>
                        <div>
                          <p className="font-semibold text-red-900 text-sm mb-1">No Show (No Presentación)</p>
                          <p className="text-red-800 text-sm leading-relaxed">
                            Si el huésped no se presenta en la fecha de check-in sin haber cancelado previamente, se considerará como "no show" y no habrá derecho a reembolso alguno. El 100% del monto pagado será retenido.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <Divider />

                {/* 5. Modificaciones */}
                <motion.div
                  id="modificaciones"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="5" title="Modificaciones de Reserva" />
                  
                  <div className="space-y-6">
                    <p className="text-gray-600 leading-relaxed">
                      KÚA Easy Living permite modificaciones a las reservaciones existentes sujetas a disponibilidad y a las siguientes condiciones:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          icon: 'ri-calendar-todo-line',
                          title: 'Cambio de Fechas',
                          items: [
                            'Permitido con más de 15 días de anticipación',
                            'Sujeto a disponibilidad de la propiedad',
                            'Sin cargo adicional si el valor es igual o superior',
                            'Diferencia de tarifa aplicable según temporada',
                          ],
                        },
                        {
                          icon: 'ri-home-gear-line',
                          title: 'Cambio de Propiedad',
                          items: [
                            'Permitido con más de 7 días de anticipación',
                            'Sujeto a disponibilidad',
                            'Ajuste de tarifa según la nueva propiedad',
                            'Cargo administrativo del 10% si aplica',
                          ],
                        },
                        {
                          icon: 'ri-group-line',
                          title: 'Cambio de Huéspedes',
                          items: [
                            'Permitido hasta 48 horas antes del check-in',
                            'Debe notificarse por escrito',
                            'Nuevos huéspedes deben cumplir requisitos',
                            'Sin cargo adicional',
                          ],
                        },
                        {
                          icon: 'ri-time-line',
                          title: 'Extensión de Estadía',
                          items: [
                            'Sujeto a disponibilidad de la propiedad',
                            'Tarifa según temporada vigente',
                            'Debe solicitarse con 48 horas de anticipación',
                            'Pago inmediato de noches adicionales',
                          ],
                        },
                      ].map((item, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                          <div className="bg-[#184e37] px-5 py-3 flex items-center gap-2">
                            <i className={`${item.icon} text-white w-5 h-5 flex items-center justify-center`}></i>
                            <p className="text-white font-semibold text-sm">{item.title}</p>
                          </div>
                          <div className="px-5 py-4 space-y-2">
                            {item.items.map((subitem, j) => (
                              <div key={j} className="flex items-start gap-2 text-gray-600 text-sm">
                                <i className="ri-checkbox-circle-line text-[#d4816f] w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5"></i>
                                {subitem}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-5 bg-[#184e37]/5 border border-[#184e37]/20 rounded-xl">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        <strong className="text-[#184e37]">Procedimiento:</strong> Todas las modificaciones deben solicitarse por escrito a través de kuaeasyliving@gmail.com o WhatsApp +57 300 134 5428. KÚA Easy Living confirmará la viabilidad de la modificación dentro de las 24 horas hábiles siguientes.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <Divider />

                {/* 6. Fuerza Mayor */}
                <motion.div
                  id="fuerza-mayor"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="6" title="Casos de Fuerza Mayor" />
                  
                  <div className="space-y-6">
                    <p className="text-gray-600 leading-relaxed">
                      En situaciones de fuerza mayor que impidan el cumplimiento de la reservación, se aplicarán condiciones especiales:
                    </p>

                    <div className="space-y-4">
                      <div className="p-5 bg-[#f5f1ed] rounded-xl">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <i className="ri-alert-line text-[#d4816f] w-5 h-5 flex items-center justify-center"></i>
                          Eventos Considerados Fuerza Mayor
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            'Desastres naturales (terremotos, inundaciones, huracanes)',
                            'Pandemias o emergencias sanitarias declaradas',
                            'Conflictos armados o disturbios civiles',
                            'Restricciones gubernamentales de viaje',
                            'Daños estructurales graves en la propiedad',
                            'Cortes prolongados de servicios públicos esenciales',
                          ].map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                              <i className="ri-checkbox-circle-line text-[#184e37] w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5"></i>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 border border-[#184e37] rounded-xl">
                          <div className="w-12 h-12 bg-[#184e37] rounded-xl flex items-center justify-center mb-3">
                            <i className="ri-shield-check-line text-white w-6 h-6 flex items-center justify-center"></i>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">Fuerza Mayor por KÚA</h4>
                          <p className="text-gray-600 text-sm leading-relaxed mb-3">
                            Si KÚA Easy Living no puede cumplir con la reservación por causas de fuerza mayor:
                          </p>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex gap-2">
                              <span className="text-[#d4816f]">•</span>
                              Reembolso del 100% del monto pagado
                            </li>
                            <li className="flex gap-2">
                              <span className="text-[#d4816f]">•</span>
                              O reubicación en propiedad similar sin costo adicional
                            </li>
                            <li className="flex gap-2">
                              <span className="text-[#d4816f]">•</span>
                              Crédito del 110% para reserva futura
                            </li>
                          </ul>
                        </div>

                        <div className="p-5 border border-[#d4816f] rounded-xl">
                          <div className="w-12 h-12 bg-[#d4816f] rounded-xl flex items-center justify-center mb-3">
                            <i className="ri-user-line text-white w-6 h-6 flex items-center justify-center"></i>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">Fuerza Mayor por el Huésped</h4>
                          <p className="text-gray-600 text-sm leading-relaxed mb-3">
                            Si el huésped no puede cumplir con la reservación por causas de fuerza mayor debidamente documentadas:
                          </p>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex gap-2">
                              <span className="text-[#d4816f]">•</span>
                              Reembolso del 80% del monto pagado
                            </li>
                            <li className="flex gap-2">
                              <span className="text-[#d4816f]">•</span>
                              O crédito del 100% para reserva futura (válido 12 meses)
                            </li>
                            <li className="flex gap-2">
                              <span className="text-[#d4816f]">•</span>
                              Requiere documentación probatoria
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex gap-3">
                          <i className="ri-file-text-line text-blue-600 w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"></i>
                          <div>
                            <p className="font-semibold text-blue-900 text-sm mb-1">Documentación Requerida</p>
                            <p className="text-blue-800 text-sm leading-relaxed">
                              Para acogerse a las condiciones de fuerza mayor, el huésped debe presentar documentación oficial que respalde la situación (certificados médicos, restricciones gubernamentales, etc.) dentro de las 48 horas siguientes al evento.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <Divider />

                {/* 7. Responsabilidades */}
                <motion.div
                  id="responsabilidades"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="7" title="Responsabilidades y Condiciones Adicionales" />
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <i className="ri-building-line text-[#d4816f] w-5 h-5 flex items-center justify-center"></i>
                        Responsabilidades de KÚA Easy Living
                      </h3>
                      <div className="space-y-3">
                        {[
                          'Garantizar que la propiedad esté en condiciones óptimas de habitabilidad al momento del check-in.',
                          'Proporcionar información veraz y completa sobre las características de la propiedad.',
                          'Procesar los reembolsos en los plazos establecidos en esta política.',
                          'Mantener comunicación clara y oportuna con los huéspedes.',
                          'Proteger los datos personales conforme a la Política de Tratamiento de Datos.',
                        ].map((item, i) => (
                          <div key={i} className="flex gap-3 p-4 bg-white border border-gray-100 rounded-xl">
                            <i className="ri-checkbox-circle-line text-[#184e37] w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"></i>
                            <p className="text-gray-600 text-sm leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <i className="ri-user-star-line text-[#d4816f] w-5 h-5 flex items-center justify-center"></i>
                        Responsabilidades del Huésped
                      </h3>
                      <div className="space-y-3">
                        {[
                          'Proporcionar información personal completa, veraz y actualizada al momento de la reservación.',
                          'Realizar los pagos en los plazos establecidos para confirmar la reservación.',
                          'Cumplir con las normas de convivencia y reglamento interno de la propiedad.',
                          'Reportar cualquier daño o desperfecto en la propiedad durante la estadía.',
                          'Respetar los horarios de check-in y check-out establecidos.',
                          'Notificar con anticipación cualquier modificación o cancelación de la reserva.',
                        ].map((item, i) => (
                          <div key={i} className="flex gap-3 p-4 bg-white border border-gray-100 rounded-xl">
                            <i className="ri-checkbox-circle-line text-[#d4816f] w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"></i>
                            <p className="text-gray-600 text-sm leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex gap-3">
                        <i className="ri-error-warning-line text-amber-600 w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"></i>
                        <div>
                          <p className="font-semibold text-amber-900 text-sm mb-1">Daños y Cargos Adicionales</p>
                          <p className="text-amber-800 text-sm leading-relaxed">
                            El huésped será responsable de cualquier daño causado a la propiedad durante su estadía. KÚA Easy Living se reserva el derecho de realizar cargos adicionales por daños, limpieza extraordinaria, pérdida de llaves o incumplimiento del reglamento interno.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <Divider />

                {/* 8. Contacto */}
                <motion.div
                  id="contacto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="8" title="Contacto y Atención al Cliente" />
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Para consultas, solicitudes de cancelación, modificaciones o cualquier asunto relacionado con su reservación, puede contactarnos a través de los siguientes canales:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[
                      { icon: 'ri-mail-line', label: 'Correo Electrónico', value: 'kuaeasyliving@gmail.com', href: 'mailto:kuaeasyliving@gmail.com' },
                      { icon: 'ri-whatsapp-line', label: 'WhatsApp', value: '+57 300 134 5428', href: 'https://wa.me/573001345428' },
                      { icon: 'ri-phone-line', label: 'Teléfono', value: '+57 300 134 5428', href: 'tel:+573001345428' },
                    ].map((c, i) => (
                      <a
                        key={i}
                        href={c.href}
                        className="flex flex-col items-center text-center p-6 bg-[#f5f1ed] rounded-2xl hover:bg-[#184e37] hover:text-white group transition-all duration-300 cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-[#184e37] group-hover:bg-white rounded-xl flex items-center justify-center mb-3 transition-all duration-300">
                          <i className={`${c.icon} text-white group-hover:text-[#184e37] w-6 h-6 flex items-center justify-center transition-all duration-300`}></i>
                        </div>
                        <p className="text-xs uppercase tracking-widest text-gray-500 group-hover:text-white/70 mb-1 transition-colors duration-300">{c.label}</p>
                        <p className="font-semibold text-gray-900 group-hover:text-white text-sm transition-colors duration-300">{c.value}</p>
                      </a>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-5 bg-[#184e37] rounded-xl text-white">
                      <div className="flex gap-3 items-start">
                        <i className="ri-time-line text-[#d4816f] w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5"></i>
                        <div>
                          <p className="font-semibold mb-2">Horario de Atención</p>
                          <p className="text-white/70 text-sm leading-relaxed">
                            Lunes a Viernes: 8:00 AM - 6:00 PM<br />
                            Sábados: 9:00 AM - 2:00 PM<br />
                            Domingos y Festivos: Atención por WhatsApp
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-[#d4816f] rounded-xl text-white">
                      <div className="flex gap-3 items-start">
                        <i className="ri-customer-service-2-line text-white w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5"></i>
                        <div>
                          <p className="font-semibold mb-2">Tiempo de Respuesta</p>
                          <p className="text-white/90 text-sm leading-relaxed">
                            Consultas generales: 24 horas<br />
                            Cancelaciones: 24 horas<br />
                            Emergencias durante estadía: Inmediato
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-[#f5f1ed] rounded-2xl">
                    <div className="flex gap-3 items-start">
                      <i className="ri-map-pin-line text-[#184e37] w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5"></i>
                      <div>
                        <p className="font-semibold text-gray-900 mb-2">Oficina Principal</p>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Cl 19 No 8 31 Of 300 Ed Valerio Salazar, Centro<br />
                          Pereira, Risaralda 660004, Colombia
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

              </div>
            </main>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-10 h-10 flex-shrink-0 bg-[#d4816f] rounded-xl flex items-center justify-center">
        <span className="text-white font-bold text-sm">{number}</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-gray-100" />;
}