import { Link } from 'react-router-dom'
import { Box, Mail, Download, Shield, Star, Layers } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: 'О платформе', path: '/about' },
      { name: 'Контакты', path: '/contacts' },
      { name: 'Новости', path: '/news' },
    ],
    account: [
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
    { icon: Download, label: 'Мгновенное скачивание' },
    { icon: Shield, label: 'Лицензионная защита' },
    { icon: Star, label: 'Проверенные авторы' },
    { icon: Layers, label: 'OBJ · FBX · STL · GLTF' },
  ]

  return (
    <footer className="bg-slate-950 text-slate-400 mt-16">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      {/* Features strip */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-sm text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3 mb-5 select-none">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
                <Box className="w-5 h-5 text-white" />
              </div>
              <div className="leading-none">
                <span className="text-base font-black text-white">РКС</span>
                <span className="text-[10px] text-slate-500 block mt-px">3D Маркетплейс</span>
              </div>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              Онлайн-площадка для покупки и продажи высококачественных 3D-моделей от АРОО «РКС».
            </p>
            <a
              href="mailto:info@rks3d.ru"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-400 transition-colors"
            >
              <Mail className="w-4 h-4" />
              info@rks3d.ru
            </a>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Компания</h3>
            <ul className="space-y-3">
              {footerLinks.company.map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Личный кабинет</h3>
            <ul className="space-y-3">
              {footerLinks.account.map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Catalog */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Каталог</h3>
            <ul className="space-y-3">
              {footerLinks.catalog.map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-600">
            © {currentYear} АРОО «РКС» — 3D Маркетплейс. Все права защищены.
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="text-xs text-slate-600 hover:text-indigo-400 transition-colors"
            >
              Политика конфиденциальности
            </Link>
            <Link
              to="/terms"
              className="text-xs text-slate-600 hover:text-indigo-400 transition-colors"
            >
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
