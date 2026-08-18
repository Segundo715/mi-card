import { supabase } from './supabase'

const RID = process.env.NEXT_PUBLIC_RESTAURANT_ID || 'default'

function scopedKey(key: string): string {
  return RID === 'default' ? key : `${RID}:${key}`
}

export async function getSetting(key: string, fallback = ''): Promise<string> {
  const { data } = await supabase.from('settings').select('value').eq('key', scopedKey(key)).maybeSingle()
  return data?.value ?? fallback
}

// Trae varias claves en una sola consulta — las páginas cliente que hacían N
// fetches en paralelo (uno por clave) tardaban N round-trips reales; esto lo
// reduce a uno solo, que es lo que hacía sentir lenta la carga inicial de /card.
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const scoped = keys.map(scopedKey)
  const { data } = await supabase.from('settings').select('key,value').in('key', scoped)
  const byScopedKey = new Map((data ?? []).map(r => [r.key as string, r.value as string]))
  const result: Record<string, string> = {}
  keys.forEach((key, i) => { result[key] = byScopedKey.get(scoped[i]) ?? '' })
  return result
}

export async function setSetting(key: string, value: string): Promise<void> {
  await supabase.from('settings').upsert({ key: scopedKey(key), value }, { onConflict: 'key' })
}
