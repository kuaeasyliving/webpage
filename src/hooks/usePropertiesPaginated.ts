/**
 * usePropertiesPaginated — paginación tipo "cargar más"
 *
 * Usa useInfiniteQuery de React Query para:
 *  - Cargar 9 propiedades inicialmente
 *  - Cargar 9 más cada vez que el usuario pulsa "Cargar más"
 *  - Acumular resultados sin reemplazar los anteriores
 *  - Cache automático por página — sin re-fetches innecesarios
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase, PROPERTY_LIST_FIELDS } from '../lib/supabase';
import type { Property } from '../lib/supabase';
import type { OperationFilter } from './usePropertiesQuery';

export const PAGE_SIZE = 9;

interface PaginatedOptions {
  publicOnly?: boolean;
  search?: string;
  operation?: OperationFilter;
}

interface PageResult {
  items: Property[];
  nextOffset: number | null;
  total: number;
}

async function fetchPage(
  offset: number,
  options: PaginatedOptions
): Promise<PageResult> {
  let query = supabase
    .from('properties')
    .select(PROPERTY_LIST_FIELDS, { count: 'exact' })
    .order('status', { ascending: false })   // Destacado > Publicado
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (options.publicOnly) {
    query = query.in('status', ['Publicado', 'Destacado']);
  }

  // ✅ Aplicar filtro de operación en la base de datos
  if (options.operation && options.operation !== 'all') {
    query = query.eq('operation', options.operation);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const items = (data as Property[]) || [];
  const total = count ?? 0;
  const nextOffset = offset + items.length < total ? offset + PAGE_SIZE : null;

  return { items, nextOffset, total };
}

export interface PropertiesPaginatedResult {
  properties: Property[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  loadMore: () => void;
}

export function usePropertiesPaginated(options: PaginatedOptions = {}): PropertiesPaginatedResult {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    error,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['properties-paginated', options.publicOnly, options.operation],
    queryFn: ({ pageParam = 0 }) => fetchPage(pageParam as number, options),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    staleTime: 1000 * 60 * 5,
  });

  // Aplanar todas las páginas cargadas
  const allProperties = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  // Filtro de búsqueda en cliente (solo cuando hay texto)
  const properties = options.search
    ? allProperties.filter((p) => {
        const term = options.search!.toLowerCase();
        return (
          p.title.toLowerCase().includes(term) ||
          (p.city || '').toLowerCase().includes(term) ||
          (p.neighborhood || '').toLowerCase().includes(term) ||
          `ref-${p.id.slice(0, 8).toLowerCase()}`.includes(term)
        );
      })
    : allProperties;

  return {
    properties,
    loading: isLoading,
    loadingMore: isFetchingNextPage,
    error: error instanceof Error ? error.message : null,
    total,
    hasMore: Boolean(hasNextPage) && !options.search,
    loadMore: fetchNextPage,
  };
}
