import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

const SettingsContext = createContext({});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
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
            settingsObj[setting.key] = setting.value_type === 'json'
              ? JSON.parse(setting.value)
              : setting.value;
          } catch (e) {
            settingsObj[setting.key] = setting.value;
          }
        });
      }
      setSettings(settingsObj);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки настроек');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

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