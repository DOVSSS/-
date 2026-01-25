import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/firebase/orderService';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaCheckCircle, 
  FaTruck, 
  FaBox,
  FaHistory,
  FaTimesCircle,
  FaSortAmountDown,
  FaSortAmountUp,
  
} from 'react-icons/fa';
import { FaRedoAlt as FaRefresh } from 'react-icons/fa';
function AdminOrders() {
  const [orders, setOrders] = useState([]); // Изначально пустой массив
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  const statusOptions = [
    { value: 'all', label: 'Все статусы' },
    { value: 'pending', label: 'Ожидает' },
    { value: 'processing', label: 'В обработке' },
    { value: 'shipped', label: 'Отправлен' },
    { value: 'delivered', label: 'Доставлен' },
    { value: 'cancelled', label: 'Отменен' }
  ];
  
  const statusIcons = {
    pending: <FaHistory className="text-yellow-500" />,
    processing: <FaBox className="text-blue-500" />,
    shipped: <FaTruck className="text-purple-500" />,
    delivered: <FaCheckCircle className="text-green-500" />,
    cancelled: <FaTimesCircle className="text-red-500" />
  };
  
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Загрузка заказов...');
      const result = await getAllOrders(50);
      
      console.log('✅ Результат getAllOrders:', result);
      
      // result - это объект с полями: orders, lastVisible, hasMore
      // Нам нужен только массив orders
      if (result && result.orders && Array.isArray(result.orders)) {
        setOrders(result.orders);
        console.log(`✅ Загружено ${result.orders.length} заказов`);
      } else {
        console.warn('⚠️ Нет заказов или формат данных неверный:', result);
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки заказов:', error);
      setError('Не удалось загрузить заказы');
      setOrders([]); // Устанавливаем пустой массив при ошибке
    } finally {
      setLoading(false);
    }
  };

  // Всегда работаем с массивом orders
  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    // Проверяем, что order существует
    if (!order) return false;
    
    // Фильтр по поиску
    const matchesSearch = 
      (order.orderNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.customer?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.customer?.phone || '').includes(searchQuery) ||
      (order.customer?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    // Фильтр по статусу
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  // Сортировка заказов
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!a || !b) return 0;
    
    if (sortBy === 'newest') {
      const timeA = a.createdAt?.seconds || a.createdAt || 0;
      const timeB = b.createdAt?.seconds || b.createdAt || 0;
      return timeB - timeA;
    } else if (sortBy === 'oldest') {
      const timeA = a.createdAt?.seconds || a.createdAt || 0;
      const timeB = b.createdAt?.seconds || b.createdAt || 0;
      return timeA - timeB;
    } else if (sortBy === 'priceHigh') {
      return (b.total || 0) - (a.total || 0);
    } else if (sortBy === 'priceLow') {
      return (a.total || 0) - (b.total || 0);
    }
    return 0;
  });

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await updateOrderStatus(orderId, newStatus);
      
      // Обновляем локальное состояние
      setOrders(orders.map(order => 
        order && order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date() }
          : order
      ));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      alert('✅ Статус обновлен!');
    } catch (error) {
      console.error('❌ Ошибка обновления статуса:', error);
      alert('❌ Не удалось обновить статус');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Не указано';
    
    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (typeof timestamp === 'object' && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
      
      return new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch (error) {
      console.error('Ошибка форматирования даты:', timestamp, error);
      return 'Ошибка даты';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p>Загрузка заказов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-xl font-bold mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto"
          >
            <FaRefresh className="mr-2" /> Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Управление заказами</h1>
            <p className="text-gray-600">
              Всего заказов: {orders.length} | Показано: {sortedOrders.length}
            </p>
          </div>
          <button
            onClick={loadOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            disabled={loading}
          >
            <FaRefresh className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Поиск */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по номеру, имени, телефону..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Фильтр по статусу */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Статус
              </label>
              <select
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Сортировка */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Сортировка
              </label>
              <select
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
                <option value="priceHigh">Сначала дорогие</option>
                <option value="priceLow">Сначала дешевые</option>
              </select>
            </div>
          </div>
        </div>

        {/* Таблица заказов */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {sortedOrders.length === 0 ? (
            <div className="text-center py-12">
              <FaFilter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {orders.length === 0 ? 'Заказов нет' : 'Заказы не найдены'}
              </h3>
              <p className="text-gray-500">
                {orders.length === 0 
                  ? 'Пока не было оформлено ни одного заказа' 
                  : 'Попробуйте изменить параметры поиска'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Номер заказа
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Клиент
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сумма
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedOrders.map((order) => {
                    if (!order) return null;
                    
                    return (
                      <tr key={order.id || order.orderNumber} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-mono font-medium">
                            {order.orderNumber || 'Без номера'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items?.length || 0} товаров
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{order.customer?.name || 'Не указано'}</div>
                          <div className="text-sm text-gray-500">{order.customer?.phone || 'Нет телефона'}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {order.customer?.email || 'Нет email'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold">
                            {(order.total || 0).toLocaleString('ru-RU')} ₽
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {statusIcons[order.status] || <FaHistory className="text-gray-500" />}
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                              {statusOptions.find(s => s.value === order.status)?.label || order.status || 'Неизвестно'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(order)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <FaEye className="mr-1" /> Подробнее
                            </button>
                            
                            {/* Быстрое изменение статуса */}
                            <select
                              className="border rounded p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={order.status || 'pending'}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                              disabled={updatingStatus}
                            >
                              {statusOptions
                                .filter(opt => opt.value !== 'all')
                                .map(opt => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))
                              }
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Модальное окно с деталями заказа */}
        {showDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Заголовок */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Заказ #{selectedOrder.orderNumber || 'Без номера'}</h2>
                    <p className="text-gray-600">
                      Создан: {formatDate(selectedOrder.createdAt)}
                    </p>
                    {selectedOrder.updatedAt && (
                      <p className="text-gray-600 text-sm">
                        Обновлен: {formatDate(selectedOrder.updatedAt)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Информация о клиенте */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-bold mb-2">Информация о клиенте</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p><strong>Имя:</strong> {selectedOrder.customer?.name || 'Не указано'}</p>
                      <p><strong>Телефон:</strong> {selectedOrder.customer?.phone || 'Не указано'}</p>
                      <p><strong>Email:</strong> {selectedOrder.customer?.email || 'Не указано'}</p>
                      <p><strong>Адрес:</strong> {selectedOrder.customer?.address || 'Не указано'}</p>
                      {selectedOrder.customer?.uid && (
                        <p className="text-sm text-gray-500">
                          User ID: {selectedOrder.customer.uid}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">Информация о заказе</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p><strong>Статус:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedOrder.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusOptions.find(s => s.value === selectedOrder.status)?.label || selectedOrder.status || 'Неизвестно'}
                        </span>
                      </p>
                      <p><strong>Способ оплаты:</strong> {selectedOrder.paymentMethod || 'Наличные'}</p>
                      <p><strong>Общая сумма:</strong> {(selectedOrder.total || 0).toLocaleString('ru-RU')} ₽</p>
                      {selectedOrder.comment && (
                        <div>
                          <strong>Комментарий клиента:</strong>
                          <p className="mt-1 p-2 bg-gray-100 rounded">{selectedOrder.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Товары в заказе */}
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Товары в заказе</h3>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Товар</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Цена</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Количество</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Сумма</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedOrder.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3">
                                <div className="font-medium">{item.title || 'Без названия'}</div>
                                {item.images?.[0] && (
                                  <img 
                                    src={item.images[0]} 
                                    alt={item.title}
                                    className="w-12 h-12 object-cover rounded mt-1"
                                  />
                                )}
                              </td>
                              <td className="px-4 py-3">{(item.price || 0).toLocaleString('ru-RU')} ₽</td>
                              <td className="px-4 py-3">{item.quantity || 1}</td>
                              <td className="px-4 py-3 font-medium">
                                {((item.price || 0) * (item.quantity || 1)).toLocaleString('ru-RU')} ₽
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-100">
                          <tr>
                            <td colSpan="3" className="px-4 py-3 text-right font-bold">
                              Итого:
                            </td>
                            <td className="px-4 py-3 font-bold">
                              {(selectedOrder.total || 0).toLocaleString('ru-RU')} ₽
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-gray-500">Нет информации о товарах</p>
                    </div>
                  )}
                </div>

                {/* Управление статусом */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold mb-2">Изменить статус</h3>
                    <select
                      className="border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={selectedOrder.status || 'pending'}
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      disabled={updatingStatus}
                    >
                      {statusOptions
                        .filter(opt => opt.value !== 'all')
                        .map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  
                  <div className="space-x-2">
                    <button
                      onClick={() => setShowDetails(false)}
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Закрыть
                    </button>
                    <button
                      onClick={loadOrders}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Обновить список
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;