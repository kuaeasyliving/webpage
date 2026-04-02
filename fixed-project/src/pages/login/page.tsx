import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { login } from '../../utils/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Buscar usuario en la tabla agents
      const { data: agent, error: queryError } = await supabase
        .from('agents')
        .select('id, username, password_hash, role, first_name, last_name, is_active')
        .eq('username', username)
        .maybeSingle();

      if (queryError) {
        console.error('Error al consultar usuario:', queryError);
        setError('Error al verificar credenciales');
        setIsLoading(false);
        return;
      }

      if (!agent) {
        setError('Credenciales inválidas');
        setIsLoading(false);
        return;
      }

      // Verificar si el usuario está activo
      if (!agent.is_active) {
        setError('Usuario inactivo. Contacte al administrador');
        setIsLoading(false);
        return;
      }

      // Verificar contraseña (en producción debería usar bcrypt)
      // Por ahora comparación directa para mantener compatibilidad
      if (agent.password_hash !== password) {
        setError('Credenciales inválidas');
        setIsLoading(false);
        return;
      }

      // Autenticación exitosa
      login({
        id: agent.id,
        username: agent.username,
        role: agent.role as 'Administrador' | 'Agente externo' | 'Editor',
        firstName: agent.first_name,
        lastName: agent.last_name,
      });

      // Redirigir al dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error al iniciar sesión');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1a1a1a] rounded-2xl mb-4">
            <i className="ri-building-4-line text-3xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">KÚA EASY LIVING</h1>
          <p className="text-sm text-slate-600">Panel de Administración</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Iniciar Sesión</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-user-line text-slate-400"></i>
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="Ingresa tu usuario"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-lock-line text-slate-400"></i>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="Ingresa tu contraseña"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <i className="ri-error-warning-line text-red-600"></i>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1a1a1a] text-white py-3 rounded-lg font-medium hover:bg-[#2a2a2a] transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <i className="ri-login-box-line"></i>
                  <span>Ingresar</span>
                </>
              )}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200 flex items-center justify-center gap-1 mx-auto cursor-pointer whitespace-nowrap"
            >
              <i className="ri-arrow-left-line"></i>
              <span>Volver al sitio</span>
            </button>
          </div>
        </div>

        {/* Security Note */}
        <p className="text-center text-xs text-slate-500 mt-6">
          <i className="ri-shield-check-line mr-1"></i>
          Acceso restringido solo para personal autorizado
        </p>
      </div>
    </div>
  );
}