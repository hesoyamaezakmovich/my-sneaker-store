import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, MapPin, Truck, Clock } from 'lucide-react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

const AdminDeliveryPage = () => {
  const [deliveryZones, setDeliveryZones] = useState([])
  const [deliveryMethods, setDeliveryMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingZone, setEditingZone] = useState(null)
  const [editingMethod, setEditingMethod] = useState(null)
  const [showAddZone, setShowAddZone] = useState(false)
  const [showAddMethod, setShowAddMethod] = useState(false)
  const [newZone, setNewZone] = useState({
    name: '',
    cities: '',
    price: '',
    min_order_free: '',
    delivery_days: '',
    is_active: true
  })
  const [newMethod, setNewMethod] = useState({
    name: '',
    description: '',
    price: '',
    min_order_free: '',
    is_active: true
  })

  useEffect(() => {
    loadDeliveryData()
  }, [])

  const loadDeliveryData = async () => {
    try {
      setLoading(true)
      
      // Загружаем зоны доставки
      const { data: zones, error: zonesError } = await supabase
        .from('delivery_zones')
        .select('*')
        .order('name')

      if (zonesError) throw zonesError

      // Загружаем способы доставки
      const { data: methods, error: methodsError } = await supabase
        .from('delivery_methods')
        .select('*')
        .order('name')

      if (methodsError) throw methodsError

      setDeliveryZones(zones || [])
      setDeliveryMethods(methods || [])
    } catch (error) {
      console.error('Error loading delivery data:', error)
      toast.error('Ошибка загрузки данных доставки')
    } finally {
      setLoading(false)
    }
  }

  // Функции для зон доставки
  const addDeliveryZone = async () => {
    if (!newZone.name.trim()) {
      toast.error('Введите название зоны')
      return
    }

    try {
      const { data, error } = await supabase
        .from('delivery_zones')
        .insert([{
          name: newZone.name.trim(),
          cities: newZone.cities.trim(),
          price: parseFloat(newZone.price) || 0,
          min_order_free: parseFloat(newZone.min_order_free) || 0,
          delivery_days: newZone.delivery_days.trim(),
          is_active: newZone.is_active
        }])
        .select()
        .single()

      if (error) throw error

      setDeliveryZones([...deliveryZones, data])
      setNewZone({
        name: '',
        cities: '',
        price: '',
        min_order_free: '',
        delivery_days: '',
        is_active: true
      })
      setShowAddZone(false)
      toast.success('Зона доставки добавлена')
    } catch (error) {
      console.error('Error adding delivery zone:', error)
      toast.error('Ошибка добавления зоны доставки')
    }
  }

  const updateDeliveryZone = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('delivery_zones')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setDeliveryZones(deliveryZones.map(zone => 
        zone.id === id ? { ...zone, ...updates } : zone
      ))
      setEditingZone(null)
      toast.success('Зона доставки обновлена')
    } catch (error) {
      console.error('Error updating delivery zone:', error)
      toast.error('Ошибка обновления зоны доставки')
    }
  }

  const deleteDeliveryZone = async (id) => {
    if (!window.confirm('Удалить эту зону доставки?')) return

    try {
      const { error } = await supabase
        .from('delivery_zones')
        .delete()
        .eq('id', id)

      if (error) throw error

      setDeliveryZones(deliveryZones.filter(zone => zone.id !== id))
      toast.success('Зона доставки удалена')
    } catch (error) {
      console.error('Error deleting delivery zone:', error)
      toast.error('Ошибка удаления зоны доставки')
    }
  }

  // Функции для способов доставки
  const addDeliveryMethod = async () => {
    if (!newMethod.name.trim()) {
      toast.error('Введите название способа доставки')
      return
    }

    try {
      const { data, error } = await supabase
        .from('delivery_methods')
        .insert([{
          name: newMethod.name.trim(),
          description: newMethod.description.trim(),
          price: parseFloat(newMethod.price) || 0,
          min_order_free: parseFloat(newMethod.min_order_free) || 0,
          is_active: newMethod.is_active
        }])
        .select()
        .single()

      if (error) throw error

      setDeliveryMethods([...deliveryMethods, data])
      setNewMethod({
        name: '',
        description: '',
        price: '',
        min_order_free: '',
        is_active: true
      })
      setShowAddMethod(false)
      toast.success('Способ доставки добавлен')
    } catch (error) {
      console.error('Error adding delivery method:', error)
      toast.error('Ошибка добавления способа доставки')
    }
  }

  const updateDeliveryMethod = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('delivery_methods')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setDeliveryMethods(deliveryMethods.map(method => 
        method.id === id ? { ...method, ...updates } : method
      ))
      setEditingMethod(null)
      toast.success('Способ доставки обновлен')
    } catch (error) {
      console.error('Error updating delivery method:', error)
      toast.error('Ошибка обновления способа доставки')
    }
  }

  const deleteDeliveryMethod = async (id) => {
    if (!window.confirm('Удалить этот способ доставки?')) return

    try {
      const { error } = await supabase
        .from('delivery_methods')
        .delete()
        .eq('id', id)

      if (error) throw error

      setDeliveryMethods(deliveryMethods.filter(method => method.id !== id))
      toast.success('Способ доставки удален')
    } catch (error) {
      console.error('Error deleting delivery method:', error)
      toast.error('Ошибка удаления способа доставки')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Управление доставкой</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Зоны доставки */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Зоны доставки</h2>
              </div>
              <button
                onClick={() => setShowAddZone(true)}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Добавить зону
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Форма добавления зоны */}
            {showAddZone && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="font-medium mb-3">Новая зона доставки</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Название зоны"
                    value={newZone.name}
                    onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="text"
                    placeholder="Города (через запятую)"
                    value={newZone.cities}
                    onChange={(e) => setNewZone({ ...newZone, cities: e.target.value })}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="number"
                    placeholder="Стоимость доставки"
                    value={newZone.price}
                    onChange={(e) => setNewZone({ ...newZone, price: e.target.value })}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="number"
                    placeholder="Бесплатно от суммы"
                    value={newZone.min_order_free}
                    onChange={(e) => setNewZone({ ...newZone, min_order_free: e.target.value })}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="text"
                    placeholder="Срок доставки"
                    value={newZone.delivery_days}
                    onChange={(e) => setNewZone({ ...newZone, delivery_days: e.target.value })}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="newZoneActive"
                      checked={newZone.is_active}
                      onChange={(e) => setNewZone({ ...newZone, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="newZoneActive" className="text-sm">Активна</label>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={addDeliveryZone}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => {
                      setShowAddZone(false)
                      setNewZone({
                        name: '',
                        cities: '',
                        price: '',
                        min_order_free: '',
                        delivery_days: '',
                        is_active: true
                      })
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {/* Список зон */}
            <div className="space-y-4">
              {deliveryZones.map((zone) => (
                <div key={zone.id} className="border border-gray-200 rounded-lg p-4">
                  {editingZone === zone.id ? (
                    <EditZoneForm
                      zone={zone}
                      onSave={(updates) => updateDeliveryZone(zone.id, updates)}
                      onCancel={() => setEditingZone(null)}
                    />
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{zone.name}</h3>
                          {!zone.is_active && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Неактивна
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{zone.cities}</p>
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                          <div>Стоимость: {formatPrice(zone.price)}</div>
                          <div>Бесплатно от: {formatPrice(zone.min_order_free)}</div>
                          <div>Срок: {zone.delivery_days}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingZone(zone.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteDeliveryZone(zone.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {deliveryZones.length === 0 && (
                <p className="text-gray-500 text-center py-8">Зоны доставки не добавлены</p>
              )}
            </div>
          </div>
        </div>

        {/* Способы доставки */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Способы доставки</h2>
              </div>
              <button
                onClick={() => setShowAddMethod(true)}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Добавить способ
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Форма добавления способа */}
            {showAddMethod && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="font-medium mb-3">Новый способ доставки</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Название способа"
                    value={newMethod.name}
                    onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <textarea
                    placeholder="Описание"
                    value={newMethod.description}
                    onChange={(e) => setNewMethod({ ...newMethod, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Стоимость"
                      value={newMethod.price}
                      onChange={(e) => setNewMethod({ ...newMethod, price: e.target.value })}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <input
                      type="number"
                      placeholder="Бесплатно от суммы"
                      value={newMethod.min_order_free}
                      onChange={(e) => setNewMethod({ ...newMethod, min_order_free: e.target.value })}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="newMethodActive"
                      checked={newMethod.is_active}
                      onChange={(e) => setNewMethod({ ...newMethod, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="newMethodActive" className="text-sm">Активен</label>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={addDeliveryMethod}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => {
                      setShowAddMethod(false)
                      setNewMethod({
                        name: '',
                        description: '',
                        price: '',
                        min_order_free: '',
                        is_active: true
                      })
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {/* Список способов */}
            <div className="space-y-4">
              {deliveryMethods.map((method) => (
                <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                  {editingMethod === method.id ? (
                    <EditMethodForm
                      method={method}
                      onSave={(updates) => updateDeliveryMethod(method.id, updates)}
                      onCancel={() => setEditingMethod(null)}
                    />
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{method.name}</h3>
                          {!method.is_active && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Неактивен
                            </span>
                          )}
                        </div>
                        {method.description && (
                          <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                          <div>Стоимость: {formatPrice(method.price)}</div>
                          <div>Бесплатно от: {formatPrice(method.min_order_free)}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingMethod(method.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteDeliveryMethod(method.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {deliveryMethods.length === 0 && (
                <p className="text-gray-500 text-center py-8">Способы доставки не добавлены</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Компонент для редактирования зоны доставки
const EditZoneForm = ({ zone, onSave, onCancel }) => {
  const [name, setName] = useState(zone.name)
  const [cities, setCities] = useState(zone.cities || '')
  const [price, setPrice] = useState(zone.price.toString())
  const [minOrderFree, setMinOrderFree] = useState(zone.min_order_free.toString())
  const [deliveryDays, setDeliveryDays] = useState(zone.delivery_days || '')
  const [isActive, setIsActive] = useState(zone.is_active)

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Введите название зоны')
      return
    }
    onSave({
      name: name.trim(),
      cities: cities.trim(),
      price: parseFloat(price) || 0,
      min_order_free: parseFloat(minOrderFree) || 0,
      delivery_days: deliveryDays.trim(),
      is_active: isActive
    })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Название зоны"
        />
        <input
          type="text"
          value={cities}
          onChange={(e) => setCities(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Города"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Стоимость"
        />
        <input
          type="number"
          value={minOrderFree}
          onChange={(e) => setMinOrderFree(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Бесплатно от суммы"
        />
        <input
          type="text"
          value={deliveryDays}
          onChange={(e) => setDeliveryDays(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Срок доставки"
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            id="editZoneActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="editZoneActive" className="text-sm">Активна</label>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
        >
          <Save className="w-3 h-3" />
          Сохранить
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
        >
          <X className="w-3 h-3" />
          Отмена
        </button>
      </div>
    </div>
  )
}

// Компонент для редактирования способа доставки
const EditMethodForm = ({ method, onSave, onCancel }) => {
  const [name, setName] = useState(method.name)
  const [description, setDescription] = useState(method.description || '')
  const [price, setPrice] = useState(method.price.toString())
  const [minOrderFree, setMinOrderFree] = useState(method.min_order_free.toString())
  const [isActive, setIsActive] = useState(method.is_active)

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Введите название способа доставки')
      return
    }
    onSave({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0,
      min_order_free: parseFloat(minOrderFree) || 0,
      is_active: isActive
    })
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        placeholder="Название способа"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        placeholder="Описание"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Стоимость"
        />
        <input
          type="number"
          value={minOrderFree}
          onChange={(e) => setMinOrderFree(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Бесплатно от суммы"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="editMethodActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="editMethodActive" className="text-sm">Активен</label>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
        >
          <Save className="w-3 h-3" />
          Сохранить
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
        >
          <X className="w-3 h-3" />
          Отмена
        </button>
      </div>
    </div>
  )
}

export default AdminDeliveryPage