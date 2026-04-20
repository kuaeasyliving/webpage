import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#184e37] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-3xl font-bold mb-4">KÚA EASY LIVING</h3>
            <p className="text-white/80 text-base leading-relaxed mb-6">
              En KÚA cuidamos tu propiedad como si fuera nuestra y creamos hogares donde cada huésped se siente en casa.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/kuaeasyliving"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors duration-200 cursor-pointer"
              >
                <i className="ri-instagram-line text-lg"></i>
              </a>

              <a
                href="https://www.facebook.com/kuaeasyliving"
                className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors duration-200 cursor-pointer"
              >
                <i className="ri-facebook-fill text-lg"></i>
              </a>

              <a
                href="https://wa.me/573001345428"
                className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors duration-200 cursor-pointer"
              >
                <i className="ri-whatsapp-line text-lg"></i>
              </a>

              <a
                href="https://tiktok.com/@kuaeasyliving"
                className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors duration-200 cursor-pointer"
              >
                <i className="ri-tiktok-line text-lg"></i>
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs uppercase tracking-wider mb-2 text-white/60">Dirección</h4>
              <p className="text-white text-sm">
                Cl 19 No 8 31 Of 300 Ed Valerio Salazar, Centro
                <br />
                Pereira, Risaralda 660004
              </p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider mb-2 text-white/60">Teléfono</h4>
              <p className="text-white text-sm">+57 300 134 5428</p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider mb-2 text-white/60">Email</h4>
              <p className="text-white text-sm">kuaeasyliving@gmail.com</p>
            </div>
          </div>

          <div className="h-64 rounded-2xl overflow-hidden">
            <img
              src="https://static.readdy.ai/image/cb7ded29cef3cb483302975a65930c02/38b0c46772304a32f6fa8b3943d2b182.jpeg"
              alt="Oficina KÚA EASY LIVING"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-white/60">
            © 2025 KÚA Easy Living. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="/tratamiento-datos"
              className="text-sm text-white/60 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Tratamiento de Datos Personales
            </Link>
            <Link
              to="/politica-reembolso"
              className="text-sm text-white/60 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Política de Reembolso y Reservación
            </Link>
            <a
              href="https://readdy.ai/?ref=logo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/60 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              KÚA DEV
            </a>
            <Link
              to="/login"
              className="text-sm text-white/40 hover:text-white/60 transition-colors duration-200 cursor-pointer flex items-center gap-1"
              title="Acceso administrativo"
            >
              <i className="ri-settings-3-line text-xs"></i>
              <span>Gestionar Propiedades</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}