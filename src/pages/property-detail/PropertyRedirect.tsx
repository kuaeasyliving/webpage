import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * Componente de redirección para mantener compatibilidad con URLs antiguas
 * Redirige de /inmuebles/:id a /:operacion/:slug
 */
const PropertyRedirect = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const redirectToNewUrl = async () => {
      if (!id) return;

      try {
        // Consultar la propiedad por ID para obtener su slug y operación
        const { data, error } = await supabase
          .from('properties')
          .select('slug, operacion')
          .eq('id', id)
          .maybeSingle();

        if (error || !data) {
          console.error('Error al buscar propiedad para redirección:', error);
          // Redirigir a 404 si no se encuentra
          window.location.href = '/404';
          return;
        }

        // Normalizar la operación para la URL
        let operacionUrl = '';
        if (data.operacion === 'arriendo-tradicional') {
          operacionUrl = 'arriendo';
        } else if (data.operacion === 'arriendo-renta-corta') {
          operacionUrl = 'renta-corta';
        } else if (data.operacion === 'venta') {
          operacionUrl = 'venta';
        }

        // Redirigir a la nueva URL con slug
        const newUrl = `/${operacionUrl}/${data.slug}`;
        window.location.href = newUrl;
      } catch (err) {
        console.error('Error en redirección:', err);
        window.location.href = '/404';
      }
    };

    redirectToNewUrl();
  }, [id]);

  // Mostrar un mensaje de carga mientras se realiza la redirección
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
};

export default PropertyRedirect;