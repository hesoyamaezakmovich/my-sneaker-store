const ContactsPage = () => (
  <div className="max-w-2xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold text-white mb-6">Контакты</h1>
    <p className="mb-6 text-slate-400">Свяжитесь с нами по любым вопросам:</p>

    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 mb-6">
      <div>
        <span className="font-medium text-slate-300">Организация:</span>
        <span className="ml-2 text-slate-400">АРОО «РКС»</span>
      </div>
      <div>
        <span className="font-medium text-slate-300">Email:</span>
        <a href="mailto:info@rks3d.ru" className="ml-2 text-indigo-400 hover:text-indigo-300 transition-colors">
          info@rks3d.ru
        </a>
      </div>
      <div>
        <span className="font-medium text-slate-300">Регион:</span>
        <span className="ml-2 text-slate-400">Архангельская область</span>
      </div>
    </div>

    <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-2xl p-5">
      <h2 className="font-semibold text-indigo-400 mb-2">Поддержка пользователей</h2>
      <p className="text-slate-500 text-sm leading-relaxed">
        Если у вас возникли вопросы по работе платформы, вы можете написать нам через
        встроенный чат поддержки — кнопка находится в правом нижнем углу страницы после входа в аккаунт.
      </p>
    </div>
  </div>
)

export default ContactsPage
