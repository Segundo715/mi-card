import { getSettings } from '@/lib/settingsDb'
import { DEFAULT_BRAND_NAME } from '@/lib/brandDefaults'
import { CardDescuentoClient, type PromoConfig } from './CardClient'

export const dynamic = 'force-dynamic'

const CATEGORIES_KEY = 'reward_categories'
const CATEGORY_ID = 'descuento'

// Config por defecto de la "Tarjeta Descuento" (se sobreescribe desde /admin/tarjetas)
const DEFAULT_DESC: PromoConfig = {
  name: 'Descuento Directo', reward: '20% de descuento', icon: 'percent', color: '#fb923c',
  iconColor: '#ffffff', logo: '', logoColor: '', image: '/uploads/menu/SalmonBowl.jpeg',
  brandText: DEFAULT_BRAND_NAME, brandLogo: '',
}

// Server Component: resuelve la marca ANTES de mandar el HTML (ver app/card/page.tsx para el
// razonamiento completo) — el logo va en el HTML inicial en vez de esperar un fetch client-side.
export default async function CardDescuentoPage() {
  const keys = [CATEGORIES_KEY, 'restaurant_name', 'menu_logo', 'profile_logo', 'menu_logo_color']
  const v = await getSettings(keys)

  const brandName = v.restaurant_name || DEFAULT_DESC.brandText
  const brandLogoUrl = v.menu_logo || v.profile_logo || DEFAULT_DESC.logo
  const brandLogoColor = v.menu_logo_color || ''

  let promo: (PromoConfig & { id: string }) | null = null
  if (v[CATEGORIES_KEY]) {
    try {
      const list = JSON.parse(v[CATEGORIES_KEY])
      promo = Array.isArray(list) ? list.find((c: PromoConfig & { id: string }) => c.id === CATEGORY_ID) : null
    } catch {}
  }

  const cfg: PromoConfig = {
    name: promo?.name ?? DEFAULT_DESC.name,
    reward: promo?.reward ?? DEFAULT_DESC.reward,
    icon: promo?.icon ?? DEFAULT_DESC.icon,
    color: promo?.color ?? DEFAULT_DESC.color,
    iconColor: promo?.iconColor || DEFAULT_DESC.iconColor,
    logo: brandLogoUrl,
    logoColor: brandLogoColor,
    image: promo?.image || DEFAULT_DESC.image,
    brandText: promo?.brandText || brandName,
    brandLogo: promo?.brandLogo || DEFAULT_DESC.brandLogo,
  }

  return <CardDescuentoClient initialCfg={cfg} />
}
