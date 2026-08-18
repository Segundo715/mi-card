'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminBrand } from '../AdminBrandContext'
import { uploadWebp } from '@/lib/uploadWebp'
import { BrandLogo } from '@/app/components/BrandLogo'
import { Icon } from '@/app/components/Icon'
import { DEFAULT_BRAND_COLOR, DEFAULT_BRAND_ACCENT } from '@/lib/brandDefaults'

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

export default function AdminConfiguracionPage() {
  const { S, reload } = useAdminBrand()
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [admins, setAdmins] = useState<AdminItem[]>([])
  const [loadingAdmins, setLoadingAdmins] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('Administrador')
  const [newPassword, setNewPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [creatingAdmin, setCreatingAdmin] = useState(false)
  const [adminError, setAdminError] = useState('')

  useEffect(() => {
    const keys = ['restaurant_name', 'restaurant_phone', 'menu_logo', 'profile_logo', 'menu_logo_color', 'menu_bg_color', 'menu_btn_color', 'menu_hover_color']
    keys.forEach(async key => {
      const r = await fetch(`/api/settings?key=${key}`)
      const d = await r.json()
      setValues(p => ({ ...p, [key]: d?.value ?? '' }))
    })
  }, [])

  const loadAdmins = useCallback(async () => {
    setLoadingAdmins(true)
    try {
      const r = await fetch('/api/admins')
      if (r.ok) setAdmins(await r.json())
    } finally { setLoadingAdmins(false) }
  }, [])

  useEffect(() => { loadAdmins(); setNewPassword(generatePassword()) }, [loadAdmins])

  async function saveSetting(key: string, valueOverride?: string) {
    const value = valueOverride ?? values[key] ?? ''
    setSaving(key)
    try {
      const r = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      if (r.ok) {
        setSaved(key)
        setTimeout(() => setSaved(null), 2500)
        reload()
      }
    } finally {
      setSaving(null)
    }
  }

  async function uploadLogo(file: File) {
    setUploadingLogo(true)
    try {
      const url = await uploadWebp(file, '/api/settings/upload')
      if (url) {
        setValues(p => ({ ...p, menu_logo: url }))
        await saveSetting('menu_logo', url)
      }
    } finally {
      setUploadingLogo(false)
    }
  }

  async function handleDeleteAdmin(id: string) {
    if (!confirm('¿Eliminar este perfil? Ya no podrá entrar al panel.')) return
    setDeletingId(id)
    try {
      const r = await fetch(`/api/admins/${id}`, { method: 'DELETE' })
      if (r.ok) setAdmins(list => list.filter(a => a.id !== id))
      else { const d = await r.json(); alert(d.error ?? 'No se pudo eliminar') }
    } finally { setDeletingId(null) }
  }

  async function handleCopyPassword() {
    try {
      await navigator.clipboard.writeText(newPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  async function handleCreateAdmin() {
    if (!newName.trim()) { setAdminError('Ingresa un nombre de usuario'); return }
    setAdminError('')
    setCreatingAdmin(true)
    try {
      const r = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), password: newPassword, role: newRole }),
      })
      if (r.ok) {
        const admin: AdminItem = await r.json()
        setAdmins(list => [...list, { ...admin, isSelf: false }])
        setNewName('')
        setNewPassword(generatePassword())
      } else {
        const d = await r.json()
        setAdminError(d.error ?? 'No se pudo crear el perfil')
      }
    } finally { setCreatingAdmin(false) }
  }

  const renderSaveBtn = (k: string) => (
    <button
      onClick={() => saveSetting(k)}
      disabled={saving === k}
      className="px-4 py-2 rounded-2xl text-sm font-bold shrink-0 transition-all"
      style={{ backgroundColor: saved === k ? 'rgba(74,222,128,.2)' : `${S.accent}22`, color: saved === k ? '#4ade80' : S.label }}>
      {saving === k ? '...' : saved === k ? '✓ Guardado' : 'Guardar'}
    </button>
  )

  const renderColorRow = (key: string, fallback: string) => (
    <div className="flex items-center gap-2">
      <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(values[key] || '') ? values[key] : fallback}
        onChange={e => setValues(p => ({ ...p, [key]: e.target.value }))}
        className="w-11 h-11 rounded-xl cursor-pointer bg-transparent shrink-0" style={{ border: `1px solid ${S.border}` }} />
      <input type="text" value={values[key] ?? ''}
        onChange={e => setValues(p => ({ ...p, [key]: e.target.value }))}
        placeholder={fallback}
        className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none font-mono"
        style={{ backgroundColor: S.bg, color: S.text, border: `1px solid ${S.border}` }} />
      {renderSaveBtn(key)}
    </div>
  )

  const inp = 'w-full px-4 py-3 rounded-2xl text-sm outline-none'
  const inpStyle = { backgroundColor: S.bg, color: S.text, border: `1px solid ${S.border}` }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <div className="pt-1">
        <h1 className="text-xl font-black" style={{ color: S.text }}>Configuración</h1>
        <p className="text-xs mt-0.5" style={{ color: S.sub }}>Identidad del restaurante</p>
      </div>

      <div className="rounded-2xl p-5 space-y-5" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>

        {/* Nombre */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>Nombre del restaurante</label>
          <div className="flex gap-2">
            <input type="text" value={values.restaurant_name ?? ''}
              onChange={e => setValues(p => ({ ...p, restaurant_name: e.target.value }))}
              className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none"
              style={{ backgroundColor: S.bg, color: S.text, border: `1px solid ${S.border}` }} />
            {renderSaveBtn('restaurant_name')}
          </div>
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>Teléfono</label>
          <div className="flex gap-2">
            <input type="text" value={values.restaurant_phone ?? ''}
              onChange={e => setValues(p => ({ ...p, restaurant_phone: e.target.value }))}
              placeholder="(444) 123-4567"
              className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none"
              style={{ backgroundColor: S.bg, color: S.text, border: `1px solid ${S.border}` }} />
            {renderSaveBtn('restaurant_phone')}
          </div>
        </div>

        {/* Logo */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>Logo del restaurante</label>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
              style={{ background: values.menu_bg_color || '#0d0d0d', border: `1px solid ${S.border}` }}>
              {(values.menu_logo || values.profile_logo) && (
                <BrandLogo src={values.menu_logo || values.profile_logo} color={values.menu_logo_color}
                  alt="logo" className="w-10 h-10 object-contain" />
              )}
            </div>
            <label className="px-4 py-2 rounded-2xl text-sm font-bold cursor-pointer transition-all"
              style={{ backgroundColor: `${S.accent}22`, color: S.label }}>
              {uploadingLogo ? 'Subiendo...' : 'Cambiar logo'}
              <input type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f) }} />
            </label>
          </div>
          <p className="text-xs mt-1" style={{ color: S.sub }}>Aparece en /admin, en la tarjeta de lealtad y en el resto del sitio</p>

          <div className="mt-3">
            <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>Recolorear logo (si tiene negro u otro color)</label>
            {renderColorRow('menu_logo_color', DEFAULT_BRAND_COLOR)}
            <p className="text-xs mt-1" style={{ color: S.sub }}>Reemplaza todo el logo por un solo tono, usando su forma como silueta. Funciona con logos de fondo transparente (PNG/WebP/SVG); no aplica a fotos o JPG.</p>
          </div>
        </div>

        {/* Fondo */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>Color de fondo</label>
          {renderColorRow('menu_bg_color', '#0d0d0d')}
        </div>

        {/* Botón / tarjetas */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>Color de botón / tarjetas</label>
          {renderColorRow('menu_btn_color', DEFAULT_BRAND_COLOR)}
        </div>

        {/* Acento */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: S.sub }}>Color de acento / hover</label>
          {renderColorRow('menu_hover_color', DEFAULT_BRAND_ACCENT)}
        </div>
      </div>

      <p className="text-xs" style={{ color: S.sub }}>
        Estos son los mismos 3 colores que se usan en el resto de mi-menu (menú, admin, tarjeta de lealtad) —
        cambiarlos aquí también los cambia allá, porque comparten la misma configuración.
      </p>

      {/* ── Administración de perfiles ── */}
      <div className="pt-2">
        <h2 className="text-base font-black" style={{ color: S.text }}>Administración de perfiles</h2>
        <p className="text-xs mt-0.5" style={{ color: S.sub }}>Usuarios con acceso al panel /admin</p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
        {loadingAdmins ? (
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
              <button onClick={() => handleDeleteAdmin(a.id)} disabled={a.isSelf || deletingId === a.id}
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
          <input type="text" value={newName} onChange={e => { setNewName(e.target.value); setAdminError('') }}
            placeholder="Nombre de usuario" className={`${inp} flex-1`} style={inpStyle} />
          <select value={newRole} onChange={e => setNewRole(e.target.value)}
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
            <span className="flex-1 font-mono text-sm truncate">{newPassword}</span>
            <button type="button" onClick={handleCopyPassword} className="text-xs font-semibold shrink-0 inline-flex items-center gap-1" style={{ color: S.sub }}>
              {copied ? <><Icon name="check" size={13} /> Copiado</> : 'Copiar'}
            </button>
            <button type="button" onClick={() => setNewPassword(generatePassword())}
              className="text-xs font-black shrink-0 inline-flex items-center gap-1" style={{ color: S.text }}>
              <Icon name="refresh" size={13} /> Nueva
            </button>
          </div>
          <p className="text-xs mt-1.5" style={{ color: S.sub }}>
            Copia la contraseña antes de crear el perfil — no se puede recuperar después.
          </p>
        </div>

        {adminError && (
          <div className="rounded-2xl px-4 py-3 text-sm font-medium"
            style={{ backgroundColor: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#f87171' }}>
            {adminError}
          </div>
        )}

        <button type="button" onClick={handleCreateAdmin} disabled={creatingAdmin}
          className="w-full text-center text-sm font-bold py-2 disabled:opacity-60" style={{ color: S.label }}>
          {creatingAdmin ? 'Creando...' : '+ Crear perfil'}
        </button>
      </div>
    </div>
  )
}
