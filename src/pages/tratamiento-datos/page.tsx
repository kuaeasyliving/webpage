
import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

const sections = [
  { id: 'identificacion', label: 'Identificación del Responsable' },
  { id: 'definiciones', label: 'Definiciones' },
  { id: 'principios', label: 'Principios' },
  { id: 'datos-recopilados', label: 'Datos Recopilados' },
  { id: 'finalidades', label: 'Finalidades del Tratamiento' },
  { id: 'derechos', label: 'Derechos del Titular' },
  { id: 'deberes', label: 'Deberes del Responsable' },
  { id: 'transferencia', label: 'Transferencia de Datos' },
  { id: 'seguridad', label: 'Medidas de Seguridad' },
  { id: 'vigencia', label: 'Vigencia' },
  { id: 'contacto', label: 'Contacto' },
];

export default function TratamientoDatos() {
  const [activeSection, setActiveSection] = useState('identificacion');

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
              <i className="ri-shield-user-line text-[#d4816f] w-5 h-5 flex items-center justify-center"></i>
              <span className="text-white/80 text-sm font-medium uppercase tracking-widest">Política Legal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Política de Tratamiento de Datos Personales
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              KÚA Easy Living S.A.S. — En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013 de la República de Colombia.
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

                {/* 1. Identificación */}
                <motion.div
                  id="identificacion"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="1" title="Identificación del Responsable del Tratamiento" />
                  <div className="prose-content">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      La presente Política de Tratamiento de Datos Personales es adoptada por <strong className="text-gray-900">KÚA Easy Living S.A.S.</strong>, empresa legalmente constituida en Colombia, con domicilio en:
                    </p>
                    <InfoCard items={[
                      { label: 'Razón Social', value: 'KÚA Easy Living S.A.S.' },
                      { label: 'Dirección', value: 'Cl 19 No 8 31 Of 300 Ed Valerio Salazar, Centro, Pereira, Risaralda 660004' },
                      { label: 'Teléfono', value: '+57 300 134 5428' },
                      { label: 'Correo electrónico', value: 'kuaeasyliving@gmail.com' },
                    ]} />
                    <p className="text-gray-600 leading-relaxed mt-4">
                      En adelante denominada <strong className="text-gray-900">"KÚA"</strong> o el <strong className="text-gray-900">"Responsable"</strong>.
                    </p>
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
                  <SectionTitle number="2" title="Definiciones" />
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Para efectos de la presente política, se adoptan las siguientes definiciones conforme a la Ley 1581 de 2012:
                  </p>
                  <div className="space-y-4">
                    {[
                      { term: 'Dato Personal', def: 'Cualquier información vinculada o que pueda asociarse a una o varias personas naturales determinadas o determinables.' },
                      { term: 'Dato Sensible', def: 'Aquel que afecta la intimidad del titular o cuyo uso indebido puede generar discriminación, tales como datos de salud, orientación sexual, origen racial o étnico, opiniones políticas, convicciones religiosas, entre otros.' },
                      { term: 'Titular', def: 'Persona natural cuyos datos personales son objeto de tratamiento.' },
                      { term: 'Responsable del Tratamiento', def: 'Persona natural o jurídica, pública o privada, que por sí misma o en asocio con otros, decida sobre la base de datos y/o el tratamiento de los datos.' },
                      { term: 'Encargado del Tratamiento', def: 'Persona natural o jurídica, pública o privada, que por sí misma o en asocio con otros, realice el tratamiento de datos personales por cuenta del responsable.' },
                      { term: 'Tratamiento', def: 'Cualquier operación o conjunto de operaciones sobre datos personales, tales como la recolección, almacenamiento, uso, circulación o supresión.' },
                      { term: 'Autorización', def: 'Consentimiento previo, expreso e informado del titular para llevar a cabo el tratamiento de datos personales.' },
                      { term: 'Base de Datos', def: 'Conjunto organizado de datos personales que sea objeto de tratamiento.' },
                      { term: 'Aviso de Privacidad', def: 'Comunicación verbal o escrita generada por el responsable, dirigida al titular para el tratamiento de sus datos personales.' },
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

                {/* 3. Principios */}
                <motion.div
                  id="principios"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="3" title="Principios Rectores del Tratamiento" />
                  <p className="text-gray-600 leading-relaxed mb-6">
                    KÚA Easy Living aplica los siguientes principios en el tratamiento de datos personales:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: 'ri-lock-line', title: 'Legalidad', desc: 'El tratamiento se sujeta a las disposiciones legales vigentes.' },
                      { icon: 'ri-focus-3-line', title: 'Finalidad', desc: 'Los datos se recopilan con fines determinados, explícitos y legítimos.' },
                      { icon: 'ri-filter-line', title: 'Libertad', desc: 'El tratamiento solo puede ejercerse con el consentimiento previo del titular.' },
                      { icon: 'ri-check-double-line', title: 'Veracidad', desc: 'Los datos deben ser veraces, completos, exactos y actualizados.' },
                      { icon: 'ri-eye-off-line', title: 'Transparencia', desc: 'El titular tiene derecho a obtener información sobre sus datos en cualquier momento.' },
                      { icon: 'ri-database-2-line', title: 'Acceso Restringido', desc: 'Solo personas autorizadas pueden acceder a los datos personales.' },
                      { icon: 'ri-shield-check-line', title: 'Seguridad', desc: 'Se adoptan medidas técnicas y administrativas para proteger los datos.' },
                      { icon: 'ri-time-line', title: 'Temporalidad', desc: 'Los datos se conservan solo por el tiempo necesario para cumplir la finalidad.' },
                    ].map((p, i) => (
                      <div key={i} className="flex gap-4 p-5 border border-gray-100 rounded-xl hover:border-[#d4816f]/30 hover:bg-[#f5f1ed]/40 transition-all duration-200">
                        <div className="w-10 h-10 flex-shrink-0 bg-[#184e37]/10 rounded-lg flex items-center justify-center">
                          <i className={`${p.icon} text-[#184e37] w-5 h-5 flex items-center justify-center`}></i>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm mb-1">{p.title}</p>
                          <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <Divider />

                {/* 4. Datos recopilados */}
                <motion.div
                  id="datos-recopilados"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="4" title="Datos Personales Recopilados" />
                  <p className="text-gray-600 leading-relaxed mb-6">
                    KÚA Easy Living podrá recopilar, almacenar y tratar las siguientes categorías de datos personales:
                  </p>
                  <div className="space-y-4">
                    {[
                      {
                        category: 'Datos de Identificación',
                        items: ['Nombre completo', 'Número de identificación (cédula, pasaporte)', 'Fecha de nacimiento', 'Nacionalidad'],
                      },
                      {
                        category: 'Datos de Contacto',
                        items: ['Dirección de residencia', 'Número de teléfono o celular', 'Correo electrónico'],
                      },
                      {
                        category: 'Datos Financieros',
                        items: ['Información bancaria para pagos y transferencias', 'Historial de transacciones relacionadas con los servicios contratados'],
                      },
                      {
                        category: 'Datos de Uso del Servicio',
                        items: ['Preferencias de alojamiento', 'Historial de reservas y estadías', 'Calificaciones y comentarios'],
                      },
                      {
                        category: 'Datos Técnicos',
                        items: ['Dirección IP', 'Tipo de dispositivo y navegador', 'Cookies y datos de navegación en nuestro sitio web'],
                      },
                    ].map((cat, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className="bg-[#184e37] px-5 py-3">
                          <p className="text-white font-semibold text-sm">{cat.category}</p>
                        </div>
                        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {cat.items.map((item, j) => (
                            <div key={j} className="flex items-center gap-2 text-gray-600 text-sm">
                              <i className="ri-checkbox-circle-line text-[#d4816f] w-4 h-4 flex items-center justify-center flex-shrink-0"></i>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <Divider />

                {/* 5. Finalidades */}
                <motion.div
                  id="finalidades"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="5" title="Finalidades del Tratamiento" />
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Los datos personales recopilados por KÚA Easy Living serán utilizados para las siguientes finalidades:
                  </p>
                  <div className="space-y-3">
                    {[
                      'Gestionar la relación contractual con propietarios e inquilinos/huéspedes.',
                      'Procesar reservas, pagos y facturación de los servicios ofrecidos.',
                      'Enviar comunicaciones relacionadas con los servicios contratados, incluyendo confirmaciones, recordatorios y actualizaciones.',
                      'Atender solicitudes, quejas, reclamos y sugerencias de los titulares.',
                      'Realizar actividades de mercadeo, publicidad y promoción de los servicios de KÚA, previa autorización del titular.',
                      'Cumplir con obligaciones legales, contables y tributarias.',
                      'Mejorar la calidad de los servicios mediante análisis estadísticos y de satisfacción.',
                      'Verificar la identidad de los usuarios para garantizar la seguridad de las transacciones.',
                      'Gestionar el acceso y uso de la plataforma digital de KÚA Easy Living.',
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3 p-4 bg-white border border-gray-100 rounded-xl">
                        <span className="flex-shrink-0 w-6 h-6 bg-[#d4816f]/10 text-[#d4816f] rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                        <p className="text-gray-600 text-sm leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <Divider />

                {/* 6. Derechos */}
                <motion.div
                  id="derechos"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="6" title="Derechos del Titular de los Datos" />
                  <p className="text-gray-600 leading-relaxed mb-6">
                    De conformidad con el artículo 8 de la Ley 1581 de 2012, el titular de los datos personales tiene los siguientes derechos:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: 'ri-eye-line', title: 'Conocer', desc: 'Conocer, actualizar y rectificar sus datos personales frente a KÚA Easy Living.' },
                      { icon: 'ri-edit-line', title: 'Actualizar y Rectificar', desc: 'Solicitar la corrección de datos inexactos, incompletos o desactualizados.' },
                      { icon: 'ri-shield-line', title: 'Solicitar Prueba', desc: 'Solicitar prueba de la autorización otorgada para el tratamiento de sus datos.' },
                      { icon: 'ri-information-line', title: 'Ser Informado', desc: 'Ser informado sobre el uso que se ha dado a sus datos personales.' },
                      { icon: 'ri-mail-send-line', title: 'Presentar Quejas', desc: 'Presentar ante la Superintendencia de Industria y Comercio quejas por infracciones.' },
                      { icon: 'ri-close-circle-line', title: 'Revocar Autorización', desc: 'Revocar la autorización y/o solicitar la supresión de sus datos cuando no se respeten los principios, derechos y garantías constitucionales y legales.' },
                      { icon: 'ri-spam-2-line', title: 'Acceso Gratuito', desc: 'Acceder en forma gratuita a sus datos personales que hayan sido objeto de tratamiento.' },
                    ].map((r, i) => (
                      <div key={i} className="flex gap-4 p-5 bg-[#f5f1ed] rounded-xl">
                        <div className="w-10 h-10 flex-shrink-0 bg-[#d4816f] rounded-lg flex items-center justify-center">
                          <i className={`${r.icon} text-white w-5 h-5 flex items-center justify-center`}></i>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm mb-1">{r.title}</p>
                          <p className="text-gray-500 text-sm leading-relaxed">{r.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-5 bg-[#184e37]/5 border border-[#184e37]/20 rounded-xl">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      <strong className="text-[#184e37]">Procedimiento:</strong> Para ejercer sus derechos, el titular podrá enviar una solicitud escrita al correo electrónico <strong>kuaeasyliving@gmail.com</strong> o dirigirse a nuestras oficinas. KÚA Easy Living dará respuesta en un plazo máximo de <strong>diez (10) días hábiles</strong> para consultas y <strong>quince (15) días hábiles</strong> para reclamos, contados a partir de la fecha de recibo de la solicitud.
                    </p>
                  </div>
                </motion.div>

                <Divider />

                {/* 7. Deberes */}
                <motion.div
                  id="deberes"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="7" title="Deberes del Responsable del Tratamiento" />
                  <p className="text-gray-600 leading-relaxed mb-6">
                    KÚA Easy Living, en su calidad de responsable del tratamiento, se compromete a cumplir los siguientes deberes:
                  </p>
                  <div className="space-y-3">
                    {[
                      'Garantizar al titular, en todo tiempo, el pleno y efectivo ejercicio del derecho de hábeas data.',
                      'Solicitar y conservar, en las condiciones previstas en la ley, copia de la respectiva autorización otorgada por el titular.',
                      'Informar debidamente al titular sobre la finalidad de la recolección y los derechos que le asisten.',
                      'Conservar la información bajo las condiciones de seguridad necesarias para impedir su adulteración, pérdida, consulta, uso o acceso no autorizado.',
                      'Garantizar que la información que se suministre al encargado del tratamiento sea veraz, completa, exacta, actualizada y verificable.',
                      'Tramitar las consultas y reclamos formulados en los términos señalados en la ley.',
                      'Adoptar un manual interno de políticas y procedimientos para garantizar el adecuado cumplimiento de la ley.',
                      'Registrar en la base de datos las leyenda "reclamo en trámite" en la forma en que se regula en la ley.',
                      'Insertar en la base de datos la leyenda "información en discusión judicial" una vez notificado por parte de la autoridad competente.',
                      'Abstenerse de circular información que esté siendo controvertida por el titular y cuyo bloqueo haya sido ordenado por la Superintendencia de Industria y Comercio.',
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <i className="ri-arrow-right-s-line text-[#d4816f] mt-0.5 w-5 h-5 flex items-center justify-center flex-shrink-0"></i>
                        <p className="text-gray-600 text-sm leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <Divider />

                {/* 8. Transferencia */}
                <motion.div
                  id="transferencia"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="8" title="Transferencia y Transmisión de Datos" />
                  <p className="text-gray-600 leading-relaxed mb-4">
                    KÚA Easy Living podrá transferir o transmitir datos personales a terceros únicamente en los siguientes casos:
                  </p>
                  <div className="space-y-3 mb-6">
                    {[
                      'Cuando el titular haya otorgado su autorización expresa para ello.',
                      'Cuando se trate de información requerida por una entidad pública o administrativa en ejercicio de sus funciones legales.',
                      'Cuando se trate de datos de naturaleza pública.',
                      'Cuando la transferencia sea necesaria para la ejecución de un contrato entre el titular y el responsable.',
                      'Cuando la transferencia sea necesaria para la ejecución de un contrato celebrado en interés del titular.',
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3 p-4 bg-white border border-gray-100 rounded-xl">
                        <i className="ri-checkbox-circle-line text-[#184e37] w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"></i>
                        <p className="text-gray-600 text-sm leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex gap-3">
                      <i className="ri-alert-line text-amber-600 w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"></i>
                      <p className="text-amber-800 text-sm leading-relaxed">
                        En ningún caso KÚA Easy Living venderá, alquilará ni comercializará los datos personales de sus titulares a terceros con fines comerciales propios de dichos terceros.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <Divider />

                {/* 9. Seguridad */}
                <motion.div
                  id="seguridad"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="9" title="Medidas de Seguridad" />
                  <p className="text-gray-600 leading-relaxed mb-6">
                    KÚA Easy Living implementa las siguientes medidas técnicas, humanas y administrativas para proteger los datos personales:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { icon: 'ri-server-line', title: 'Técnicas', items: ['Cifrado de datos en tránsito y en reposo', 'Control de acceso por roles', 'Copias de seguridad periódicas', 'Monitoreo de accesos no autorizados'] },
                      { icon: 'ri-team-line', title: 'Humanas', items: ['Capacitación al personal en protección de datos', 'Acuerdos de confidencialidad', 'Acceso restringido a información sensible', 'Auditorías internas periódicas'] },
                      { icon: 'ri-file-list-3-line', title: 'Administrativas', items: ['Políticas internas de seguridad', 'Procedimientos de respuesta a incidentes', 'Registro de actividades de tratamiento', 'Revisión periódica de esta política'] },
                    ].map((m, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className="bg-[#184e37] px-5 py-3 flex items-center gap-2">
                          <i className={`${m.icon} text-white w-5 h-5 flex items-center justify-center`}></i>
                          <p className="text-white font-semibold text-sm">Medidas {m.title}</p>
                        </div>
                        <div className="px-5 py-4 space-y-2">
                          {m.items.map((item, j) => (
                            <div key={j} className="flex items-start gap-2 text-gray-600 text-sm">
                              <i className="ri-checkbox-circle-line text-[#d4816f] w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5"></i>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <Divider />

                {/* 10. Vigencia */}
                <motion.div
                  id="vigencia"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="10" title="Vigencia de la Política y de las Bases de Datos" />
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      La presente Política de Tratamiento de Datos Personales rige a partir del <strong className="text-gray-900">1 de enero de 2025</strong> y estará vigente hasta tanto no sea modificada o derogada por KÚA Easy Living.
                    </p>
                    <p>
                      Las bases de datos en las que se registrarán los datos personales tendrán una vigencia igual al tiempo en que se mantenga y utilice la información para las finalidades descritas en esta política. Una vez cumplida(s) la(s) finalidad(es) y siempre que no exista un deber legal o contractual de conservar la información, los datos serán eliminados de las bases de datos de KÚA Easy Living.
                    </p>
                    <p>
                      KÚA Easy Living se reserva el derecho de modificar esta política en cualquier momento. Cualquier cambio sustancial será comunicado a los titulares a través de los canales habituales de comunicación con al menos <strong className="text-gray-900">diez (10) días hábiles</strong> de anticipación.
                    </p>
                  </div>
                </motion.div>

                <Divider />

                {/* 11. Contacto */}
                <motion.div
                  id="contacto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28"
                >
                  <SectionTitle number="11" title="Contacto y Ejercicio de Derechos" />
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Para ejercer sus derechos como titular, presentar consultas, reclamos o solicitudes relacionadas con el tratamiento de sus datos personales, puede comunicarse con KÚA Easy Living a través de los siguientes canales:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[
                      { icon: 'ri-mail-line', label: 'Correo Electrónico', value: 'kuaeasyliving@gmail.com', href: 'mailto:kuaeasyliving@gmail.com' },
                      { icon: 'ri-phone-line', label: 'Teléfono / WhatsApp', value: '+57 300 134 5428', href: 'https://wa.me/573001345428' },
                      { icon: 'ri-map-pin-line', label: 'Dirección Física', value: 'Cl 19 No 8 31 Of 300, Centro, Pereira', href: '#' },
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
                  <div className="p-6 bg-[#184e37] rounded-2xl text-white">
                    <div className="flex gap-3 items-start">
                      <i className="ri-information-line text-[#d4816f] w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5"></i>
                      <div>
                        <p className="font-semibold mb-2">Superintendencia de Industria y Comercio</p>
                        <p className="text-white/70 text-sm leading-relaxed">
                          Si considera que KÚA Easy Living ha vulnerado sus derechos como titular de datos personales, puede presentar una queja ante la <strong className="text-white">Superintendencia de Industria y Comercio (SIC)</strong>, entidad encargada de velar por el cumplimiento de la Ley 1581 de 2012 en Colombia. Sitio web: <strong className="text-white">www.sic.gov.co</strong>
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

function InfoCard({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="bg-[#f5f1ed] rounded-2xl p-6 space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col sm:flex-row sm:gap-4">
          <span className="text-xs uppercase tracking-widest text-[#d4816f] font-semibold sm:w-40 flex-shrink-0">{item.label}</span>
          <span className="text-gray-700 text-sm">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
