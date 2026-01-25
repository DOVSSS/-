import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import SearchBar from '../Search/SearchBar';
import { useCartStore } from '../../store/store';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { items } = useCartStore();
  
  const cartCount = items?.reduce((total, item) => total + item.quantity, 0) || 0;
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Не показываем Header на админских страницах
  if (isAdminPage) {
    return null;
  }

  const navItems = [
    { path: '/', label: 'Главная' },
    { path: '/catalog', label: 'Каталог' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Верхняя панель */}
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <Link to="/" className="text-xl font-semibold text-gray-800">
            ChinaStore
          </Link>

          {/* Поиск (десктоп) */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Иконки действий */}
          <div className="flex items-center gap-4">
            <Link 
              to="/favorites" 
              className="p-2 text-gray-600 hover:text-blue-600 relative"
              title="Избранное"
            >
              <FiHeart size={20} />
            </Link>
            
            <Link 
              to="/cart" 
              className="p-2 text-gray-600 hover:text-blue-600 relative"
              title="Корзина"
            >
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            
            <Link 
              to="/admin/login" 
              className="p-2 text-gray-600 hover:text-blue-600"
              title="Админ панель"
            >
              <FiUser size={20} />
            </Link>

            {/* Кнопка меню (мобильные) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Поиск (мобильные) */}
        <div className="lg:hidden pb-3">
          <SearchBar />
        </div>

        {/* Мобильное меню */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;