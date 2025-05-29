import React from 'react'

const SizeGuidePage = () => (
  <div className="max-w-2xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold mb-4">Размерная таблица</h1>
    <table className="w-full text-left border mb-4">
      <thead>
        <tr>
          <th className="border px-2 py-1">RU</th>
          <th className="border px-2 py-1">EU</th>
          <th className="border px-2 py-1">US (Муж)</th>
          <th className="border px-2 py-1">US (Жен)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td className="border px-2 py-1">39</td><td className="border px-2 py-1">40</td><td className="border px-2 py-1">7</td><td className="border px-2 py-1">8.5</td></tr>
        <tr><td className="border px-2 py-1">40</td><td className="border px-2 py-1">41</td><td className="border px-2 py-1">8</td><td className="border px-2 py-1">9.5</td></tr>
        <tr><td className="border px-2 py-1">41</td><td className="border px-2 py-1">42</td><td className="border px-2 py-1">8.5</td><td className="border px-2 py-1">10</td></tr>
        <tr><td className="border px-2 py-1">42</td><td className="border px-2 py-1">43</td><td className="border px-2 py-1">9</td><td className="border px-2 py-1">10.5</td></tr>
        <tr><td className="border px-2 py-1">43</td><td className="border px-2 py-1">44</td><td className="border px-2 py-1">10</td><td className="border px-2 py-1">11.5</td></tr>
      </tbody>
    </table>
    <p className="text-gray-600">Если у вас возникли вопросы по выбору размера — свяжитесь с нашими консультантами.</p>
  </div>
)

export default SizeGuidePage 