import { getSettings } from '@/lib/settingsDb'
import { DEFAULT_BRAND_NAME, DEFAULT_BRAND_COLOR } from '@/lib/brandDefaults'
import { CardClient, type CafeConfig } from './CardClient'

// Sin esto, Next.js prerenderiza esta página UNA vez en el build (no tiene cookies/headers/
// searchParams que la marquen como dinámica automáticamente) y el logo/colores quedarían
// congelados con lo que hubiera en settings al momento del deploy — un admin cambiando su
// marca en /admin/configuracion no se reflejaría hasta el siguiente redeploy.
export const dynamic = 'force-dynamic'

const CATEGORIES_KEY = 'reward_categories'

const DEFAULT_CAFE: CafeConfig = {
  name: 'Tarjeta de Café', reward: 'Café gratis', goal: 5, icon: 'coffee', color: DEFAULT_BRAND_COLOR,
  iconColor: '#ffffff', logo: '', logoColor: '', image: '/uploads/menu/SalmonBowl.jpeg',
  brandText: DEFAULT_BRAND_NAME, brandLogo: '',
}

// Server Component: resuelve la identidad de marca (logo, nombre, colores) ANTES de mandar el
// HTML al navegador, en vez de que el cliente la pida con un fetch después del primer paint
// (como hacía antes — ver CardClient.tsx). Así el <img> del logo va en el HTML inicial y el
// navegador lo empieza a descargar de inmediato, sin esperar a que React hidrate y dispare el
// useEffect. Lo único que sigue resolviéndose en el cliente es si el visitante ya tiene una
// tarjeta registrada (vive en localStorage, no accesible desde el servidor).
export default async function CardPage() {
  const keys = [CATEGORIES_KEY, 'restaurant_name', 'menu_logo', 'profile_logo', 'menu_logo_color', 'menu_hover_color', 'sidebar_accent', 'menu_bg_color', 'menu_btn_color']
  const v = await getSettings(keys)

  const brandName = v.restaurant_name || DEFAULT_CAFE.brandText
  const brandLogoUrl = v.menu_logo || v.profile_logo || ''
  const brandLogoColor = v.menu_logo_color || ''
  const brandAccent = v.menu_hover_color || v.sidebar_accent || DEFAULT_CAFE.color

  let cafe: (CafeConfig & { id: string }) | null = null
  if (v[CATEGORIES_KEY]) {
    try {
      const list = JSON.parse(v[CATEGORIES_KEY])
      cafe = Array.isArray(list) ? (list.find((c: CafeConfig & { id: string }) => c.id === 'cafe') ?? list[0]) : null
    } catch {}
  }

  const cfg: CafeConfig = {
    name: cafe?.name ?? DEFAULT_CAFE.name,
    reward: cafe?.reward ?? DEFAULT_CAFE.reward,
    goal: Math.max(1, Math.round(cafe?.goal ?? 0) || DEFAULT_CAFE.goal),
    icon: cafe?.icon ?? DEFAULT_CAFE.icon,
    color: cafe?.color || brandAccent,
    iconColor: cafe?.iconColor || DEFAULT_CAFE.iconColor,
    logo: brandLogoUrl,
    logoColor: brandLogoColor,
    image: cafe?.image || DEFAULT_CAFE.image,
    brandText: cafe?.brandText || brandName,
    brandLogo: cafe?.brandLogo || DEFAULT_CAFE.brandLogo,
  }

  return (
    <CardClient
      initialCfg={cfg}
      initialBgColor={v.menu_bg_color || '#0a0a0a'}
      initialBtnColor={v.menu_btn_color || '#141414'}
    />
  )
}
