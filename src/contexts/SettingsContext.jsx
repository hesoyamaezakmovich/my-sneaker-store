import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

const SettingsContext = createContext({});

const defaultSettings = {
  // Внешний вид
  primary_color: '#000000',
  secondary_color: '#ffffff',
  accent_color: '#3b82f6',
  show_brand_logos: true,
  show_size_guide: true,
  
  // Общие настройки
  store_name: 'BRO\'S SHOP',
  store_description: 'Магазин оригинальных кроссовок',
  min_order_amount: 0,
  free_shipping_amount: 5000,
  
  // Платежи
  payment_methods: {
    cash: true,
    card: true,
    online: true
  }
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;
      const settingsObj = {};
      if (data && data.length > 0) {
        data.forEach(setting => {
          try {
            let value = setting.value
            
            if (setting.value_type === 'json') {
              value = JSON.parse(setting.value)
            } else if (setting.value_type === 'number') {
              value = parseFloat(setting.value) || 0
            } else if (setting.value_type === 'boolean') {
              value = setting.value === 'true'
            }
            
            settingsObj[setting.key] = value;
          } catch (e) {
            settingsObj[setting.key] = setting.value;
          }
        });
      }
      const finalSettings = { ...defaultSettings, ...settingsObj }
      setSettings(finalSettings);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки настроек');
    } finally {
      setLoading(false);
    }
  }, []);

  const applyCSSVariables = useCallback(() => {
    if (settings) {
      const root = document.documentElement
      root.style.setProperty('--primary-color', settings.primary_color || '#000000')
      root.style.setProperty('--secondary-color', settings.secondary_color || '#ffffff')
      root.style.setProperty('--accent-color', settings.accent_color || '#3b82f6')
    }
  }, [settings])

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    applyCSSVariables();
  }, [applyCSSVariables]);

  const value = {
    settings,
    loading,
    error,
    refetch: fetchSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings должен использоваться внутри SettingsProvider');
  }
  return context;
}; 