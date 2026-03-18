const ContactsPage = () => (
  <div className="max-w-2xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold mb-6 text-gray-900">Контакты</h1>

    <p className="mb-6 text-gray-700">Свяжитесь с нами по любым вопросам:</p>

    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 mb-8">
      <div>
        <span className="font-medium text-gray-700">Организация:</span>
        <span className="ml-2 text-gray-600">АРОО «РКС»</span>
      </div>
      <div>
        <span className="font-medium text-gray-700">Email:</span>{' '}
        <a href="mailto:info@rks3d.ru" className="text-blue-600 hover:underline ml-1">info@rks3d.ru</a>
      </div>
      <div>
        <span className="font-medium text-gray-700">Регион:</span>
        <span className="ml-2 text-gray-600">Архангельская область</span>
      </div>
    </div>

    <div className="bg-blue-50 rounded-xl p-5">
      <h2 className="font-semibold text-blue-800 mb-2">Поддержка пользователей</h2>
      <p className="text-blue-700 text-sm">
        Если у вас возникли вопросы по работе платформы, вы можете написать нам через
        встроенный чат поддержки — кнопка находится в правом нижнем углу страницы после входа в аккаунт.
      </p>
    </div>
  </div>
)

export default ContactsPage
