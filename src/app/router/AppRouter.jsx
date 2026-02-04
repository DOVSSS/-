import React, { createContext, useState, Suspense, lazy } from 'react'; // ДОБАВЬТЕ createContext
import { Routes, Route, Navigate, Outlet, useOutletContext } from 'react-router-dom';
import Header from '../../components/Header/Header';
import BottomNav from '../../components/BottomNav/BottomNav';
import Loader from '../../components/Loader/Loader';
import { useAuthStore } from '../../store/store';

// Ленивая загрузка страниц
const Home = lazy(() => import('../../pages/Home/Home'));
const ProductPage = lazy(() => import('../../pages/Product/ProductPage'));
const Cart = lazy(() => import('../../pages/Cart/Cart'));
const Favorites = lazy(() => import('../../pages/Favorites/Favorites'));
const SearchPage = lazy(() => import('../../pages/Search/SearchPage'));
const AdminDashboard = lazy(() => import('../../pages/Admin/AdminDashboard'));
const AdminProducts = lazy(() => import('../../pages/Admin/AdminProducts'));
const AddProduct = lazy(() => import('../../pages/Admin/AddProduct'));
const AdminOrders = lazy(() => import('../../pages/Admin/AdminOrders'));
const Login = lazy(() => import('../../pages/Auth/Login'));
const Register = lazy(() => import('../../pages/Auth/Register'));
const Profile = lazy(() => import('../../pages/Profile/Profile'));

// Защищенный роут для админа
const AdminRoute = ({ children }) => {
  const { isAdmin, user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <Loader />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Доступ запрещен</h2>
          <p className="text-gray-600 mb-6">Только для администраторов</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }
  
  return children;
};

// Создайте контекст для передачи данных между Header и Home
const ProductContext = createContext(); // ИСПОЛЬЗУЙТЕ createContext из React

// Компонент для отображения Header/BottomNav на публичных страницах
const PublicLayout = () => {
  // СОСТОЯНИЕ ДЛЯ ВЫБРАННОГО ТОВАРА ИЗ ПОИСКА
  const [selectedProductId, setSelectedProductId] = useState(null);

  return (
    <ProductContext.Provider value={{ selectedProductId, setSelectedProductId }}>
      <div className="min-h-screen flex flex-col">
        {/* ПЕРЕДАЕМ setSelectedProductId В HEADER */}
        <Header onProductSelect={setSelectedProductId} />
        <main>
          {/* ПЕРЕДАЕМ КОНТЕКСТ ЧЕРЕЗ OUTLET */}
          <Outlet context={{ selectedProductId, setSelectedProductId }} />
        </main>
        <BottomNav />
      </div>
    </ProductContext.Provider>
  );
};

// Компонент для админских страниц (без Header/BottomNav)
const AdminLayout = () => {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
};

// Компонент для страниц авторизации (без Header/BottomNav)
const AuthLayout = () => {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
};

// Оберните Home в компонент, который получает контекст
const HomeWithContext = () => {
  // ПОЛУЧАЕМ КОНТЕКСТ ИЗ OUTLET
  const { selectedProductId, setSelectedProductId } = useOutletContext();
  
  return (
    <Home 
      selectedProductId={selectedProductId}
      setSelectedProductId={setSelectedProductId}
    />
  );
};

function AppRouter() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Публичные маршруты с Header и BottomNav */}
        <Route element={<PublicLayout />}>
          {/* ИСПОЛЬЗУЕМ HomeWithContext вместо Home */}
          <Route path="/" element={<HomeWithContext />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        {/* Маршруты авторизации (без Header/BottomNav) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        {/* Админские маршруты без Header и BottomNav */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }>
            <Route index element={<AdminProducts />} />
            <Route path="add" element={<AddProduct />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="stats" element={<div>Статистика</div>} />
            <Route path="settings" element={<div>Настройки</div>} />
          </Route>
        </Route>
        
        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-gray-600 mb-8">Страница не найдена</p>
              <a 
                href="/" 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                На главную
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;