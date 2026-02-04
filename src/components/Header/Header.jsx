import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import SearchBar from '../Search/SearchBar';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Не показываем Header на админских страницах
  if (isAdminPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 backdrop-blur-md bg-opacity-95">
      {/* Эффект свечения снизу */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Верхняя панель */}
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div className="relative">
            <Link to="/" className="flex items-baseline">
              <span className="text-2xl font-black text-gray-300">19</span>
              <div className="relative">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">9</span>
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              </div>
              <span className="text-2xl font-black text-gray-300">7</span>
            </Link>
            <div className="text-xs font-medium text-gray-400 tracking-widest text-center -mt-1">STORE</div>
          </div>

          {/* Поисковая строка - ТОЛЬКО НА ПК */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <SearchBar />
          </div>

          {/* Пустое пространство справа для баланса */}
          <div className="w-10 md:hidden"></div>
        </div>

        {/* Поисковая строка на мобилках */}
        <div className="md:hidden pb-3 px-2">
          <SearchBar />
        </div>
      </div>
    </header>
  );
};

export default Header;