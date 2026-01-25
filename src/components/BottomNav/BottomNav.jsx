import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaShoppingCart, FaHeart, FaUser, FaUserShield } from 'react-icons/fa';
import { useCartStore } from '../../store/store';
import { useFavoritesStore } from '../../store/store';
import { useAuthStore } from '../../store/store';

function BottomNav() {
  const location = useLocation();
  
  // Используем функции вместо свойств
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const getFavorites = useFavoritesStore((state) => state.getFavorites);
  
  // Вызываем функции для получения актуальных значений
  const totalItems = getTotalItems ? getTotalItems() : 0;
  const favorites = getFavorites ? getFavorites() : [];
  const favoriteCount = favorites.length;
  
  const { isAdmin, user } = useAuthStore();
  
  const navItems = [
    { 
      path: '/', 
      icon: <FaHome />, 
      label: 'Главная',
      active: location.pathname === '/'
    },
    { 
      path: '/favorites', 
      icon: (
        <div className="relative">
          <FaHeart />
          {favoriteCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {favoriteCount > 99 ? '99+' : favoriteCount}
            </span>
          )}
        </div>
      ), 
      label: 'Избранное',
      active: location.pathname === '/favorites'
    },
    { 
      path: '/cart', 
      icon: (
        <div className="relative">
          <FaShoppingCart />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </div>
      ), 
      label: 'Корзина',
      active: location.pathname === '/cart'
    },
    { 
      path: user ? '/profile' : '/login',
      icon: isAdmin ? <FaUserShield className={location.pathname === '/profile' ? "text-blue-600" : ""} /> : <FaUser />,
      label: user ? (isAdmin ? 'Админ' : 'Профиль') : 'Войти',
      active: location.pathname === '/profile' || location.pathname === '/login'
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
      <div className="flex justify-around py-3">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center p-2 flex-1 max-w-[80px] ${
              item.active
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            <div className="text-xl relative">
              {item.icon}
            </div>
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;