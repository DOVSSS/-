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
         <div className="relative">
  <div className="flex items-baseline">
    <span className="text-2xl font-black text-gray-900">19</span>
    <div className="relative">
      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">9</span>
      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
    </div>
    <span className="text-2xl font-black text-gray-900">7</span>
  </div>
  <div className="text-xs font-medium text-gray-500 tracking-widest text-center -mt-1">STORE</div>
</div>

          {/* Поиск (десктоп) */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Иконки действий */}
          <div className="flex items-center gap-4">
           
            
          
            
           

           
          </div>
        </div>

        {/* Поиск (мобильные) */}
        

        {/* Мобильное меню */}
       
      </div>
    </header>
  );
};

export default Header;