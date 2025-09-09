import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'
import { fetchProductById, addProduct, updateProduct, fetchCategories, fetchBrands } from '../../services/products.service'
import { supabase, uploadImage } from '../../services/supabase'
import toast from 'react-hot-toast'

const AdminProductEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [images, setImages] = useState([])
  const [uploadingImage, setUploadingImage] = useState(false)
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    sku: '',
    category_id: '',
    brand_id: '',
    is_active: true,
    gender: 'unisex'
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Загружаем категории и бренды
      const [categoriesData, brandsData] = await Promise.all([
        fetchCategories(),
        fetchBrands()
      ])
      
      setCategories(categoriesData)
      setBrands(brandsData)
      
      // Если редактируем, загружаем товар
      if (isEditing) {
        const product = await fetchProductById(id)
        setForm({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          sku: product.sku || '',
          category_id: product.category_id || '',
          brand_id: product.brand_id || '',
          is_active: product.is_active ?? true,
          gender: product.gender || 'unisex'
        })
        setImages(product.images || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }, [id, isEditing])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Проверка размера файла
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5MB')
      return
    }
    
    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error('Выберите изображение')
      return
    }
    
    try {
      setUploadingImage(true)
      
      // Загружаем изображение
      const imageUrl = await uploadImage(file)
      
      // Добавляем в список изображений
      const newImage = {
        image_url: imageUrl,
        is_primary: images.length === 0, // Первое изображение делаем главным
        order_index: images.length
      }
      
      setImages([...images, newImage])
      toast.success('Изображение загружено')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Ошибка загрузки изображения')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSetPrimaryImage = (index) => {
    setImages(images.map((img, i) => ({
      ...img,
      is_primary: i === index
    })))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Валидация
    if (!form.name.trim()) {
      toast.error('Введите название товара')
      return
    }
    
    if (!form.price || form.price <= 0) {
      toast.error('Введите корректную цену')
      return
    }
    
    if (!form.category_id) {
      toast.error('Выберите категорию')
      return
    }
    
    if (!form.brand_id) {
      toast.error('Выберите бренд')
      return
    }
    
    try {
      setSaving(true)
      
      const productData = {
        ...form,
        price: parseFloat(form.price)
      }
      
      let productId = id
      
      if (isEditing) {
        // Обновляем товар
        await updateProduct(id, productData)
        toast.success('Товар обновлен')
      } else {
        // Создаем новый товар
        const newProduct = await addProduct(productData)
        productId = newProduct.id
        toast.success('Товар создан')
      }
      
      // Сохраняем изображения
      if (productId) {
        // Удаляем старые изображения
        await supabase
          .from('product_images')
          .delete()
          .eq('product_id', productId)
        
        // Добавляем новые
        if (images.length > 0) {
          const imageRecords = images.map((img, index) => ({
            product_id: productId,
            image_url: img.image_url,
            is_primary: img.is_primary,
            order_index: index
          }))
          
          await supabase
            .from('product_images')
            .insert(imageRecords)
        }
      }
      
      navigate('/admin/products')
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Ошибка сохранения товара')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

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
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Редактирование товара' : 'Новый товар'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Основная информация */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Основная информация</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название товара <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Например: Nike Air Max 90"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Артикул
                </label>
                <input
                  type="text"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  className="input"
                  placeholder="SKU-12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цена <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="input"
                  placeholder="5990"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Бренд <span className="text-red-500">*</span>
                </label>
                <select
                  name="brand_id"
                  value={form.brand_id}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Выберите бренд</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пол
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="unisex">Унисекс</option>
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="input"
                  placeholder="Описание товара..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Товар активен
                </label>
              </div>
            </div>
          </div>

          {/* Изображения */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Изображения</h2>
            
            <div className="space-y-4">
              {/* Загруженные изображения */}
              <div className="grid grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.image_url}
                      alt=""
                      className={`w-full h-32 object-contain rounded-lg bg-gray-50 border-2 ${
                        image.is_primary ? 'border-black' : 'border-gray-200'
                      }`}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {!image.is_primary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(index)}
                        className="absolute bottom-2 left-2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Сделать главным
                      </button>
                    )}
                    {image.is_primary && (
                      <span className="absolute bottom-2 left-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                        Главное
                      </span>
                    )}
                  </div>
                ))}
                
                {/* Кнопка добавления */}
                <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">
                    {uploadingImage ? 'Загрузка...' : 'Добавить'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
              
              <p className="text-sm text-gray-500">
                Рекомендуемый размер: 800x800px. Максимальный размер файла: 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn btn-secondary"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminProductEditPage