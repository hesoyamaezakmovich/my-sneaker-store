import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Edit, Trash2, Package } from 'lucide-react'
import { fetchProducts, deleteProduct } from '../../services/products.service'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const AdminProductsPage = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchProducts()
      setProducts(data)
    } catch (error) {
      setError('Ошибка загрузки товаров')
      toast.error('Ошибка загрузки товаров')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    loadProducts()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить этот товар?')) return
    
    try {
      await deleteProduct(id)
      toast.success('Товар удален')
      loadProducts()
    } catch (error) {
      toast.error('Ошибка удаления товара')
    }
  }

  const handleEdit = (id) => {
    navigate(`/admin/products/${id}/edit`)
  }

  const handleAdd = () => {
    navigate('/admin/products/new')
  }

  const handleManageSizes = (product) => {
    navigate(`/admin/products/${product.id}/sizes`)
  }

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID,Название,Артикул,Категория,Бренд,Цена,Наличие,Статус']
    const rows = filteredProducts.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku || '-',
      p.category?.name || '-',
      p.brand?.name || '-',
      p.price,
      p.sizes?.reduce((sum, s) => sum + s.quantity, 0) || 0,
      p.is_active ? 'Активен' : 'Неактивен',
    ].join(','))

    const csv = [...headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'products.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Фильтрация и сортировка товаров
  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || product.category?.id === selectedCategory
      const matchesBrand = !selectedBrand || product.brand?.id === selectedBrand
      return matchesSearch && matchesCategory && matchesBrand
    })

    // Sorting
    result.sort((a, b) => {
      const aValue = sortConfig.key === 'totalStock' 
        ? (a.sizes?.reduce((sum, s) => sum + s.quantity, 0) || 0)
        : a[sortConfig.key] || ''
      const bValue = sortConfig.key === 'totalStock' 
        ? (b.sizes?.reduce((sum, s) => sum + s.quantity, 0) || 0)
        : b[sortConfig.key] || ''
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [products, searchTerm, selectedCategory, selectedBrand, sortConfig])

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Уникальные категории и бренды
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))]

  // Loading skeleton
  const renderSkeleton = () => (
    <tbody className="bg-white divide-y divide-gray-200">
      {[...Array(5)].map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="ml-4 h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/3"></div></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/3"></div></td>
        </tr>
      ))}
    </tbody>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Управление товарами</h1>
        <div className="flex gap-4">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Экспорт в CSV
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Добавить товар
          </button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Поиск по названию или артикулу..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все категории</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все бренды</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('')
              setSelectedBrand('')
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Сбросить
          </button>
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={handleRetry}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Повторить
          </button>
        </div>
      )}

      {/* Список товаров */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Товар {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Артикул
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Категория
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Бренд
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('price')}
              >
                Цена {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('totalStock')}
              >
                Наличие {sortConfig.key === 'totalStock' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          {loading ? renderSkeleton() : (
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((product) => {
                const totalStock = product.sizes?.reduce((sum, s) => sum + s.quantity, 0) || 0
                const mainImage = product.images?.find(img => img.is_primary) || product.images?.[0]
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {mainImage ? (
                          <img
                            src={mainImage.image_url}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-contain bg-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sku || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.brand?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.price} ₽
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        totalStock > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {totalStock > 0 ? `${totalStock} шт.` : 'Нет'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_active ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleManageSizes(product)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Управление размерами"
                      >
                        <Package className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(product.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          )}
        </table>
        
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            Товары не найдены
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredProducts.length > itemsPerPage && (
        <div className="mt-6 flex justify-center items-center gap-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Предыдущая
          </button>
          <span>
            Страница {currentPage} из {totalPages}
          </span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Следующая
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminProductsPage