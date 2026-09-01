import { getSettings } from '@/lib/settingsDb'
import { DEFAULT_BRAND_NAME, DEFAULT_BRAND_COLOR } from '@/lib/brandDefaults'
import { WalletClient, type RewardCategory } from './CardClient'

export const dynamic = 'force-dynamic'

const CATEGORIES_KEY = 'reward_categories'

const DEFAULT_CATEGORIES: RewardCategory[] = [
  { id: 'cafe', name: 'Tarjeta de Cafe', reward: 'Cafe gratis', goal: 5, icon: 'coffee', color: DEFAULT_BRAND_COLOR, iconColor: '#ffffff', logo: '', brandText: DEFAULT_BRAND_NAME },
  { id: 'dosxuno', name: 'Tarjeta 2x1', reward: 'Segundo producto gratis', goal: 4, icon: 'gift', color: '#60a5fa', iconColor: '#ffffff', logo: '', brandText: DEFAULT_BRAND_NAME },
  { id: 'descuento', name: 'Descuento Directo', reward: '20% de descuento', goal: 3, icon: 'percent', color: '#fb923c', iconColor: '#ffffff', logo: '', brandText: DEFAULT_BRAND_NAME },
  { id: 'premium', name: 'Upgrade Premium', reward: 'Beneficios premium', goal: 1, icon: 'crown', color: '#fbbf24', iconColor: '#000000', logo: '', brandText: DEFAULT_BRAND_NAME, perks: ['Tamano grande gratis', 'Bebida gratis'] },
]

// Server Component: resuelve las categorías (con marca) ANTES de mandar el HTML (ver
// app/card/page.tsx para el razonamiento completo) — los logos van en el HTML inicial en vez de
// esperar un fetch client-side.
export default async function WalletPage() {
  const keys = [CATEGORIES_KEY, 'restaurant_name', 'menu_logo', 'profile_logo', 'menu_logo_color']
  const v = await getSettings(keys)

  const brandName = v.restaurant_name || DEFAULT_BRAND_NAME
  const brandLogoUrl = v.menu_logo || v.profile_logo || ''
  const brandLogoColor = v.menu_logo_color || ''

  let categories = DEFAULT_CATEGORIES.map(c => ({ ...c, logo: brandLogoUrl, logoColor: brandLogoColor, brandText: c.brandText || brandName }))
  if (v[CATEGORIES_KEY]) {
    try {
      const parsed = JSON.parse(v[CATEGORIES_KEY])
      if (Array.isArray(parsed) && parsed.length) {
        categories = parsed.map((category: RewardCategory) => ({
          ...category,
          logo: brandLogoUrl,
          logoColor: brandLogoColor,
          brandText: category.brandText || brandName,
        }))
      }
    } catch {}
  }

  return <WalletClient initialCategories={categories} />
}
