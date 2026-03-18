import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../services/api'

const SettingsContext = createContext({})

const defaultSettings = {
  primary_color: '#2563eb',
  secondary_color: '#ffffff',
  accent_color: '#3b82f6',
  site_name: 'РКС 3D Маркетплейс',
  site_description: 'Маркетплейс 3D-моделей АРОО «РКС»',
  show_brand_logos: true,
  commission_rate: '15',
  max_file_size_mb: '500',
  download_link_ttl_hours: '72',
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/settings')
      if (data.settings) {
        setSettings({ ...defaultSettings, ...data.settings })
      }
    } catch {
      // Используем настройки по умолчанию при ошибке
    } finally {
      setLoading(false)
    }
  }, [])

  const applyCSSVariables = useCallback(() => {
    const root = document.documentElement
    root.style.setProperty('--primary-color', settings.primary_color || '#2563eb')
    root.style.setProperty('--secondary-color', settings.secondary_color || '#ffffff')
    root.style.setProperty('--accent-color', settings.accent_color || '#3b82f6')
  }, [settings])

  useEffect(() => { fetchSettings() }, [fetchSettings])
  useEffect(() => { applyCSSVariables() }, [applyCSSVariables])

  return (
    <SettingsContext.Provider value={{ settings, loading, refetch: fetchSettings, updateSettings: (s) => setSettings(prev => ({ ...prev, ...s })) }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used within SettingsProvider')
  return context
}
