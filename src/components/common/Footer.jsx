import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter,
  CreditCard,
  Truck,
  Shield,
  RefreshCw
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: 'О компании', path: '/about' },
      { name: 'Вакансии', path: '/careers' },
      { name: 'Новости', path: '/news' },
      { name: 'Контакты', path: '/contacts' }
    ],
    help: [
      { name: 'Как заказать', path: '/how-to-order' },
      { name: 'Доставка', path: '/delivery' },
      { name: 'Возврат', path: '/returns' },
      { name: 'Размерная таблица', path: '/size-guide' }
    ],
    catalog: [
      { name: 'Новинки', path: '/catalog?sort=newest' },
      { name: 'Мужская обувь', path: '/catalog?gender=male' },
      { name: 'Женская обувь', path: '/catalog?gender=female' },
      { name: 'Распродажа', path: '/catalog?sale=true' }
    ]
  }

  const features = [
    { icon: Truck, text: 'Бесплатная доставка от 5000₽' },
    { icon: RefreshCw, text: 'Возврат в течение 30 дней' },
    { icon: Shield, text: 'Гарантия подлинности' },
    { icon: CreditCard, text: 'Удобные способы оплаты' }
  ]

  return (
    <footer className="bg-gradient-to-b from-gray-100 to-gray-200 text-gray-800 mt-16 border-t border-gray-200">
      {/* Преимущества */}
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-4 bg-white rounded-2xl shadow p-5">
              <feature.icon className="w-8 h-8 text-black/60" />
              <span className="text-base font-medium text-gray-700">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Основное содержимое */}
      <div className="max-w-7xl mx-auto py-14 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* О компании */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <Link to="/" className="flex items-center gap-3 mb-6 select-none">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-extrabold text-2xl tracking-tight">S</span>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                BRO'S <span className="text-black">SHOP</span>
              </span>
            </Link>
            <p className="text-gray-500 mb-8 text-base max-w-md">
              Ваш надежный магазин оригинальных кроссовок. Только проверенные бренды и актуальные модели.
            </p>
            {/* Социальные сети */}
            <div className="flex gap-4 mt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-full shadow hover:bg-black hover:text-white transition-colors border border-gray-200"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-full shadow hover:bg-black hover:text-white transition-colors border border-gray-200"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-full shadow hover:bg-black hover:text-white transition-colors border border-gray-200"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Ссылки */}
          <div>
            <h3 className="font-semibold mb-5 text-lg">Компания</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-500 hover:text-black transition-colors text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-5 text-lg">Помощь</h3>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-500 hover:text-black transition-colors text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-5 text-lg">Каталог</h3>
            <ul className="space-y-3">
              {footerLinks.catalog.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-500 hover:text-black transition-colors text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Контакты и копирайт */}
        <div className="mt-16 pt-10 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <a
              href="tel:+78001234567"
              className="flex items-center gap-3 text-gray-500 hover:text-black transition-colors text-base"
            >
              <Phone className="w-5 h-5" />
              <span>8 (800) 123-45-67</span>
            </a>
            <a
              href="mailto:info@bro's-shop.ru"
              className="flex items-center gap-3 text-gray-500 hover:text-black transition-colors text-base"
            >
              <Mail className="w-5 h-5" />
              <span>info@bro's-shop.ru</span>
            </a>
            <div className="flex items-center gap-3 text-gray-500">
              <MapPin className="w-5 h-5" />
              <span>Москва, ул. Примерная, 123</span>
            </div>
          </div>

          {/* Копирайт */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© {currentYear} BRO'S SHOP. Все права защищены.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-black transition-colors">
                Политика конфиденциальности
              </Link>
              <Link to="/terms" className="hover:text-black transition-colors">
                Условия использования
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer