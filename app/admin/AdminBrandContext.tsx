'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_BRAND_NAME, DEFAULT_BRAND_COLOR } from '@/lib/brandDefaults'

const DARK_MODE_KEY = 'admin_dark_mode'

function contrastText(hex: string): string {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex)
  if (!m) return '#fff'
  const n = parseInt(m[1], 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.6 ? '#000' : '#fff'
}

interface AdminBrand {
  logo: string
  logoColor: string
  logoBg: string
  brandName: string
  adminName: string
  accentHex: string
  loaded: boolean
  reload: () => void
  // El color de identidad del restaurante (accent) se mantiene igual en ambos
  // temas — solo el resto de la paleta cambia entre claro y oscuro.
  S: { bg: string; sidebar: string; card: string; accent: string; text: string; sub: string; border: string }
  accentText: string
  darkMode: boolean
  toggleDarkMode: () => void
}

const AdminBrandContext = createContext<AdminBrand | null>(null)

export function useAdminBrand(): AdminBrand {
  const ctx = useContext(AdminBrandContext)
  if (!ctx) throw new Error('useAdminBrand debe usarse dentro de AdminBrandProvider')
  return ctx
}

export function AdminBrandProvider({ children }: { children: React.ReactNode }) {
  const [logo, setLogo] = useState('')
  const [logoColor, setLogoColor] = useState('')
  const [logoBg, setLogoBg] = useState('#0d0d0d')
  const [brandName, setBrandName] = useState(DEFAULT_BRAND_NAME)
  const [adminName, setAdminName] = useState('Administrador')
  const [accentHex, setAccentHex] = useState(DEFAULT_BRAND_COLOR)
  const [loaded, setLoaded] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  function load() {
    fetch('/api/settings?key=menu_logo').then(r => r.json()).then(d => {
      if (d?.value) { setLogo(d.value); return }
      fetch('/api/settings?key=profile_logo').then(r => r.json()).then(d2 => { if (d2?.value) setLogo(d2.value) }).catch(() => {})
    }).catch(() => {})
    fetch('/api/settings?key=menu_logo_color').then(r => r.json()).then(d => setLogoColor(d?.value ?? '')).catch(() => {})
    fetch('/api/settings?key=menu_bg_color').then(r => r.json()).then(d => { if (d?.value) setLogoBg(d.value) }).catch(() => {})
    fetch('/api/settings?key=menu_hover_color').then(r => r.json()).then(d => {
      if (d?.value) { setAccentHex(d.value); return }
      fetch('/api/settings?key=sidebar_accent').then(r => r.json()).then(d2 => { if (d2?.value) setAccentHex(d2.value) }).catch(() => {})
    }).catch(() => {})
    fetch('/api/settings?key=restaurant_name').then(r => r.json()).then(d => { if (d?.value) setBrandName(d.value) }).finally(() => setLoaded(true)).catch(() => setLoaded(true))
    const match = document.cookie.split('; ').find(r => r.startsWith('admin_name='))
    if (match) setAdminName(decodeURIComponent(match.split('=')[1]))
  }

  useEffect(() => {
    load()
    setDarkMode(localStorage.getItem(DARK_MODE_KEY) === '1')
  }, [])

  function toggleDarkMode() {
    setDarkMode(prev => {
      const next = !prev
      localStorage.setItem(DARK_MODE_KEY, next ? '1' : '0')
      return next
    })
  }

  const accentText = contrastText(accentHex)
  const S = darkMode
    ? { bg: '#0b0d14', sidebar: '#12141c', card: '#161922', accent: accentHex, text: '#f3f5fb', sub: '#8b93a7', border: 'rgba(255,255,255,0.08)' }
    : { bg: '#f3f5fb', sidebar: '#ffffff', card: '#ffffff', accent: accentHex, text: '#0d1426', sub: '#5b6884', border: 'rgba(13,20,38,0.08)' }

  return (
    <AdminBrandContext.Provider value={{ logo, logoColor, logoBg, brandName, adminName, accentHex, loaded, reload: load, S, accentText, darkMode, toggleDarkMode }}>
      {children}
    </AdminBrandContext.Provider>
  )
}
