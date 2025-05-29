import React from 'react'

const CareersPage = () => (
  <div className="max-w-2xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold mb-4">Вакансии</h1>
    <p className="mb-4 text-gray-700">Присоединяйтесь к команде BRO'S SHOP! Мы ищем активных и целеустремлённых людей, которые хотят развиваться вместе с нами.</p>
    <ul className="list-disc pl-5 text-gray-600 mb-4">
      <li>Менеджер по продажам</li>
      <li>Контент-менеджер</li>
      <li>Курьер</li>
      <li>Специалист по работе с клиентами</li>
    </ul>
    <p className="text-gray-600">Отправляйте резюме на <a href="mailto:hr@bros-shop.ru" className="text-blue-600 underline">hr@bros-shop.ru</a> и станьте частью нашей команды!</p>
  </div>
)

export default CareersPage 