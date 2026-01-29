import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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
    <header className="sticky top-0 z-50 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 backdrop-blur-md bg-opacity-95">
      {/* Эффект свечения снизу */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Верхняя панель */}
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div className="relative">
            <div className="flex items-baseline">
              <span className="text-2xl font-black text-gray-300">19</span>
              <div className="relative">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">9</span>
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              </div>
              <span className="text-2xl font-black text-gray-300">7</span>
            </div>
            <div className="text-xs font-medium text-gray-400 tracking-widest text-center -mt-1">STORE</div>
          </div>

          {/* Поиск (десктоп) */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Навигация */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={`relative text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  )}
                </a>
              );
            })}
          </div>

          {/* Счетчик корзины */}
          {cartCount > 0 && (
            <div className="relative">
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-gray-700/30 shadow-lg">
                {cartCount > 99 ? '99+' : cartCount}
              </div>
            </div>
          )}
        </div>

       
        {/* Мобильная навигация */}
        <div className="lg:hidden border-t border-gray-700/30 pt-3 pb-2">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-medium px-3 py-1 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gray-800/50 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text border border-gray-700/50'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;