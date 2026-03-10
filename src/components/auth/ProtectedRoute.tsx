import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getAuthUser } from '../../utils/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }

    // Verificar si se requiere rol de administrador
    if (requireAdmin) {
      const user = getAuthUser();
      if (user?.role !== 'Administrador') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [navigate, requireAdmin]);

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-slate-400 animate-spin"></i>
          <p className="text-slate-600 mt-4">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Verificar permisos de administrador si es requerido
  if (requireAdmin) {
    const user = getAuthUser();
    if (user?.role !== 'Administrador') {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <i className="ri-error-warning-line text-3xl text-red-600"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso Denegado</h2>
            <p className="text-slate-600 mb-6">No tienes permisos para acceder a esta sección</p>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-6 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors cursor-pointer whitespace-nowrap"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}