'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminBrand } from '../AdminBrandContext'
import { Icon } from '@/app/components/Icon'

interface AdminItem { id: string; name: string; role: string; createdAt: string; isSelf: boolean }

// Sin 0/O/1/l/I para que no se confundan al copiarla a mano.
const PASSWORD_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'

function generatePassword(): string {
  const group = () => Array.from({ length: 4 }, () => PASSWORD_CHARSET[Math.floor(Math.random() * PASSWORD_CHARSET.length)]).join('')
  return [group(), group(), group(), group()].join('-')
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

export default function AdminUsuariosPage() {
  const { S } = useAdminBrand()
  const [admins, setAdmins] = useState<AdminItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState('Administrador')
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admins')
      if (r.ok) setAdmins(await r.json())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load(); setPassword(generatePassword()) }, [load])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este perfil? Ya no podrá entrar al panel.')) return
    setDeletingId(id)
    try {
      const r = await fetch(`/api/admins/${id}`, { method: 'DELETE' })
      if (r.ok) setAdmins(list => list.filter(a => a.id !== id))
      else { const d = await r.json(); alert(d.error ?? 'No se pudo eliminar') }
    } finally { setDeletingId(null) }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  async function handleCreate() {
    if (!name.trim()) { setError('Ingresa un nombre de usuario'); return }
    setError('')
    setCreating(true)
    try {
      const r = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), password, role }),
      })
      if (r.ok) {
        const admin: AdminItem = await r.json()
        setAdmins(list => [...list, { ...admin, isSelf: false }])
        setName('')
        setPassword(generatePassword())
      } else {
        const d = await r.json()
        setError(d.error ?? 'No se pudo crear el perfil')
      }
    } finally { setCreating(false) }
  }

  const inp = 'w-full px-4 py-3 rounded-2xl text-sm outline-none'
  const inpStyle = { backgroundColor: S.bg, color: S.text, border: `1px solid ${S.border}` }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <div className="pt-1">
        <h1 className="text-xl font-black" style={{ color: S.text }}>Administración de perfiles</h1>
        <p className="text-xs mt-0.5" style={{ color: S.sub }}>Usuarios con acceso al panel /admin</p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
        {loading ? (
          <div className="p-6 text-center text-sm" style={{ color: S.sub }}>Cargando...</div>
        ) : admins.length === 0 ? (
          <div className="p-6 text-center text-sm" style={{ color: S.sub }}>No hay perfiles todavía</div>
        ) : (
          admins.map((a, i) => (
            <div key={a.id} className="flex items-center gap-3 p-4"
              style={i > 0 ? { borderTop: `1px solid ${S.border}` } : undefined}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 text-white"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f6ef7)' }}>
                {a.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate" style={{ color: S.text }}>
                  {a.name}{a.isSelf && <span className="font-normal" style={{ color: S.sub }}> (tú)</span>}
                </p>
                <p className="text-xs" style={{ color: S.sub }}>{a.role} · Alta: {fmtDate(a.createdAt)}</p>
              </div>
              <button onClick={() => handleDelete(a.id)} disabled={a.isSelf || deletingId === a.id}
                className="px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 disabled:opacity-40 transition-opacity"
                style={{ color: '#f87171', border: '1px solid rgba(239,68,68,.3)' }}>
                {deletingId === a.id ? '...' : 'Eliminar'}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: S.sub }}>Crear nuevo perfil</p>

        <div className="flex gap-2">
          <input type="text" value={name} onChange={e => { setName(e.target.value); setError('') }}
            placeholder="Nombre de usuario" className={`${inp} flex-1`} style={inpStyle} />
          <select value={role} onChange={e => setRole(e.target.value)}
            className="px-3 py-3 rounded-2xl text-sm outline-none" style={inpStyle}>
            <option value="Administrador">Administrador</option>
            <option value="Empleado">Empleado</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: S.sub }}>
            Contraseña generada automáticamente
          </label>
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={inpStyle}>
            <span className="flex-1 font-mono text-sm truncate">{password}</span>
            <button type="button" onClick={handleCopy} className="text-xs font-semibold shrink-0 inline-flex items-center gap-1" style={{ color: S.sub }}>
              {copied ? <><Icon name="check" size={13} /> Copiado</> : 'Copiar'}
            </button>
            <button type="button" onClick={() => setPassword(generatePassword())}
              className="text-xs font-black shrink-0 inline-flex items-center gap-1" style={{ color: S.text }}>
              <Icon name="refresh" size={13} /> Nueva
            </button>
          </div>
          <p className="text-xs mt-1.5" style={{ color: S.sub }}>
            Copia la contraseña antes de crear el perfil — no se puede recuperar después.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl px-4 py-3 text-sm font-medium"
            style={{ backgroundColor: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <button type="button" onClick={handleCreate} disabled={creating}
          className="w-full text-center text-sm font-bold py-2 disabled:opacity-60" style={{ color: S.accent }}>
          {creating ? 'Creando...' : '+ Crear perfil'}
        </button>
      </div>
    </div>
  )
}
