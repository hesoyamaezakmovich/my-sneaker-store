import React, { useState, useEffect } from 'react'
import { 
  Save, 
  Settings as SettingsIcon,
  Store,
  Mail,
  Globe,
  Shield,
  Database,
  Bell,
  CreditCard,
  Palette
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    // Общие настройки магазина
    store_name: 'BRO\'S SHOP',
    store_description: 'Магазин оригинальных кроссовок',
    store_email: 'info@bros-shop.ru',
    store_phone: '+7 (800) 123-45-67',
    store_address: 'Москва, ул. Примерная, 123',
    
    // Настройки заказов
    min_order_amount: 0,
    free_shipping_amount: 5000,
    order_processing_time: 24,
    auto_confirm_orders: false,
    
    // Уведомления
    email_notifications: true,
    sms_notifications: false,
    order_status_emails: true,
    low_stock_alerts: true,
    
    // Платежи
    payment_methods: {
      cash: true,
      card: true,
      online: true
    },
    
    // SEO
    meta_title: 'BRO\'S SHOP - Магазин кроссовок',
    meta_description: 'Оригинальные кроссовки Nike, Adidas, New Balance и других брендов',
    meta_keywords: 'кроссовки, обувь, Nike, Adidas',
    
    // Внешний вид
    primary_color: '#000000',
    secondary_color: '#ffffff',
    accent_color: '#3b82f6',
    show_brand_logos: true,
    show_size_guide: true,
    
    // Безопасность
    enable_registration: true,
    require_email_verification: true,
    max_login_attempts: 5,
    session_timeout: 30
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: 'Общие', icon: Store },
    { id: 'orders', label: 'Заказы', icon: SettingsIcon },
    { id: 'notifications', label: 'Уведомления', icon: Bell },
    { id: 'payments', label: 'Платежи', icon: CreditCard },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'appearance', label: 'Внешний вид', icon: Palette },
    { id: 'security', label: 'Безопасность', icon: Shield }
  ]

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      // Загружаем настройки из базы данных
      const { data, error } = await supabase
        .from('settings')
        .select('*')

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      // Преобразуем массив настроек в объект
      if (data && data.length > 0) {
        const settingsObj = {}
        data.forEach(setting => {
          try {
            settingsObj[setting.key] = setting.value_type === 'json' 
              ? JSON.parse(setting.value) 
              : setting.value
          } catch (e) {
            settingsObj[setting.key] = setting.value
          }
        })
        
        setSettings(prev => ({ ...prev, ...settingsObj }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Ошибка загрузки настроек')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      
      // Подготавливаем данные для сохранения
      const settingsToSave = Object.entries(settings).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        value_type: typeof value === 'object' ? 'json' : typeof value
      }))

      // Сначала удаляем все старые настройки
      await supabase.from('settings').delete().neq('key', '')

      // Затем вставляем новые
      const { error } = await supabase
        .from('settings')
        .insert(settingsToSave)

      if (error) throw error

      toast.success('Настройки сохранены')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Ошибка сохранения настроек')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleNestedChange = (parentKey, childKey, value) => {
    setSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value
      }
    }))
  }

  if (loading) {
    return <div className="text-center py-12">Загрузка настроек...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Настройки системы</h1>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Сохранение...' : 'Сохранить все'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Навигация по вкладкам */}
        <div className="lg:w-64">
          <nav className="bg-white rounded-lg shadow p-4">
            <div className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </nav>
        </div>

        {/* Содержимое вкладок */}
        <div className="flex-1 bg-white rounded-lg shadow">
          {activeTab === 'general' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Общие настройки</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название магазина
                  </label>
                  <input
                    type="text"
                    value={settings.store_name}
                    onChange={(e) => handleInputChange('store_name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email магазина
                  </label>
                  <input
                    type="email"
                    value={settings.store_email}
                    onChange={(e) => handleInputChange('store_email', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={settings.store_phone}
                    onChange={(e) => handleInputChange('store_phone', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес
                  </label>
                  <input
                    type="text"
                    value={settings.store_address}
                    onChange={(e) => handleInputChange('store_address', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание магазина
                  </label>
                  <textarea
                    value={settings.store_description}
                    onChange={(e) => handleInputChange('store_description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Настройки заказов</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Минимальная сумма заказа (₽)
                  </label>
                  <input
                    type="number"
                    value={settings.min_order_amount}
                    onChange={(e) => handleInputChange('min_order_amount', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Бесплатная доставка от (₽)
                  </label>
                  <input
                    type="number"
                    value={settings.free_shipping_amount}
                    onChange={(e) => handleInputChange('free_shipping_amount', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Время обработки заказа (часы)
                  </label>
                  <input
                    type="number"
                    value={settings.order_processing_time}
                    onChange={(e) => handleInputChange('order_processing_time', parseInt(e.target.value) || 24)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto_confirm_orders"
                    checked={settings.auto_confirm_orders}
                    onChange={(e) => handleInputChange('auto_confirm_orders', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <label htmlFor="auto_confirm_orders" className="text-sm font-medium text-gray-700">
                    Автоматически подтверждать заказы
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Уведомления</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email уведомления</div>
                    <div className="text-sm text-gray-500">Получать уведомления на email</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.email_notifications}
                    onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">SMS уведомления</div>
                    <div className="text-sm text-gray-500">Получать SMS о заказах</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.sms_notifications}
                    onChange={(e) => handleInputChange('sms_notifications', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Уведомления о статусе заказа</div>
                    <div className="text-sm text-gray-500">Отправлять клиентам уведомления об изменении статуса</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.order_status_emails}
                    onChange={(e) => handleInputChange('order_status_emails', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Уведомления о низких остатках</div>
                    <div className="text-sm text-gray-500">Получать уведомления когда товар заканчивается</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.low_stock_alerts}
                    onChange={(e) => handleInputChange('low_stock_alerts', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Способы оплаты</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Наличными при получении</div>
                    <div className="text-sm text-gray-500">Оплата наличными курьеру</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.payment_methods?.cash}
                    onChange={(e) => handleNestedChange('payment_methods', 'cash', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Картой при получении</div>
                    <div className="text-sm text-gray-500">Оплата картой курьеру</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.payment_methods?.card}
                    onChange={(e) => handleNestedChange('payment_methods', 'card', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Онлайн оплата</div>
                    <div className="text-sm text-gray-500">Оплата картой онлайн</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.payment_methods?.online}
                    onChange={(e) => handleNestedChange('payment_methods', 'online', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">SEO настройки</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={settings.meta_title}
                    onChange={(e) => handleInputChange('meta_title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={settings.meta_description}
                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={settings.meta_keywords}
                    onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
                    placeholder="ключевые, слова, через, запятую"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Внешний вид</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Основной цвет
                  </label>
                  <input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => handleInputChange('primary_color', e.target.value)}
                    className="w-full h-10 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Вторичный цвет
                  </label>
                  <input
                    type="color"
                    value={settings.secondary_color}
                    onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                    className="w-full h-10 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Акцентный цвет
                  </label>
                  <input
                    type="color"
                    value={settings.accent_color}
                    onChange={(e) => handleInputChange('accent_color', e.target.value)}
                    className="w-full h-10 border rounded-lg"
                  />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Показывать логотипы брендов</div>
                    <div className="text-sm text-gray-500">Отображать логотипы брендов в каталоге</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.show_brand_logos}
                    onChange={(e) => handleInputChange('show_brand_logos', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Показывать таблицу размеров</div>
                    <div className="text-sm text-gray-500">Отображать ссылку на таблицу размеров</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.show_size_guide}
                    onChange={(e) => handleInputChange('show_size_guide', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Безопасность</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Максимум попыток входа
                  </label>
                  <input
                    type="number"
                    value={settings.max_login_attempts}
                    onChange={(e) => handleInputChange('max_login_attempts', parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Время сессии (минуты)
                  </label>
                  <input
                    type="number"
                    value={settings.session_timeout}
                    onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Разрешить регистрацию</div>
                    <div className="text-sm text-gray-500">Пользователи могут регистрироваться на сайте</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enable_registration}
                    onChange={(e) => handleInputChange('enable_registration', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Требовать подтверждение email</div>
                    <div className="text-sm text-gray-500">Отправлять письмо с подтверждением при регистрации</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.require_email_verification}
                    onChange={(e) => handleInputChange('require_email_verification', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSettingsPage