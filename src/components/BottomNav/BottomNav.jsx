import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaShoppingCart, FaHeart, FaUser, FaUserShield } from 'react-icons/fa';
import { useCartStore } from '../../store/store';
import { useFavoritesStore } from '../../store/store';
import { useAuthStore } from '../../store/store';

function BottomNav() {
  const location = useLocation();
  
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const getFavorites = useFavoritesStore((state) => state.getFavorites);
  
  const totalItems = getTotalItems ? getTotalItems() : 0;
  const favorites = getFavorites ? getFavorites() : [];
  const favoriteCount = favorites.length;
  
  const { isAdmin, user } = useAuthStore();
  
  // Определяем путь для кнопки профиля/админки
  const getProfilePath = () => {
    if (!user) return '/login';
    if (isAdmin) return '/admin/dashboard';
    return '/profile';
  };
  
  // Определяем активность кнопки
  const isProfileActive = () => {
    if (isAdmin) {
      return location.pathname.includes('/admin/dashboard');
    }
    return location.pathname === '/profile';
  };
  
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
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center border border-white/80 shadow">
              {favoriteCount > 9 ? '9+' : favoriteCount}
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
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center border border-white/80 shadow">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </div>
      ), 
      label: 'Корзина',
      active: location.pathname === '/cart'
    },
    { 
      path: getProfilePath(),
      icon: isAdmin ? <FaUserShield /> : <FaUser />,
      label: user ? (isAdmin ? 'Админ' : 'Профиль') : 'Войти',
      active: isProfileActive()
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700/50 z-50 safe-bottom backdrop-blur-lg bg-opacity-95">
      {/* Эффект свечения сверху */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
      
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center p-2 flex-1 max-w-[80px] transition-all duration-300 relative ${
              item.active
                ? 'text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {/* Активный индикатор */}
            {item.active && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-b-full"></div>
            )}
            
            {/* Эффект свечения при наведении */}
            <div className={`p-2 rounded-xl transition-all duration-300 ${
              item.active 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 shadow-lg' 
                : 'hover:bg-gray-800/50'
            }`}>
              <div className="text-lg relative">
                {item.icon}
              </div>
            </div>
            
            <span className={`text-xs mt-1 font-medium transition-all duration-300 ${
              item.active ? 'font-semibold' : 'font-normal'
            }`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;