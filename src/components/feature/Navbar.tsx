import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/inmuebles', label: 'Inmuebles' },
    { path: '/nosotros', label: 'Nosotros' },
    { path: '/faq', label: 'Preguntas Frecuentes' },
    { path: '/contacto', label: 'Contacto' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          transparent && !scrolled
            ? 'bg-transparent'
            : 'bg-white shadow-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center">
              <img
                src="https://static.readdy.ai/image/cb7ded29cef3cb483302975a65930c02/4b0b3c2bed0589c2686b4ab95cd2e755.png"
                alt="KÚA EASY LIVING"
                className="h-16 w-auto object-contain"
              />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    transparent && !scrolled
                      ? isActive(link.path)
                        ? 'text-white border-b-2 border-white pb-1'
                        : 'text-white/90 hover:text-white'
                      : isActive(link.path)
                      ? 'text-[#d4816f] border-b-2 border-[#d4816f] pb-1'
                      : 'text-gray-700 hover:text-[#d4816f]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <Link
              to="/inmuebles"
              className="hidden md:block bg-[#184E37] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#143d2c] transition-colors duration-200 whitespace-nowrap cursor-pointer"
            >
              Explorar Propiedades
              <i className="ri-arrow-right-line ml-2"></i>
            </Link>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700 cursor-pointer w-10 h-10 flex items-center justify-center"
              aria-label="Menú"
            >
              <i className={`${mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-2xl ${transparent && !scrolled ? 'text-white' : 'text-gray-700'}`}></i>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <img
                    src="https://static.readdy.ai/image/cb7ded29cef3cb483302975a65930c02/4b0b3c2bed0589c2686b4ab95cd2e755.png"
                    alt="KÚA EASY LIVING"
                    className="h-12 w-auto object-contain"
                  />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    aria-label="Cerrar menú"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>

                <nav className="flex-1 py-8 px-6">
                  <div className="flex flex-col space-y-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`text-base font-medium py-4 px-4 rounded-lg transition-all duration-200 cursor-pointer ${
                          isActive(link.path)
                            ? 'bg-[#184E37] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <Link
                      to="/inmuebles"
                      className="flex items-center justify-center bg-[#184E37] text-white px-6 py-4 rounded-full text-base font-semibold hover:bg-[#143d2c] transition-colors duration-200 whitespace-nowrap cursor-pointer"
                    >
                      <span>Explorar Propiedades</span>
                      <i className="ri-arrow-right-line ml-2"></i>
                    </Link>
                  </div>

                  <div className="mt-6">
                    <Link
                      to="/login"
                      className="flex items-center justify-center border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-full text-base font-semibold hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-login-box-line mr-2"></i>
                      <span>Acceso Back Office</span>
                    </Link>
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}