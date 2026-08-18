import { NextRequest } from 'next/server'
import { getSetting, getSettings, setSetting } from '@/lib/settingsDb'
import { verifySession } from '@/lib/auth'

// GET es público: los layouts y componentes del cliente necesitan leer nombre/logo sin sesión.
// ?keys=a,b,c trae varias en una sola consulta (usar esto en vez de N llamadas con ?key=
// en paralelo — cada una era un round-trip real y sumaban la lentitud inicial percibida).
export async function GET(req: NextRequest) {
  const keysParam = req.nextUrl.searchParams.get('keys')
  if (keysParam) {
    const keys = keysParam.split(',').map(k => k.trim()).filter(Boolean)
    const values = await getSettings(keys)
    return Response.json({ values })
  }
  const key = req.nextUrl.searchParams.get('key') ?? ''
  if (!key) return Response.json({ error: 'key requerido' }, { status: 400 })
  const value = await getSetting(key)
  return Response.json({ key, value })
}

// POST requiere sesión de admin: solo el admin puede cambiar la configuración del restaurante.
export async function POST(req: NextRequest) {
  if (!verifySession(req.cookies.get('admin_session')?.value))
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  const { key, value } = await req.json()
  if (!key) return Response.json({ error: 'key requerido' }, { status: 400 })
  await setSetting(key, value)
  return Response.json({ ok: true })
}
