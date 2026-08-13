import { createClient } from '@supabase/supabase-js'

// strip BOM (U+FEFF=65279) que PowerShell agrega al guardar env vars en Vercel
const strip = (v: string) => v.replace(new RegExp('^' + String.fromCharCode(65279)), '').trim()
const url = strip(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
// Este cliente solo se usa server-side (lib/*.ts y route handlers), nunca en componentes de cliente,
// así que usa la secret key (bypassa RLS) en vez de la publishable key.
const key = strip(process.env.SUPABASE_SECRET_KEY ?? '')

export const supabase = createClient(url, key)
