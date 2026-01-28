import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaBox, FaPlus, FaSignOutAlt, FaChartBar, FaCog, FaShoppingCart, FaHome } from 'react-icons/fa';
import { auth } from '../../services/firebase/config';
import { useAuthStore } from '../../store/store';

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const clearAuth = useAuthStore((state) => state.clearAuth); // Исправлено на clearAuth
  
  // Определяем активную вкладку из пути
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/add')) return 'add';
    if (path.includes('/stats')) return 'stats';
    if (path.includes('/settings')) return 'settings';
    return 'products';
  };

  const activeTab = getActiveTab();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      clearAuth(); 
      navigate('/login'); // Изменено с /admin/login на /login
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  const menuItems = [
    { id: 'products', label: 'Товары', icon: <FaBox />, path: '/admin/dashboard' },
    { id: 'orders', label: 'Заказы', icon: <FaShoppingCart />, path: '/admin/dashboard/orders' },
    { id: 'add', label: 'Добавить товар', icon: <FaPlus />, path: '/admin/dashboard/add' },
    { id: 'stats', label: 'Статистика', icon: <FaChartBar />, path: '/admin/dashboard/stats' },
    { id: 'settings', label: 'Настройки', icon: <FaCog />, path: '/admin/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar для десктопа */}
      <div className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-white border-r flex flex-col">
        {/* Заголовок */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Админ-панель</h1>
          <p className="text-sm text-gray-600 mt-1">Магазин товаров из Китая</p>
        </div>
        
        {/* Основное меню */}
        <nav className="flex-1 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        
        {/* Нижняя часть - кнопки выхода и на главную */}
        <div className="p-6 border-t space-y-4">
          {/* Кнопка на главную */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 w-full px-4 py-3 rounded-lg transition-colors"
          >
            <FaHome />
            <span>На главную</span>
          </button>
          
          {/* Кнопка выхода */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 w-full px-4 py-3 rounded-lg transition-colors"
          >
            <FaSignOutAlt />
            <span>Выйти</span>
          </button>
        </div>
      </div>

      {/* Мобильная навигация */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around py-3">
          {/* Кнопка на главную в мобильной версии */}
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600"
          >
            <FaHome className="text-xl" />
            <span className="text-xs mt-1">Главная</span>
          </button>
          
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
              className={`flex flex-col items-center p-2 ${
                activeTab === item.id ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <div className="text-xl">{item.icon}</div>
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          ))}
          
          {/* Кнопка выхода в мобильной версии */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center p-2 text-red-600 hover:text-red-700"
          >
            <FaSignOutAlt className="text-xl" />
            <span className="text-xs mt-1">Выход</span>
          </button>
        </div>
      </div>

      {/* Основной контент */}
      <div className="md:ml-64 pb-20 md:pb-0">
        {/* Кнопка "На главную" для мобильной версии вверху */}
        <div className="md:hidden p-4 bg-white border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Админ-панель</h1>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg bg-blue-50"
            >
              <FaHome />
              <span>На главную</span>
            </button>
          </div>
        </div>
        
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;