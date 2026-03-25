const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/backoffice-property-ops`;

export type BackofficeResponse = Record<string, unknown> & {
  success?: boolean;
  error?: string;
  code?: string;
  id?: string;
};

export async function callBackofficeOps(
  body: Record<string, unknown>
): Promise<{ error: string | null; code?: string; data?: BackofficeResponse }> {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    });

    const result: BackofficeResponse = await response.json();

    if (!response.ok || result.error) {
      return { error: result.error ?? 'Error en la operación', code: result.code };
    }

    return { error: null, data: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error de red al conectar con el servidor';
    return { error: message };
  }
}
