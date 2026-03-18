import { Link } from 'react-router-dom'
import { Box, Mail, Download, Shield, Star } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: 'О платформе', path: '/about' },
      { name: 'Контакты', path: '/contacts' },
      { name: 'Новости', path: '/news' },
    ],
    help: [
      { name: 'Кабинет автора', path: '/author' },
      { name: 'Мои заказы', path: '/orders' },
      { name: 'Избранное', path: '/favorites' },
      { name: 'Профиль', path: '/profile' },
    ],
    catalog: [
      { name: 'Все модели', path: '/catalog' },
      { name: 'Новинки', path: '/catalog?sort=newest' },
      { name: 'Популярные', path: '/catalog?sort=popular' },
      { name: 'Бесплатные', path: '/catalog?isFree=true' },
    ],
  }

  const features = [
    { icon: Download, text: 'Мгновенное скачивание' },
    { icon: Shield, text: 'Лицензионная защита' },
    { icon: Star, text: 'Проверенные авторы' },
    { icon: Box, text: 'Форматы OBJ, FBX, STL и другие' },
  ]

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800 mt-16 border-t border-gray-200">
      {/* Преимущества */}
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div key={feature.text} className="flex items-center gap-4 bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <feature.icon className="w-7 h-7 text-blue-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Основное содержимое */}
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* О платформе */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4 select-none">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow">
                <Box className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-gray-900">РКС</span>
                <span className="text-xs text-gray-400 block leading-none">3D Маркетплейс</span>
              </div>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Онлайн-площадка для покупки и продажи 3D-моделей от АРОО «РКС».
            </p>
            <div className="mt-4">
              <a href="mailto:info@rks3d.ru" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                <Mail className="w-4 h-4" />
                info@rks3d.ru
              </a>
            </div>
          </div>

          {/* Компания */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Компания</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Личный кабинет */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Личный кабинет</h3>
            <ul className="space-y-2.5">
              {footerLinks.help.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Каталог */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Каталог</h3>
            <ul className="space-y-2.5">
              {footerLinks.catalog.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Копирайт */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© {currentYear} АРОО «РКС» — 3D Маркетплейс. Все права защищены.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">
              Политика конфиденциальности
            </Link>
            <Link to="/terms" className="hover:text-blue-600 transition-colors">
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
