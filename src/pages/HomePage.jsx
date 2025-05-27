import React from 'react'
import Button from '../components/ui/Button'
import { Link } from 'react-router-dom'

const BRANDS = [
  { name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
  { name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
  { name: 'New Balance', logo: 'https://upload.wikimedia.org/wikipedia/commons/archive/e/ea/20160801155104%21New_Balance_logo.svg' },
  { name: 'Puma', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Puma-logo-%28text%29.svg' },
  { name: 'Reebok', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Reebok_2019_logo.svg' },
  { name: 'Vans', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Vans-logo.svg' },
  { name: 'Converse', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Converse_2003_logo.svg' },
  { name: 'ASICS', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Asics_Logo.svg' },
]

const HomePage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
            Магазин кроссовок <span className="text-primary">BRO'S SHOP</span>
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Самые свежие релизы, топовые бренды и лучшие цены. Найдите свою идеальную пару!
          </p>
          <Button as={Link} to="/catalog" size="large" variant="primary" className="mt-2">
            Перейти в каталог
          </Button>
        </div>
        <div className="flex-1 flex justify-center">
          <img
            src="https://sun9-21.userapi.com/impg/m1op_5HsWYUkzd1c54KlrOv1EZTQEbOKb-1cIg/aegH6f6Vnrw.jpg?size=2560x2560&quality=95&sign=db624567127a9708d37524a56211812f&type=album"
            alt="Sneaker Banner"
            className="rounded-2xl shadow-lg w-full max-w-md object-cover"
            loading="lazy"
          />
        </div>
      </section>

      {/* Popular Brands */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Популярные бренды</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-6 items-center">
          {BRANDS.map((brand) => (
            <div key={brand.name} className="flex flex-col items-center">
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-10 mb-2 object-contain"
                loading="lazy"
              />
              <span className="text-xs text-gray-500">{brand.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Products (stub) */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Популярные товары</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
              <div className="w-32 h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-gray-300 text-5xl">👟</span>
              </div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-4 w-16 bg-gray-100 rounded mb-2 animate-pulse" />
              <Button as={Link} to="/catalog" size="small" variant="secondary">
                Смотреть
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="text-center mt-16">
        <h3 className="text-xl font-semibold mb-2">Не нашли нужную модель?</h3>
        <p className="text-gray-600 mb-4">Переходите в каталог — у нас огромный выбор!</p>
        <Button as={Link} to="/catalog" size="large" variant="primary">
          Каталог кроссовок
        </Button>
      </section>
    </div>
  )
}

export default HomePage
