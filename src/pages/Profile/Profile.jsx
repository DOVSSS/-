import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/store';
import { logoutUser } from '../../services/firebase/authService';
import { getUserOrders } from '../../services/firebase/orderService';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaSignOutAlt, FaBox, FaShoppingCart, FaHistory } from 'react-icons/fa';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
function Profile() {
  const { userData, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData) {
      navigate('/login');
      return;
    }

    loadUserOrders();
  }, [userData, navigate]);

  const loadUserOrders = async () => {
    try {
      // Простой способ без создания индекса
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);
      
      const allOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Фильтруем на клиенте
      const userOrders = allOrders.filter(order => 
        order.customer?.uid === userData.uid || order.userId === userData.uid
      );
      
      // Сортируем
      userOrders.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = async () => {
    try {
      await logoutUser();
      clearAuth();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24">
      <div className="max-w-md mx-auto px-4">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Профиль</h1>
          <p className="text-gray-600">Ваши данные и заказы</p>
        </div>

        {/* Карточка профиля */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* Аватар и имя */}
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <FaUser className="text-2xl text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {userData.displayName || 'Пользователь'}
              </h2>
              <div className="flex items-center mt-1">
                {userData.role === 'admin' && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mr-2">
                    <FaShieldAlt className="mr-1" /> Админ
                  </span>
                )}
                <span className="text-gray-500 text-sm">
                  {userData.role === 'admin' ? 'Администратор' : 'Покупатель'}
                </span>
              </div>
            </div>
          </div>

          {/* Информация */}
          <div className="space-y-4">
            <div className="flex items-center">
              <FaEnvelope className="text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-800">{userData.email}</p>
              </div>
            </div>

            {userData.phone && (
              <div className="flex items-center">
                <FaPhone className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Телефон</p>
                  <p className="text-gray-800">{userData.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* История заказов */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaHistory className="mr-2" /> Мои заказы
            </h3>
            <span className="text-sm text-gray-500">
              {orders.length} заказ(ов)
            </span>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500">Загрузка заказов...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <FaBox className="text-gray-300 text-4xl mx-auto mb-3" />
              <p className="text-gray-500">У вас пока нет заказов</p>
              <button
                onClick={() => navigate('/')}
                className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
              >
                Перейти к покупкам
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">Заказ #{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {order.createdAt?.toDate?.().toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'pending' && 'Ожидание'}
                      {order.status === 'processing' && 'В обработке'}
                      {order.status === 'shipped' && 'Отправлен'}
                      {order.status === 'delivered' && 'Доставлен'}
                      {order.status === 'cancelled' && 'Отменен'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} товар(ов)
                    </p>
                    <p className="font-bold text-blue-600">
                      {order.total?.toLocaleString()} ₽
                    </p>
                  </div>
                </div>
              ))}
              
              {orders.length > 5 && (
                <button
                  onClick={() => {/* Можно сделать страницу всех заказов */}}
                  className="w-full text-center text-blue-600 hover:text-blue-700 font-medium py-2"
                >
                  Показать все заказы ({orders.length})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Быстрые действия */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Быстрые действия</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/cart')}
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50"
            >
              <FaShoppingCart className="text-blue-600 text-xl mb-2" />
              <span className="text-sm font-medium">Корзина</span>
            </button>
            <button
              onClick={() => navigate('/favorites')}
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50"
            >
              <FaBox className="text-red-600 text-xl mb-2" />
              <span className="text-sm font-medium">Избранное</span>
            </button>
          </div>
        </div>

        {/* Выход */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition"
          >
            <FaSignOutAlt className="mr-2" />
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;