import React from 'react'

const HowToOrderPage = () => (
  <div className="max-w-2xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold mb-4">Как заказать</h1>
    <ol className="list-decimal pl-5 text-gray-700 mb-4 space-y-2">
      <li>Выберите понравившийся товар в каталоге.</li>
      <li>Добавьте товар в корзину.</li>
      <li>Перейдите в корзину и оформите заказ, указав контактные данные и адрес доставки.</li>
      <li>Ожидайте звонка нашего менеджера для подтверждения заказа.</li>
      <li>Получите заказ удобным для вас способом.</li>
    </ol>
    <p className="text-gray-600">Если возникли вопросы — свяжитесь с нашей службой поддержки.</p>
  </div>
)

export default HowToOrderPage 