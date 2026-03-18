const CareersPage = () => (
  <div className="max-w-2xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold mb-6 text-gray-900">Вакансии</h1>
    <p className="mb-6 text-gray-700">
      Присоединяйтесь к команде АРОО «РКС»! Мы ищем активных и целеустремлённых людей,
      которые хотят развивать цифровые технологии и помогать авторам 3D-контента.
    </p>
    <ul className="list-disc pl-5 text-gray-600 mb-6 space-y-2">
      <li>Менеджер по работе с авторами 3D-моделей</li>
      <li>Модератор контента</li>
      <li>Специалист технической поддержки</li>
      <li>Frontend / Backend разработчик</li>
    </ul>
    <p className="text-gray-600">
      Отправляйте резюме на{' '}
      <a href="mailto:hr@rks3d.ru" className="text-blue-600 hover:underline">
        hr@rks3d.ru
      </a>{' '}
      и станьте частью нашей команды!
    </p>
  </div>
)

export default CareersPage
