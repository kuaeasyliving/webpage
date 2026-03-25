import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Property } from '../lib/supabase';
import { callBackofficeOps } from '../utils/backofficeOps';

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
  arrendadas: number;
  borradores: number;
}

export function useProperties(options: UsePropertiesOptions = {}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PropertyStats>({
    total: 0, publicadas: 0, destacadas: 0, vendidas: 0, arrendadas: 0, borradores: 0,
  });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ── PUBLIC WEBSITE: use anon key, show only Publicado/Destacado ──────
      if (options.publicOnly) {
        let query = supabase
          .from('properties')
          .select('*')
          .in('status', ['Publicado', 'Destacado'])
          .order('created_at', { ascending: false });

        const { data, error: fetchError } = await query;
        if (fetchError) throw fetchError;

        const result = data as Property[] || [];
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
        setStats({
          total: result.length,
          publicadas: result.filter((p) => p.status === 'Publicado').length,
          destacadas: result.filter((p) => p.status === 'Destacado').length,
          vendidas: 0,
          arrendadas: 0,
          borradores: 0,
        });
        return;
      }

      // ── BACKOFFICE: use edge function with service_role → bypasses RLS ───
      const { data: responseData, error: edgeError } = await callBackofficeOps({
        action: 'get-all-properties',
        status: options.status || 'Todos',
        search: options.search || '',
      });

      if (edgeError) throw new Error(edgeError);

      const { properties: fetchedProperties, stats: fetchedStats } = responseData as {
        properties: Property[];
        stats: PropertyStats;
      };

      setProperties(fetchedProperties || []);
      setStats(fetchedStats || { total: 0, publicadas: 0, destacadas: 0, vendidas: 0, arrendadas: 0, borradores: 0 });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar propiedades');
    } finally {
      setLoading(false);
    }
  }, [options.publicOnly, options.status, options.search]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Real-time subscription (only for backoffice where all events matter)
  useEffect(() => {
    if (options.publicOnly) return;
    const channel = supabase
      .channel('properties-realtime-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        fetchProperties();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProperties, options.publicOnly]);

  return { properties, loading, error, stats, refetch: fetchProperties };
}

export async function deleteProperty(id: string): Promise<{ error: string | null }> {
  const { error } = await callBackofficeOps({ action: 'delete-property', propertyId: id });
  return { error };
}

export async function updatePropertyStatus(
  id: string,
  status: Property['status']
): Promise<{ error: string | null }> {
  const { error } = await callBackofficeOps({ action: 'update-status', propertyId: id, status });
  return { error };
}

export function formatPriceSupabase(price: number, currency: string): string {
  if (currency === 'COP') {
    return `$${price.toLocaleString('es-CO')}`;
  }
  return `$${price.toLocaleString('es-CO')}`;
}
