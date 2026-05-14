const CareersPage = () => (
  <div className="max-w-2xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold text-white mb-6">Вакансии</h1>
    <p className="mb-6 text-slate-400 leading-relaxed">
      Присоединяйтесь к команде АРОО «РКС»! Мы ищем активных и целеустремлённых людей,
      которые хотят развивать цифровые технологии и помогать авторам 3D-контента.
    </p>
    <ul className="list-disc pl-5 text-slate-400 mb-6 space-y-2">
      <li>Менеджер по работе с авторами 3D-моделей</li>
      <li>Модератор контента</li>
      <li>Специалист технической поддержки</li>
      <li>Frontend / Backend разработчик</li>
    </ul>
    <p className="text-slate-400">
      Отправляйте резюме на{' '}
      <a href="mailto:hr@rks3d.ru" className="text-indigo-400 hover:text-indigo-300 transition-colors">
        hr@rks3d.ru
      </a>{' '}
      и станьте частью нашей команды!
    </p>
  </div>
)

export default CareersPage
