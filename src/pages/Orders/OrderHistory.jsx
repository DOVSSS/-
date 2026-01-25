// src/pages/Orders/OrderHistory.jsx
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/store';
import { getUserOrders } from '../../services/firebase/orderService';
import { FaBox, FaClock, FaCheckCircle, FaTruck, FaHistory } from 'react-icons/fa';

function OrderHistory() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const userOrders = await getUserOrders(user.uid);
      setOrders(userOrders);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'processing': return <FaBox className="text-blue-500" />;
      case 'shipped': return <FaTruck className="text-purple-500" />;
      case 'delivered': return <FaCheckCircle className="text-green-500" />;
      case 'cancelled': return <FaHistory className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает обработки';
      case 'processing': return 'В обработке';
      case 'shipped': return 'Отправлен';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Войдите в аккаунт</h2>
          <p className="text-gray-600">Чтобы просмотреть историю заказов</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <FaHistory className="mr-3" /> История заказов
        </h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <FaBox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Заказов пока нет</h2>
            <p className="text-gray-600">Сделайте свой первый заказ!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold">Заказ #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt?.toDate()).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className="ml-2 text-sm">{getStatusText(order.status)}</span>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Товары:</h4>
                      <ul className="mt-2 space-y-1">
                        {order.items.slice(0, 3).map((item, index) => (
                          <li key={index} className="text-sm">
                            {item.title} × {item.quantity}
                          </li>
                        ))}
                        {order.items.length > 3 && (
                          <li className="text-sm text-gray-500">
                            и еще {order.items.length - 3} товаров
                          </li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Сумма:</h4>
                      <p className="mt-2 text-lg font-bold">{order.total.toLocaleString('ru-RU')} ₽</p>
                      {order.comment && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium text-gray-500">Комментарий:</h4>
                          <p className="text-sm">{order.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;