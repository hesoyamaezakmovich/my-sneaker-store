import React from 'react'

const PrivacyPage = () => (
  <div className="max-w-2xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold text-white mb-6">Политика конфиденциальности</h1>
    <p className="mb-4 text-slate-400 leading-relaxed">
      Мы заботимся о безопасности ваших персональных данных. Вся информация, которую вы предоставляете
      при оформлении заказа, используется только для обработки и доставки заказа, а также для улучшения
      качества обслуживания.
    </p>
    <ul className="list-disc pl-5 text-slate-400 mb-4 space-y-2">
      <li>Мы не передаём ваши данные третьим лицам без вашего согласия</li>
      <li>Вы можете запросить удаление или изменение своих данных в любое время</li>
      <li>Используем cookie для улучшения работы сайта</li>
    </ul>
    <p className="text-slate-500">Если у вас есть вопросы по обработке персональных данных — свяжитесь с нами.</p>
  </div>
)

export default PrivacyPage
