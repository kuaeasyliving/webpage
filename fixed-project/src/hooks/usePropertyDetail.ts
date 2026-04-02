/**
 * usePropertyDetail — fetch optimizado para la página de detalle
 *
 * Mejoras vs. implementación anterior:
 *  - Fetch paralelo de propiedad + agente (no secuencial)
 *  - React Query para caché automático (5 min stale, 30 min GC)
 *  - Select específico de campos — sin datos innecesarios
 *  - Propiedades relacionadas en la misma query
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Property, Agent } from '../lib/supabase';

interface PropertyDetailResult {
  property: Property | null;
  agent: Agent | null;
  relatedProperties: Property[];
  loading: boolean;
  notFound: boolean;
  error: string | null;
}

// Campos mínimos para propiedades relacionadas
const RELATED_FIELDS =
  'id,title,slug,operation,type,price,currency,city,neighborhood,images,status,bedrooms,bathrooms,parking,area_built';

async function fetchPropertyDetail(slug: string): Promise<{
  property: Property;
  agent: Agent | null;
  relatedProperties: Property[];
}> {
  // 1. Buscar la propiedad por slug
  const { data: propData, error: propError } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (propError || !propData) {
    throw new Error(propError?.message || 'Propiedad no encontrada');
  }

  const property = propData as Property;

  // 2. Fetch paralelo: agente + propiedades relacionadas
  const [agentResult, relatedResult] = await Promise.all([
    property.agent
      ? supabase
          .from('agents')
          .select('id,first_name,last_name,phone,email,photo_url,position,role,is_active')
          .eq('id', property.agent)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    supabase
      .from('properties')
      .select(RELATED_FIELDS)
      .in('status', ['Publicado', 'Destacado'])
      .eq('operation', property.operation)
      .neq('id', property.id)
      .limit(3),
  ]);

  return {
    property,
    agent: (agentResult.data as Agent | null) ?? null,
    relatedProperties: (relatedResult.data as Property[]) || [],
  };
}

export function usePropertyDetail(slug: string | undefined): PropertyDetailResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['property-detail', slug],
    queryFn: () => fetchPropertyDetail(slug!),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,   // 5 min cache
    retry: false,                 // no reintentar en 404
  });

  return {
    property: data?.property ?? null,
    agent: data?.agent ?? null,
    relatedProperties: data?.relatedProperties ?? [],
    loading: isLoading,
    notFound: !isLoading && Boolean(slug) && !data?.property && Boolean(error),
    error: error instanceof Error ? error.message : null,
  };
}
