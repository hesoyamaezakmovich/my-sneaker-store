import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Save, Trash2, ArrowLeft } from 'lucide-react'
import { fetchProductById } from '../../services/products.service'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

const AdminProductSizesPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [sizes, setSizes] = useState([])
  const [allSizes, setAllSizes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Загружаем товар
      const productData = await fetchProductById(id)
      setProduct(productData)
      
      // Загружаем все доступные размеры
      const { data: sizesData } = await supabase
        .from('sizes')
        .select('*')
        .order('size_value')
      
      setAllSizes(sizesData || [])
      
      // Загружаем размеры товара
      const { data: productSizes } = await supabase
        .from('product_sizes')
        .select('*, size:sizes(*)')
        .eq('product_id', id)
        .order('size_id')
      
      setSizes(productSizes || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddSize = async () => {
    // Находим первый размер, который еще не добавлен
    const existingSizeIds = sizes.map(s => s.size_id)
    const availableSize = allSizes.find(s => !existingSizeIds.includes(s.id))
    
    if (!availableSize) {
      toast.error('Все размеры уже добавлены')
      return
    }

    try {
      const { data, error } = await supabase
        .from('product_sizes')
        .insert({
          product_id: id,
          size_id: availableSize.id,
          quantity: 0
        })
        .select('*, size:sizes(*)')
        .single()

      if (error) throw error

      setSizes([...sizes, data])
      toast.success('Размер добавлен')
    } catch (error) {
      console.error('Error adding size:', error)
      toast.error('Ошибка добавления размера')
    }
  }

  const handleDeleteSize = async (sizeId) => {
    if (!window.confirm('Удалить этот размер?')) return

    try {
      const { error } = await supabase
        .from('product_sizes')
        .delete()
        .eq('id', sizeId)

      if (error) throw error

      setSizes(sizes.filter(s => s.id !== sizeId))
      toast.success('Размер удален')
    } catch (error) {
      console.error('Error deleting size:', error)
      toast.error('Ошибка удаления размера')
    }
  }

  const handleQuantityChange = (sizeId, newQuantity) => {
    setSizes(sizes.map(s => 
      s.id === sizeId 
        ? { ...s, quantity: parseInt(newQuantity) || 0 }
        : s
    ))
  }

  const handleSizeChange = async (productSizeId, newSizeId) => {
    // Проверяем, не занят ли уже этот размер
    const isAlreadyUsed = sizes.some(s => s.size_id === newSizeId && s.id !== productSizeId)
    if (isAlreadyUsed) {
      toast.error('Этот размер уже добавлен')
      return
    }

    setSizes(sizes.map(s => 
      s.id === productSizeId 
        ? { ...s, size_id: newSizeId, size: allSizes.find(size => size.id === newSizeId) }
        : s
    ))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Обновляем все размеры
      for (const size of sizes) {
        const { error } = await supabase
          .from('product_sizes')
          .update({
            size_id: size.size_id,
            quantity: size.quantity
          })
          .eq('id', size.id)

        if (error) throw error
      }

      toast.success('Изменения сохранены')
    } catch (error) {
      console.error('Error saving sizes:', error)
      toast.error('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handleBulkUpdate = async (action, value) => {
    if (action === 'add') {
      setSizes(sizes.map(s => ({ ...s, quantity: s.quantity + parseInt(value) })))
    } else if (action === 'set') {
      setSizes(sizes.map(s => ({ ...s, quantity: parseInt(value) })))
    }
  }

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  if (!product) {
    return <div className="text-center py-12">Товар не найден</div>
  }

  const totalStock = sizes.reduce((sum, s) => sum + s.quantity, 0)
  const mainImage = product.images?.find(img => img.is_primary) || product.images?.[0]

  return (
    <div>
      {/* Заголовок */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Управление размерами</h1>
          <p className="text-gray-500 mt-1">
            {product.brand?.name} - {product.name}
          </p>
        </div>
      </div>

      {/* Информация о товаре */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-6">
          {mainImage && (
            <img
              src={mainImage.image_url}
              alt={product.name}
              className="w-24 h-24 object-contain rounded-lg bg-gray-50"
            />
          )}
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Артикул:</span> {product.sku || '-'}
              </div>
              <div>
                <span className="text-gray-500">Цена:</span> {product.price} ₽
              </div>
              <div>
                <span className="text-gray-500">Общее наличие:</span>{' '}
                <span className={`font-semibold ${totalStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalStock} шт.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Массовые операции */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="font-semibold mb-4">Массовые операции</h3>
        <div className="flex gap-4">
          <button
            onClick={() => {
              const value = prompt('Добавить количество ко всем размерам:')
              if (value && !isNaN(value)) {
                handleBulkUpdate('add', value)
              }
            }}
            className="btn btn-secondary"
          >
            Добавить ко всем
          </button>
          <button
            onClick={() => {
              const value = prompt('Установить количество для всех размеров:')
              if (value && !isNaN(value)) {
                handleBulkUpdate('set', value)
              }
            }}
            className="btn btn-secondary"
          >
            Установить для всех
          </button>
          <button
            onClick={() => handleBulkUpdate('set', 0)}
            className="btn btn-secondary text-red-600"
          >
            Обнулить все
          </button>
        </div>
      </div>

      {/* Таблица размеров */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold">Размеры и количество</h3>
          <button
            onClick={handleAddSize}
            className="flex items-center gap-2 text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить размер
          </button>
        </div>
        
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Размер
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Количество
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sizes.map((size) => (
              <tr key={size.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={size.size_id}
                    onChange={(e) => handleSizeChange(size.id, e.target.value)}
                    className="input"
                  >
                    {allSizes.map(s => {
                      const isUsed = sizes.some(ps => ps.size_id === s.id && ps.id !== size.id)
                      return (
                        <option key={s.id} value={s.id} disabled={isUsed}>
                          {s.size_value} {isUsed ? '(уже добавлен)' : ''}
                        </option>
                      )
                    })}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={size.quantity}
                    onChange={(e) => handleQuantityChange(size.id, e.target.value)}
                    min="0"
                    className="input w-32"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    size.quantity > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {size.quantity > 0 ? 'В наличии' : 'Нет в наличии'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDeleteSize(size.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sizes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Размеры не добавлены
          </div>
        )}
      </div>

      {/* Кнопка сохранения */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>
    </div>
  )
}

export default AdminProductSizesPage