import React from 'react'
import { Truck } from 'lucide-react'

// В контексте маркетплейса 3D-моделей доставка не нужна — всё цифровое.
// Страница переориентирована на настройки скачивания.
const AdminDeliveryPage = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Truck className="w-6 h-6 text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900">Скачивание файлов</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-600 mb-4">
          Маркетплейс 3D-моделей работает с цифровыми файлами — физическая доставка не требуется.
        </p>
        <p className="text-gray-600 mb-4">
          Настройте параметры скачивания в разделе{' '}
          <a href="/admin/settings" className="text-blue-600 hover:underline">Настройки платформы</a>:
        </p>
        <ul className="list-disc list-inside text-gray-500 text-sm space-y-2">
          <li>Время жизни ссылки для скачивания (по умолчанию: 72 часа)</li>
          <li>Максимальный размер файла 3D-модели (по умолчанию: 500 МБ)</li>
          <li>Максимальный размер превью (по умолчанию: 10 МБ)</li>
        </ul>
      </div>
    </div>
  )
}

export default AdminDeliveryPage
