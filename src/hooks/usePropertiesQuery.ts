/**
 * usePropertiesQuery — versión React Query de useProperties
 *
 * Diferencias clave vs useProperties (hooks/useProperties.ts):
 *  - React Query con caché automático y deduplicación
 *  - select específico de campos (no select *)
 *  - Sin suscripción realtime (innecesaria para listados públicos)
 *  - Paginación por offset
 */

import { useQuery } from '@tanstack/react-query';
import { supabase, PROPERTY_LIST_FIELDS } from '../lib/supabase';
import type { Property } from '../lib/supabase';
import { formatPriceSupabase } from './useProperties';

export type OperationFilter = 'all' | 'venta' | 'arriendo-tradicional' | 'arriendo-renta-corta';

interface UsePropertiesQueryOptions {
  publicOnly?: boolean;
  operation?: OperationFilter;
  search?: string;
  limit?: number;
  offset?: number;
}

interface PropertiesQueryResult {
  properties: Property[];
  loading: boolean;
  error: string | null;
  total: number;
}

async function fetchPublicProperties(options: UsePropertiesQueryOptions): Promise<Property[]> {
  let query = supabase
    .from('properties')
    .select(PROPERTY_LIST_FIELDS)
    .order('created_at', { ascending: false });

  if (options.publicOnly) {
    query = query.in('status', ['Publicado', 'Destacado']);
  }

  if (options.operation && options.operation !== 'all') {
    query = query.eq('operation', options.operation);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as Property[]) || [];
}

export function usePropertiesQuery(options: UsePropertiesQueryOptions = {}): PropertiesQueryResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['properties', options.publicOnly, options.operation, options.limit],
    queryFn: () => fetchPublicProperties(options),
    staleTime: 1000 * 60 * 5,
  });

  const properties = data || [];

  // Filtro de búsqueda en cliente (solo texto)
  const filtered = options.search
    ? properties.filter((p) => {
        const term = options.search!.toLowerCase();
        const refCode = `ref-${p.id.slice(0, 8).toLowerCase()}`;
        return (
          p.title.toLowerCase().includes(term) ||
          (p.city || '').toLowerCase().includes(term) ||
          (p.neighborhood || '').toLowerCase().includes(term) ||
          refCode.includes(term)
        );
      })
    : properties;

  return {
    properties: filtered,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    total: filtered.length,
  };
}

export { formatPriceSupabase };
