
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Property } from '../lib/supabase';

export type PropertyStatus = 'Todos' | 'Publicado' | 'Destacado' | 'Borrador' | 'Vendido' | 'Arrendado';

interface UsePropertiesOptions {
  publicOnly?: boolean;
  status?: PropertyStatus;
  search?: string;
}

interface PropertyStats {
  total: number;
  publicadas: number;
  destacadas: number;
  vendidas: number;
}

export function useProperties(options: UsePropertiesOptions = {}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PropertyStats>({ total: 0, publicadas: 0, destacadas: 0, vendidas: 0 });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (options.publicOnly) {
        query = query.in('status', ['Publicado', 'Destacado']);
      } else if (options.status && options.status !== 'Todos') {
        query = query.eq('status', options.status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const result = data as Property[] || [];

      // Filtro de búsqueda en cliente
      const filtered = options.search
        ? result.filter((p) => {
            const term = options.search!.toLowerCase().replace(/^ref-/i, '');
            const refCode = `REF-${p.id.slice(0, 8).toUpperCase()}`;
            return (
              p.title.toLowerCase().includes(options.search!.toLowerCase()) ||
              (p.city || '').toLowerCase().includes(options.search!.toLowerCase()) ||
              (p.neighborhood || '').toLowerCase().includes(options.search!.toLowerCase()) ||
              refCode.toLowerCase().includes(options.search!.toLowerCase()) ||
              p.id.slice(0, 8).toUpperCase().includes(term.toUpperCase())
            );
          })
        : result;

      setProperties(filtered);

      // Calcular stats desde todos los datos (sin filtro de búsqueda)
      setStats({
        total: result.length,
        publicadas: result.filter((p) => p.status === 'Publicado').length,
        destacadas: result.filter((p) => p.status === 'Destacado').length,
        vendidas: result.filter((p) => p.status === 'Vendido').length,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar propiedades');
    } finally {
      setLoading(false);
    }
  }, [options.publicOnly, options.status, options.search]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Suscripción en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel('properties-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        fetchProperties();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProperties]);

  return { properties, loading, error, stats, refetch: fetchProperties };
}

export async function deleteProperty(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('properties').delete().eq('id', id);
  return { error: error ? error.message : null };
}

export async function updatePropertyStatus(
  id: string,
  status: Property['status']
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('properties')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error: error ? error.message : null };
}

export function formatPriceSupabase(price: number, currency: string): string {
  if (currency === 'COP') {
    return `$${price.toLocaleString('es-CO')}`;
  }
  return `$${price.toLocaleString('es-CO')}`;
}
