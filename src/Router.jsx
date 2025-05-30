import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/common/Layout'
import Loader from './components/common/Loader'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import AdminLayout from './components/admin/AdminLayout'

// Ленивая загрузка страниц для оптимизации
const HomePage = lazy(() => import('./pages/HomePage'))
const CatalogPage = lazy(() => import('./pages/CatalogPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const CareersPage = lazy(() => import('./pages/CareersPage'))
const NewsPage = lazy(() => import('./pages/NewsPage'))
const ContactsPage = lazy(() => import('./pages/ContactsPage'))
const HowToOrderPage = lazy(() => import('./pages/HowToOrderPage'))
const DeliveryPage = lazy(() => import('./pages/DeliveryPage'))
const ReturnsPage = lazy(() => import('./pages/ReturnsPage'))
const SizeGuidePage = lazy(() => import('./pages/SizeGuidePage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))

// Админские страницы
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminProductSizesPage = lazy(() => import('./pages/admin/AdminProductSizesPage'))
const AdminProductEditPage = lazy(() => import('./pages/admin/AdminProductEditPage'))
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'))
const AdminDeliveryPage = lazy(() => import('./pages/admin/AdminDeliveryPage'))
const AdminStatsPage = lazy(() => import('./pages/admin/AdminStatsPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))

function Router() {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Публичные маршруты */}
          <Route index element={<HomePage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="cart" element={<CartPage />} />
          
          {/* Защищенные маршруты */}
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
          </Route>
          
          {/* Информационные страницы */}
          <Route path="404" element={<NotFoundPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="careers" element={<CareersPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="how-to-order" element={<HowToOrderPage />} />
          <Route path="delivery" element={<DeliveryPage />} />
          <Route path="returns" element={<ReturnsPage />} />
          <Route path="size-guide" element={<SizeGuidePage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>

        {/* Админские маршруты */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/new" element={<AdminProductEditPage />} />
            <Route path="products/:id/edit" element={<AdminProductEditPage />} />
            <Route path="products/:id/sizes" element={<AdminProductSizesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="delivery" element={<AdminDeliveryPage />} />
            <Route path="stats" element={<AdminStatsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default Router