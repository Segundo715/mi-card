import { getSettings } from '@/lib/settingsDb'
import { DEFAULT_BRAND_NAME } from '@/lib/brandDefaults'
import { Card2x1Client, type PromoConfig } from './CardClient'

export const dynamic = 'force-dynamic'

const CATEGORIES_KEY = 'reward_categories'
const CATEGORY_ID = 'dosxuno'

// Config por defecto de la "Tarjeta 2x1" (se sobreescribe desde /admin/tarjetas)
const DEFAULT_2X1: PromoConfig = {
  name: 'Tarjeta 2x1', reward: 'Segundo producto gratis', icon: 'gift', color: '#60a5fa',
  iconColor: '#ffffff', logo: '', logoColor: '', image: '/uploads/menu/SalmonBowl.jpeg',
  brandText: DEFAULT_BRAND_NAME, brandLogo: '',
}

// Server Component: resuelve la marca ANTES de mandar el HTML (ver app/card/page.tsx para el
// razonamiento completo) — el logo va en el HTML inicial en vez de esperar un fetch client-side.
export default async function Card2x1Page() {
  const keys = [CATEGORIES_KEY, 'restaurant_name', 'menu_logo', 'profile_logo', 'menu_logo_color']
  const v = await getSettings(keys)

  const brandName = v.restaurant_name || DEFAULT_2X1.brandText
  const brandLogoUrl = v.menu_logo || v.profile_logo || DEFAULT_2X1.logo
  const brandLogoColor = v.menu_logo_color || ''

  let promo: (PromoConfig & { id: string }) | null = null
  if (v[CATEGORIES_KEY]) {
    try {
      const list = JSON.parse(v[CATEGORIES_KEY])
      promo = Array.isArray(list) ? list.find((c: PromoConfig & { id: string }) => c.id === CATEGORY_ID) : null
    } catch {}
  }

  const cfg: PromoConfig = {
    name: promo?.name ?? DEFAULT_2X1.name,
    reward: promo?.reward ?? DEFAULT_2X1.reward,
    icon: promo?.icon ?? DEFAULT_2X1.icon,
    color: promo?.color ?? DEFAULT_2X1.color,
    iconColor: promo?.iconColor || DEFAULT_2X1.iconColor,
    logo: brandLogoUrl,
    logoColor: brandLogoColor,
    image: promo?.image || DEFAULT_2X1.image,
    brandText: promo?.brandText || brandName,
    brandLogo: promo?.brandLogo || DEFAULT_2X1.brandLogo,
  }

  return <Card2x1Client initialCfg={cfg} />
}
