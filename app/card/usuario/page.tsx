import { getSettings } from '@/lib/settingsDb'
import { DEFAULT_BRAND_NAME, DEFAULT_BRAND_COLOR } from '@/lib/brandDefaults'
import { UsuarioClient, type Brand } from './CardClient'

export const dynamic = 'force-dynamic'

const CATEGORIES_KEY = 'reward_categories'

// Branding por defecto (se sobreescribe con la categoría "Tarjeta de Café" de /admin/tarjetas)
const DEFAULT_BRAND: Brand = {
  color: DEFAULT_BRAND_COLOR, logo: '', logoColor: '', brandText: DEFAULT_BRAND_NAME, brandLogo: '',
}

// Server Component: resuelve la marca ANTES de mandar el HTML (ver app/card/page.tsx para el
// razonamiento completo) — el logo va en el HTML inicial en vez de esperar un fetch client-side.
export default async function UsuarioPage() {
  const keys = [CATEGORIES_KEY, 'restaurant_name', 'menu_logo', 'profile_logo', 'menu_logo_color', 'menu_hover_color', 'sidebar_accent']
  const v = await getSettings(keys)

  const brandName = v.restaurant_name || DEFAULT_BRAND.brandText
  const brandLogoUrl = v.menu_logo || v.profile_logo || DEFAULT_BRAND.logo
  const brandLogoColor = v.menu_logo_color || ''
  const brandAccent = v.menu_hover_color || v.sidebar_accent || DEFAULT_BRAND.color

  let cafe: { id: string; color?: string; logo?: string; brandText?: string; brandLogo?: string } | null = null
  if (v[CATEGORIES_KEY]) {
    try {
      const list = JSON.parse(v[CATEGORIES_KEY])
      cafe = Array.isArray(list) ? (list.find((c: { id: string }) => c.id === 'cafe') ?? list[0]) : null
    } catch {}
  }

  const brand: Brand = {
    color: cafe?.color || brandAccent,
    logo: brandLogoUrl,
    logoColor: brandLogoColor,
    brandText: cafe?.brandText || brandName,
    brandLogo: cafe?.brandLogo || DEFAULT_BRAND.brandLogo,
  }

  return <UsuarioClient initialBrand={brand} />
}
