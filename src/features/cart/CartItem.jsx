import { Link } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { LazyLoadImage } from 'react-lazy-load-image-component';

function CartItem({ item, onRemove, onUpdateQuantity }) {
  const handleQuantityChange = (change) => {
    const newQuantity = item.quantity + change;
    if (newQuantity >= 1) {
      onUpdateQuantity(newQuantity);
    }
  };

  return (
    <div className="bg-white rounded-xl card-shadow p-4">
      <div className="flex gap-4">
        {/* Изображение */}
        <Link to={`/product/${item.id}`} className="flex-shrink-0">
          <div className="w-24 h-24 rounded-lg overflow-hidden">
            <LazyLoadImage
              src={item.images?.[0]}
              alt={item.title}
              effect="blur"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        {/* Информация */}
        <div className="flex-1 min-w-0">
          <Link to={`/product/${item.id}`}>
            <h3 className="font-medium line-clamp-2 hover:text-blue-600 mb-2">
              {item.title}
            </h3>
          </Link>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-blue-600">
              {item.price.toLocaleString()} ₽
            </span>
            <button
              onClick={onRemove}
              className="p-2 text-red-500 hover:text-red-600"
              aria-label="Удалить"
            >
              <FaTrash />
            </button>
          </div>

          {/* Управление количеством */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                disabled={item.quantity <= 1}
                aria-label="Уменьшить количество"
              >
                <FaMinus className="text-sm" />
              </button>
              <span className="w-8 text-center font-bold">{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-50"
                aria-label="Увеличить количество"
              >
                <FaPlus className="text-sm" />
              </button>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">Сумма:</div>
              <div className="font-bold">
                {(item.price * item.quantity).toLocaleString()} ₽
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItem;