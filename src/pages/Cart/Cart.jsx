import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingBag, FaArrowLeft } from 'react-icons/fa';
import CartItem from '../../features/cart/CartItem';
import { useCartStore, useAuthStore } from '../../store/store';
import { createOrder } from '../../services/firebase/orderService';
import OrderForm from './components/OrderForm';

function Cart() {
  const navigate = useNavigate();
  
  // Используем функции вместо геттеров
  const getItems = useCartStore((state) => state.getItems);
  const getTotal = useCartStore((state) => state.getTotal);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  
  // Вызываем функции для получения данных
  const items = getItems();
  const total = getTotal();
  const totalItems = getTotalItems();
  
  // Для отладки
  const currentUserId = useCartStore((state) => state.currentUserId);
  
  const { user, userData } = useAuthStore();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false); // ← ОБЪЯВЛЕНО ЗДЕСЬ
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // Отладка
  useEffect(() => {
    console.log('🔄 Cart компонент обновлен');
    console.log('👤 Текущий пользователь:', currentUserId);
    console.log('📦 items:', items);
    console.log('💰 total:', total);
    console.log('🔢 totalItems:', totalItems);
    
    // Проверка всех корзин пользователей
    if (window.debugUserCarts) {
      window.debugUserCarts();
    }
  }, [items, total, totalItems, currentUserId]);

  const handleSubmitOrder = async (formData) => {
    try {
      setLoading(true);

      if (!user) {
        navigate('/login');
        return;
      }

      const orderData = {
        customer: {
          name: formData.name,
          phone: formData.phone,
          email: user.email,
          address: formData.address,
          uid: user.uid
        },
        items: items.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          images: item.images || []
        })),
        total: total,
        comment: formData.comment || '',
        status: 'pending',
        paymentMethod: formData.paymentMethod || 'cash'
      };

      const newOrder = await createOrder(orderData, user.uid);
      setOrderNumber(newOrder.orderNumber);
      
      // Очищаем корзину ТЕКУЩЕГО пользователя
      clearCart();
      
      setOrderComplete(true); // ← ИСПОЛЬЗУЕТСЯ ЗДЕСЬ
      setShowOrderForm(false);
      
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setOrderComplete(false);
    navigate('/');
  };

  // Если корзина пуста и не показываем успешное оформление
  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaShoppingBag className="text-gray-400 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Корзина пуста</h2>
          <p className="text-gray-600 mb-8">
            Добавьте товары из каталога
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Перейти к покупкам
          </button>
        </div>
      </div>
    );
  }

  // Экран успешного оформления заказа
  if (orderComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-green-600 text-4xl">✓</div>
          </div>
          <h2 className="text-2xl font-bold mb-3">Заказ оформлен!</h2>
          <p className="text-gray-600 mb-4">
            Номер вашего заказа: <span className="font-mono font-bold">{orderNumber}</span>
          </p>
          <p className="text-gray-500 mb-6">
            С вами свяжется менеджер для подтверждения заказа
          </p>
          <div className="space-y-3">
            <button
              onClick={handleCloseSuccess}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Вернуться на главную
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Продолжить покупки
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Кнопка отладки */}
      
      
      {/* Шапка */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2"
            aria-label="Назад"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold">Корзина ({totalItems})</h1>
          <button
            onClick={clearCart}
            className="p-2 text-red-500 hover:text-red-600"
            aria-label="Очистить корзину"
            disabled={items.length === 0}
          >
            <FaTrash />
          </button>
        </div>
      </div>

      {/* Список товаров */}
      <div className="p-4 space-y-4">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onRemove={() => removeFromCart(item.id)}
            onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
          />
        ))}
      </div>

      {/* Итого и кнопка заказа */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t p-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg">Итого:</span>
          <span className="text-2xl font-bold text-blue-600">
            {total.toLocaleString('ru-RU')} ₽
          </span>
        </div>
        
        <button
          onClick={() => setShowOrderForm(true)}
          className="w-full bg-blue-600 text-white py-4 text-lg rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={items.length === 0 || loading}
        >
          {loading ? 'Оформление...' : 'Оформить заказ'}
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          Нажимая кнопку, вы соглашаетесь с условиями покупки
        </p>
      </div>

      {/* Отступ для фиксированной панели */}
      <div className="h-32"></div>

      {/* Форма оформления заказа */}
      {showOrderForm && (
        <OrderForm
          onClose={() => setShowOrderForm(false)}
          onSubmit={handleSubmitOrder}
          loading={loading}
          userData={userData}
        />
      )}
    </div>
  );
}

export default Cart;

