import React from 'react'

const NewsPage = () => (
  <div className="max-w-2xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold mb-4">Новости</h1>
    <ul className="mb-4 text-gray-700 space-y-4">
      <li>
        <strong>01.06.2024:</strong> Открытие нового магазина в Архангельске!
      </li>
      <li>
        <strong>15.05.2024:</strong> Поступление новой коллекции Nike Air Max.
      </li>
      <li>
        <strong>01.05.2024:</strong> Весенняя распродажа — скидки до 40% на избранные модели!
      </li>
    </ul>
    <p className="text-gray-600">Следите за нашими новостями, чтобы быть в курсе всех обновлений и акций.</p>
  </div>
)

export default NewsPage 