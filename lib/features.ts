import { supabase } from './supabase'

// Catálogo de módulos de mi-card. El SuperAdmin activa/desactiva estos
// módulos desde mi-superadmindrestaurante (pestaña "mi-card").
export const FEATURES = {
  sellar:        { label: 'Sellar',        emoji: '☕' },
  tarjetas:      { label: 'Tarjetas',      emoji: '💳' },
  usuarios:      { label: 'Usuarios',      emoji: '👤' },
  configuracion: { label: 'Configuración', emoji: '⚙️' },
} as const

export type FeatureKey = keyof typeof FEATURES

export type FeatureFlags = Record<FeatureKey, boolean>

const SETTINGS_KEY = 'feature_flags_micard'

export async function getFeatureFlags(): Promise<FeatureFlags> {
  const { data } = await supabase.from('settings').select('value').eq('key', SETTINGS_KEY).maybeSingle()
  const overrides: Partial<FeatureFlags> = data?.value ? JSON.parse(data.value) : {}

  // Si un módulo no está en Supabase, se asume habilitado por defecto.
  return Object.fromEntries(
    Object.keys(FEATURES).map(k => [k, overrides[k as FeatureKey] ?? true])
  ) as FeatureFlags
}
