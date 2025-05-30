import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingBrand, setEditingBrand] = useState(null)
  const [newCategory, setNewCategory] = useState({ name: '', description: '', slug: '' })
  const [newBrand, setNewBrand] = useState({ name: '', description: '', logo_url: '' })
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddBrand, setShowAddBrand] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Загружаем категории с количеством товаров
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          *,
          products(count)
        `)
        .order('name')

      if (categoriesError) throw categoriesError

      // Загружаем бренды с количеством товаров
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select(`
          *,
          products(count)
        `)
        .order('name')

      if (brandsError) throw brandsError

      setCategories(categoriesData || [])
      setBrands(brandsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  // Функции для категорий
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[а-я]/g, (char) => {
        const ru = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'
        const en = 'abvgdeejzijklmnoprstufhccss_y_eua'
        return en[ru.indexOf(char)] || char
      })
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleCategoryNameChange = (name) => {
    setNewCategory({
      ...newCategory,
      name,
      slug: generateSlug(name)
    })
  }

  const addCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Введите название категории')
      return
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: newCategory.name.trim(),
          description: newCategory.description.trim(),
          slug: newCategory.slug
        }])
        .select()
        .single()

      if (error) throw error

      setCategories([...categories, { ...data, products: [{ count: 0 }] }])
      setNewCategory({ name: '', description: '', slug: '' })
      setShowAddCategory(false)
      toast.success('Категория добавлена')
    } catch (error) {
      console.error('Error adding category:', error)
      if (error.code === '23505') {
        toast.error('Категория с таким названием уже существует')
      } else {
        toast.error('Ошибка добавления категории')
      }
    }
  }

  const updateCategory = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setCategories(categories.map(cat => 
        cat.id === id ? { ...cat, ...updates } : cat
      ))
      setEditingCategory(null)
      toast.success('Категория обновлена')
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Ошибка обновления категории')
    }
  }

  const deleteCategory = async (id) => {
    if (!window.confirm('Удалить эту категорию?')) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCategories(categories.filter(cat => cat.id !== id))
      toast.success('Категория удалена')
    } catch (error) {
      console.error('Error deleting category:', error)
      if (error.code === '23503') {
        toast.error('Нельзя удалить категорию, к которой привязаны товары')
      } else {
        toast.error('Ошибка удаления категории')
      }
    }
  }

  // Функции для брендов
  const addBrand = async () => {
    if (!newBrand.name.trim()) {
      toast.error('Введите название бренда')
      return
    }

    try {
      const { data, error } = await supabase
        .from('brands')
        .insert([{
          name: newBrand.name.trim(),
          description: newBrand.description.trim(),
          logo_url: newBrand.logo_url.trim()
        }])
        .select()
        .single()

      if (error) throw error

      setBrands([...brands, { ...data, products: [{ count: 0 }] }])
      setNewBrand({ name: '', description: '', logo_url: '' })
      setShowAddBrand(false)
      toast.success('Бренд добавлен')
    } catch (error) {
      console.error('Error adding brand:', error)
      if (error.code === '23505') {
        toast.error('Бренд с таким названием уже существует')
      } else {
        toast.error('Ошибка добавления бренда')
      }
    }
  }

  const updateBrand = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('brands')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setBrands(brands.map(brand => 
        brand.id === id ? { ...brand, ...updates } : brand
      ))
      setEditingBrand(null)
      toast.success('Бренд обновлен')
    } catch (error) {
      console.error('Error updating brand:', error)
      toast.error('Ошибка обновления бренда')
    }
  }

  const deleteBrand = async (id) => {
    if (!window.confirm('Удалить этот бренд?')) return

    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id)

      if (error) throw error

      setBrands(brands.filter(brand => brand.id !== id))
      toast.success('Бренд удален')
    } catch (error) {
      console.error('Error deleting brand:', error)
      if (error.code === '23503') {
        toast.error('Нельзя удалить бренд, к которому привязаны товары')
      } else {
        toast.error('Ошибка удаления бренда')
      }
    }
  }

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Управление категориями и брендами</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Категории */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Категории</h2>
              <button
                onClick={() => setShowAddCategory(true)}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Форма добавления */}
            {showAddCategory && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="font-medium mb-3">Новая категория</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Название категории"
                    value={newCategory.name}
                    onChange={(e) => handleCategoryNameChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="text"
                    placeholder="Slug (генерируется автоматически)"
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <textarea
                    placeholder="Описание (необязательно)"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addCategory}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCategory(false)
                        setNewCategory({ name: '', description: '', slug: '' })
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Список категорий */}
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  {editingCategory === category.id ? (
                    <EditCategoryForm
                      category={category}
                      onSave={(updates) => updateCategory(category.id, updates)}
                      onCancel={() => setEditingCategory(null)}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-gray-500">Slug: {category.slug}</p>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Товаров: {category.products?.[0]?.count || 0}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingCategory(category.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-gray-500 text-center py-8">Категории не добавлены</p>
              )}
            </div>
          </div>
        </div>

        {/* Бренды */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Бренды</h2>
              <button
                onClick={() => setShowAddBrand(true)}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Форма добавления */}
            {showAddBrand && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="font-medium mb-3">Новый бренд</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Название бренда"
                    value={newBrand.name}
                    onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="url"
                    placeholder="URL логотипа (необязательно)"
                    value={newBrand.logo_url}
                    onChange={(e) => setNewBrand({ ...newBrand, logo_url: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <textarea
                    placeholder="Описание (необязательно)"
                    value={newBrand.description}
                    onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addBrand}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => {
                        setShowAddBrand(false)
                        setNewBrand({ name: '', description: '', logo_url: '' })
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Список брендов */}
            <div className="space-y-3">
              {brands.map((brand) => (
                <div key={brand.id} className="border border-gray-200 rounded-lg p-4">
                  {editingBrand === brand.id ? (
                    <EditBrandForm
                      brand={brand}
                      onSave={(updates) => updateBrand(brand.id, updates)}
                      onCancel={() => setEditingBrand(null)}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {brand.logo_url && (
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            className="w-8 h-8 object-contain"
                          />
                        )}
                        <div>
                          <h3 className="font-medium">{brand.name}</h3>
                          {brand.description && (
                            <p className="text-sm text-gray-600">{brand.description}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            Товаров: {brand.products?.[0]?.count || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingBrand(brand.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBrand(brand.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {brands.length === 0 && (
                <p className="text-gray-500 text-center py-8">Бренды не добавлены</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Компонент для редактирования категории
const EditCategoryForm = ({ category, onSave, onCancel }) => {
  const [name, setName] = useState(category.name)
  const [slug, setSlug] = useState(category.slug)
  const [description, setDescription] = useState(category.description || '')

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Введите название категории')
      return
    }
    onSave({ name: name.trim(), slug: slug.trim(), description: description.trim() })
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
      />
      <input
        type="text"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
      />
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

// Компонент для редактирования бренда
const EditBrandForm = ({ brand, onSave, onCancel }) => {
  const [name, setName] = useState(brand.name)
  const [logoUrl, setLogoUrl] = useState(brand.logo_url || '')
  const [description, setDescription] = useState(brand.description || '')

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Введите название бренда')
      return
    }
    onSave({ 
      name: name.trim(), 
      logo_url: logoUrl.trim(), 
      description: description.trim() 
    })
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
      />
      <input
        type="url"
        value={logoUrl}
        onChange={(e) => setLogoUrl(e.target.value)}
        placeholder="URL логотипа"
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        placeholder="Описание"
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
      />
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

export default AdminCategoriesPage