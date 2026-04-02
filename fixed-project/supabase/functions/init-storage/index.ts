/**
 * Edge Function: init-storage
 *
 * Verifica y crea los buckets necesarios si no existen:
 *   - property-images  (bucket existente, imágenes de propiedades)
 *   - agents-media     (nuevo, fotos de agentes)
 *
 * Uso: POST /functions/v1/init-storage
 * No requiere JWT (verify_jwt: false)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png',
  'image/webp', 'image/avif', 'image/heic', 'image/heif', 'image/gif',
];

const BUCKETS = [
  {
    id: 'property-images',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: ALLOWED_MIME_TYPES,
    description: 'Imágenes de propiedades inmobiliarias',
  },
  {
    id: 'agents-media',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ALLOWED_MIME_TYPES,
    description: 'Fotos de perfil de agentes — agents-media/{agent_id}/profile.jpg',
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Variables de entorno no configuradas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: existingBuckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (listError) {
      return new Response(
        JSON.stringify({ success: false, error: `Error listando buckets: ${listError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const existingIds = new Set(existingBuckets?.map((b) => b.id) ?? []);
    const results: Record<string, string> = {};

    for (const bucket of BUCKETS) {
      if (existingIds.has(bucket.id)) {
        results[bucket.id] = 'already_exists';
        continue;
      }

      const { error: createError } = await supabaseAdmin.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes,
      });

      if (createError) {
        results[bucket.id] = `error: ${createError.message}`;
      } else {
        results[bucket.id] = 'created';
      }
    }

    return new Response(
      JSON.stringify({ success: true, buckets: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: `Error inesperado: ${String(err)}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
