import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

// В контексте 3D-моделей «размеры» не применяются.
// Страница переориентирована на управление форматами файлов конкретной модели.
const AdminProductSizesPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div>
      <button onClick={() => navigate('/admin/models')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Назад к списку моделей
      </button>

      <h1 className="text-2xl font-bold mb-4 text-gray-900">Файлы модели</h1>
      <p className="text-gray-500 mb-6">
        Управление файлами 3D-моделей осуществляется через кабинет автора и загрузку файлов.
        Загрузка файлов через административный интерфейс будет доступна в следующей версии.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          ID модели: <span className="font-mono font-medium">{id}</span>
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Для управления файлами модели используйте кабинет автора или API.
        </p>
      </div>
    </div>
  )
}

export default AdminProductSizesPage
