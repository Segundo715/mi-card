import { getSettings } from '@/lib/settingsDb'
import { DEFAULT_BRAND_NAME } from '@/lib/brandDefaults'
import { CardPremiumClient, type PremiumConfig } from './CardClient'

export const dynamic = 'force-dynamic'

const CATEGORIES_KEY = 'reward_categories'
const CATEGORY_ID = 'premium'

// Config por defecto de la "Tarjeta Premium/Upgrade" (se sobreescribe desde /admin/tarjetas)
const DEFAULT_PREMIUM: PremiumConfig = {
  name: 'Upgrade Premium', reward: 'Beneficios premium', icon: 'crown', color: '#fbbf24',
  iconColor: '#000000', logo: '', logoColor: '', image: '/uploads/menu/SalmonBowl.jpeg',
  brandText: DEFAULT_BRAND_NAME, brandLogo: '', perks: ['Tamaño grande gratis', 'Bebida gratis'],
}

// Server Component: resuelve la marca ANTES de mandar el HTML (ver app/card/page.tsx para el
// razonamiento completo) — el logo va en el HTML inicial en vez de esperar un fetch client-side.
export default async function CardPremiumPage() {
  const keys = [CATEGORIES_KEY, 'restaurant_name', 'menu_logo', 'profile_logo', 'menu_logo_color']
  const v = await getSettings(keys)

  const brandName = v.restaurant_name || DEFAULT_PREMIUM.brandText
  const brandLogoUrl = v.menu_logo || v.profile_logo || DEFAULT_PREMIUM.logo
  const brandLogoColor = v.menu_logo_color || ''

  let promo: (PremiumConfig & { id: string }) | null = null
  if (v[CATEGORIES_KEY]) {
    try {
      const list = JSON.parse(v[CATEGORIES_KEY])
      promo = Array.isArray(list) ? list.find((c: PremiumConfig & { id: string }) => c.id === CATEGORY_ID) : null
    } catch {}
  }

  const cfg: PremiumConfig = {
    name: promo?.name ?? DEFAULT_PREMIUM.name,
    reward: promo?.reward ?? DEFAULT_PREMIUM.reward,
    icon: promo?.icon ?? DEFAULT_PREMIUM.icon,
    color: promo?.color ?? DEFAULT_PREMIUM.color,
    iconColor: promo?.iconColor || DEFAULT_PREMIUM.iconColor,
    logo: brandLogoUrl,
    logoColor: brandLogoColor,
    image: promo?.image || DEFAULT_PREMIUM.image,
    brandText: promo?.brandText || brandName,
    brandLogo: promo?.brandLogo || DEFAULT_PREMIUM.brandLogo,
    perks: promo && Array.isArray(promo.perks) ? promo.perks : DEFAULT_PREMIUM.perks,
  }

  return <CardPremiumClient initialCfg={cfg} />
}
