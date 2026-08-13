import { getFeatureFlags } from '@/lib/features'

// Sin caché: el admin de mi-card necesita ver el estado más reciente en cada carga.
const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate' }

// GET es de uso interno (el propio admin de mi-card consulta sus flags) — el
// SuperAdmin no llama a este endpoint, escribe directo en Supabase.
export async function GET() {
  const flags = await getFeatureFlags()
  return Response.json(flags, { headers: NO_CACHE })
}
