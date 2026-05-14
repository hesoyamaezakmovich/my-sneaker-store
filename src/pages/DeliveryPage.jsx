import React from 'react'

const DeliveryPage = () => (
  <div className="max-w-2xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold text-white mb-4">Доставка</h1>
    <ul className="mb-4 text-slate-400 list-disc pl-5 space-y-2">
      <li>Бесплатная доставка при заказе от 5000₽</li>
      <li>Доставка по всей России курьером или почтой</li>
      <li>Срок доставки: 2-7 дней в зависимости от региона</li>
      <li>Возможность самовывоза из магазина</li>
    </ul>
    <p className="text-slate-500">Подробности уточняйте у менеджера при оформлении заказа.</p>
  </div>
)

export default DeliveryPage 