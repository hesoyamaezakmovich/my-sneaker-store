import React from 'react'

const ContactsPage = () => (
  <div className="max-w-2xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold mb-4">Контакты</h1>
    <p className="mb-4 text-gray-700">Свяжитесь с нами по любым вопросам:</p>
    <ul className="mb-4 text-gray-600">
      <li><strong>Телефон:</strong> <a href="tel:+78001234567" className="text-blue-600 underline">8 (800) 123-45-67</a></li>
      <li><strong>Email:</strong> <a href="mailto:info@bros-shop.ru" className="text-blue-600 underline">info@bros-shop.ru</a></li>
      <li><strong>Адрес:</strong> Москва, ул. Примерная, 123</li>
    </ul>
    <p className="text-gray-600">Мы работаем ежедневно с 10:00 до 21:00.</p>
  </div>
)

export default ContactsPage 