import { NextRequest } from 'next/server'
import { listAdmins, createAdmin } from '@/lib/adminDb'
import { verifySession } from '@/lib/auth'

// Todo el CRUD de admins requiere sesión — solo un admin ya logueado puede
// ver o modificar la lista de perfiles con acceso al panel.
export async function GET(req: NextRequest) {
  const selfId = verifySession(req.cookies.get('admin_session')?.value)
  if (!selfId) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const admins = await listAdmins()
  return Response.json(admins.map(a => ({ ...a, isSelf: a.id === selfId })))
}

export async function POST(req: NextRequest) {
  if (!verifySession(req.cookies.get('admin_session')?.value))
    return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { name, password, role } = await req.json()
  if (!name?.trim() || !password)
    return Response.json({ error: 'Nombre y contraseña requeridos' }, { status: 400 })

  const admin = await createAdmin(name.trim(), password, role?.trim() || undefined)
  if (!admin) return Response.json({ error: 'Ya existe un perfil con ese nombre' }, { status: 409 })
  // No devolver passwordHash al cliente.
  return Response.json({ id: admin.id, name: admin.name, role: admin.role, createdAt: admin.createdAt }, { status: 201 })
}
