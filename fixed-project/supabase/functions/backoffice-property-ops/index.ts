import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const VALID_STATUSES = ['Publicado', 'Destacado', 'Borrador', 'Vendido', 'Arrendado'];

function respond(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    // Admin client bypasses all RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    // ── GET SINGLE PROPERTY (backoffice edit) ────────────────────────────────
    if (action === 'get-property') {
      const { propertyId } = body;
      if (!propertyId) throw new Error('propertyId es requerido');

      const { data, error } = await supabaseAdmin
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .maybeSingle();

      if (error) return respond({ error: error.message, code: error.code }, 400);
      if (!data) return respond({ error: 'Propiedad no encontrada', notFound: true }, 404);

      return respond({ success: true, property: data });
    }

    // ── GET ALL PROPERTIES (backoffice list) ─────────────────────────────────
    if (action === 'get-all-properties') {
      const { status, search } = body;

      let query = supabaseAdmin
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (status && status !== 'Todos') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) return respond({ error: error.message, code: error.code }, 400);

      const result = data ?? [];

      const filtered = search
        ? result.filter((p: Record<string, unknown>) => {
            const term = (search as string).toLowerCase().replace(/^ref-/i, '');
            const refCode = `ref-${(p.id as string).slice(0, 8).toUpperCase()}`;
            return (
              (p.title as string).toLowerCase().includes((search as string).toLowerCase()) ||
              ((p.city as string) || '').toLowerCase().includes((search as string).toLowerCase()) ||
              ((p.neighborhood as string) || '').toLowerCase().includes((search as string).toLowerCase()) ||
              refCode.includes((search as string).toLowerCase()) ||
              (p.id as string).slice(0, 8).toUpperCase().includes(term.toUpperCase())
            );
          })
        : result;

      const allStats = {
        total: result.length,
        publicadas: result.filter((p: Record<string, unknown>) => p.status === 'Publicado').length,
        destacadas: result.filter((p: Record<string, unknown>) => p.status === 'Destacado').length,
        vendidas:   result.filter((p: Record<string, unknown>) => p.status === 'Vendido').length,
        arrendadas: result.filter((p: Record<string, unknown>) => p.status === 'Arrendado').length,
        borradores: result.filter((p: Record<string, unknown>) => p.status === 'Borrador').length,
      };

      return respond({ success: true, properties: filtered, stats: allStats });
    }

    // ── UPDATE STATUS ────────────────────────────────────────────────────────
    if (action === 'update-status') {
      const { propertyId, status } = body;
      if (!propertyId || !status) throw new Error('propertyId y status son requeridos');
      if (!VALID_STATUSES.includes(status)) throw new Error(`Estado inválido: "${status}". Valores permitidos: ${VALID_STATUSES.join(', ')}`);

      const { error } = await supabaseAdmin
        .from('properties')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', propertyId);

      if (error) return respond({ error: error.message, code: error.code }, 400);
      return respond({ success: true });
    }

    // ── UPDATE PROPERTY ──────────────────────────────────────────────────────
    if (action === 'update-property') {
      const { propertyId, data } = body;
      if (!propertyId || !data) throw new Error('propertyId y data son requeridos');

      const { error } = await supabaseAdmin
        .from('properties')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', propertyId);

      if (error) return respond({ error: error.message, code: error.code }, 400);
      return respond({ success: true });
    }

    // ── INSERT PROPERTY ──────────────────────────────────────────────────────
    if (action === 'insert-property') {
      const { data } = body;
      if (!data) throw new Error('data es requerido');

      const { data: inserted, error } = await supabaseAdmin
        .from('properties')
        .insert([{ ...data, created_at: new Date().toISOString() }])
        .select('id')
        .single();

      if (error) return respond({ error: error.message, code: error.code }, 400);
      return respond({ success: true, id: inserted?.id });
    }

    // ── DELETE PROPERTY ──────────────────────────────────────────────────────
    if (action === 'delete-property') {
      const { propertyId } = body;
      if (!propertyId) throw new Error('propertyId es requerido');

      const { error } = await supabaseAdmin
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) return respond({ error: error.message, code: error.code }, 400);
      return respond({ success: true });
    }

    // ── CHECK SLUG CONFLICT ──────────────────────────────────────────────────
    if (action === 'check-slug') {
      const { slug, excludeId } = body;
      if (!slug) throw new Error('slug es requerido');

      let query = supabaseAdmin
        .from('properties')
        .select('id, slug')
        .eq('slug', slug);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query.maybeSingle();
      if (error) return respond({ error: error.message, code: error.code }, 400);

      return respond({ success: true, conflict: !!data });
    }

    throw new Error(`Acción desconocida: ${action}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return respond({ error: message }, 400);
  }
});
