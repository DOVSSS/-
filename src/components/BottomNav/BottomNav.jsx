import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaShoppingCart, FaHeart, FaUser, FaUserShield } from 'react-icons/fa';
import { useCartStore } from '../../store/store';
import { useAuthStore } from '../../store/store';

function BottomNav() {
  const location = useLocation();
  const totalItems = useCartStore((state) => state.totalItems); // Изменено: свойство вместо функции
  const { isAdmin, user } = useAuthStore();
  
  const navItems = [
    { path: '/', icon: <FaHome />, label: 'Главная' },
    { path: '/favorites', icon: <FaHeart />, label: 'Избранное' },
    { 
      path: '/cart', 
      icon: (
        <div className="relative">
          <FaShoppingCart />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </div>
      ), 
      label: 'Корзина' 
    },
    { 
      path: user ? '/profile' : '/login',
      icon: isAdmin ? <FaUserShield className="text-blue-600" /> : <FaUser />,
      label: user ? (isAdmin ? 'Админ' : 'Профиль') : 'Войти'
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-3">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center p-2 ${
              location.pathname === item.path
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <div className="text-xl">{item.icon}</div>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;