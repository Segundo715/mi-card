import { NextRequest } from 'next/server'
import { deleteAdmin, countAdmins } from '@/lib/adminDb'
import { verifySession } from '@/lib/auth'

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const selfId = verifySession(req.cookies.get('admin_session')?.value)
  if (!selfId) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await ctx.params
  if (id === selfId) return Response.json({ error: 'No puedes eliminar tu propio perfil' }, { status: 400 })

  // Evita dejar el panel sin ningún admin que pueda entrar.
  const count = await countAdmins()
  if (count <= 1) return Response.json({ error: 'Debe quedar al menos un perfil' }, { status: 400 })

  await deleteAdmin(id)
  return Response.json({ ok: true })
}
