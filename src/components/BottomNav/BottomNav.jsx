import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaShoppingCart, FaHeart, FaUser, FaUserShield } from 'react-icons/fa';
import { useCartStore } from '../../store/store';
import { useFavoritesStore } from '../../store/store';
import { useAuthStore } from '../../store/store';
import { useState, useEffect } from 'react';

function BottomNav() {
  const location = useLocation();
  
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const getFavorites = useFavoritesStore((state) => state.getFavorites);
  
  const totalItems = getTotalItems ? getTotalItems() : 0;
  const favorites = getFavorites ? getFavorites() : [];
  const favoriteCount = favorites.length;
  
  const { isAdmin, user } = useAuthStore();
  
  // Состояния для авто-скрытия
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [timeoutId, setTimeoutId] = useState(null);

  // Функция для показа BottomNav
  const showNav = () => {
    setIsVisible(true);
    resetTimer();
  };

  // Сброс таймера бездействия
  const resetTimer = () => {
    if (timeoutId) clearTimeout(timeoutId);
    
    const id = setTimeout(() => {
      setIsVisible(false);
    }, 4000); // 3 секунды бездействия
    
    setTimeoutId(id);
  };

  // Обработчик скролла
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    
    // Если скроллим вниз больше чем на 5px
    if (currentScrollY > lastScrollY && currentScrollY > 20) {
      setIsVisible(false);
    } 
    // Если скроллим вверх
    else if (currentScrollY < lastScrollY) {
      setIsVisible(true);
      resetTimer();
    }
    
    setLastScrollY(currentScrollY);
  };

  // Обработчик движения мыши
  const handleMouseMove = () => {
    // Показываем нав при движении мыши в нижней части экрана
    if (window.innerHeight - window.scrollY - 100 < window.innerHeight / 3) {
      setIsVisible(true);
      resetTimer();
    }
  };

  // Обработчик касания на мобильных
  const handleTouch = () => {
    setIsVisible(true);
    resetTimer();
  };

  // Устанавливаем слушатели событий
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouch);
    
    // Запускаем таймер при монтировании
    resetTimer();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouch);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [lastScrollY]);

  // Сбрасываем таймер при изменении пути
  useEffect(() => {
    setIsVisible(true);
    resetTimer();
  }, [location.pathname]);

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
    <>
      {/* Небольшая невидимая область внизу для активации при скролле */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-2 z-40"
        onMouseEnter={() => {
          setIsVisible(true);
          resetTimer();
        }}
      />
      
      <nav 
        className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700/50 z-50 safe-bottom backdrop-blur-lg bg-opacity-95 transition-all duration-300 ${
          isVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-full opacity-0'
        }`}
      >
        {/* Эффект свечения сверху */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
        
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                setIsVisible(true);
                resetTimer();
              }}
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
    </>
  );
}

export default BottomNav;