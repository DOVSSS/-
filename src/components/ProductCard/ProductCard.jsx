import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import { useFavoritesStore, useCartStore } from '../../store/store';
import { cloudinaryService } from '../../services/cloudinary/cloudinaryService';

function ProductCard({ product }) {
  // Используем исправленные методы из хранилища
  const isFavorite = useFavoritesStore((state) => state.isFavorite(product.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const addToCart = useCartStore((state) => state.addToCart);

  // Локальный fallback для изображений (без внешних запросов)
  const getFallbackImage = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGMEYyRjQiLz48cGF0aCBkPSJNMTUwIDk1QzEyMS41NjEgOTUgOTggMTE4LjU2MSA5OCAxNDdDOTggMTc1LjQzOSAxMjEuNTYxIDE5OSAxNTAgMTk5QzE3OC40MzkgMTk5IDIwMiAxNzUuNDM5IDIwMiAxNDdDMjAyIDExOC41NjEgMTc4LjQzOSA5NSAxNTAgOTVaIiBmaWxsPSIjRDhEQURCIi8+PHBhdGggZD0iTTU1IDIxMEwyNDUgMjEwTDIyMiAyNTZMNzggMjU2TDU1IDIxMFoiIGZpbGw9IiNEOERBREIiLz48L3N2Zz4=';
  };

  // Получаем оптимизированное изображение
  const getProductImage = () => {
    if (!product.images || product.images.length === 0) {
      return getFallbackImage();
    }
    
    const firstImage = product.images[0];
    
    // Проверяем, не является ли это blob URL
    if (typeof firstImage === 'string' && firstImage.startsWith('blob:')) {
      console.warn('Blob URL detected, using fallback');
      return getFallbackImage();
    }
    
    if (typeof firstImage === 'string' && firstImage.includes('cloudinary.com')) {
      try {
        return cloudinaryService.getOptimizedUrl(firstImage, { 
          width: 900, 
          height: 900 
        });
      } catch (error) {
        console.error('Cloudinary error:', error);
        return getFallbackImage();
      }
    }
    
    if (typeof firstImage === 'string') {
      return firstImage;
    }
    
    return getFallbackImage();
  };

  const imageUrl = getProductImage();

  // Проверяем, новый ли товар (менее 7 дней)
  const checkIfNew = () => {
    if (!product.createdAt) return false;
    
    try {
      let createdDate;
      if (product.createdAt.toDate) {
        createdDate = product.createdAt.toDate();
      } else if (typeof product.createdAt === 'string') {
        createdDate = new Date(product.createdAt);
      } else if (product.createdAt.seconds) {
        createdDate = new Date(product.createdAt.seconds * 1000);
      } else {
        return false;
      }
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      return createdDate > sevenDaysAgo;
    } catch (error) {
      console.error('Error checking if product is new:', error);
      return false;
    }
  };

  const isNew = checkIfNew();

  // Обработчик ошибок изображения
  const handleImageError = (e) => {
    e.target.src = getFallbackImage();
    e.target.onerror = null; // Предотвращаем бесконечный цикл
  };

  // Обработчик добавления в корзину
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Adding to cart:', {
      id: product.id,
      title: product.title,
      price: product.price,
      images: product.images
    });
    
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      images: product.images || [],
      quantity: 1
    });
  };

  // Обработчик избранного
  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Toggle favorite for product:', product.id);
    toggleFavorite(product.id);
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="relative flex-grow">
        <Link to={`/product/${product.id}`} className="block">
          <div className="relative pt-[120%] overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt={product.title || 'Товар'}
              className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={handleImageError}
              crossOrigin="anonymous"
            />
            
            {/* Бейдж новинки в левом верхнем углу */}
            {isNew && (
              <div className="absolute top-1 left-1 bg-green-500 text-white text-xs font-semibold px-1 py-0.5 rounded z-10">
                NEW
              </div>
            )}
            
            {/* Бейдж скидки в левом верхнем углу (под новинкой) */}
            {product.originalPrice && product.originalPrice > product.price && (
              <div className={`absolute bg-red-500 text-white text-xs font-semibold px-1 py-0.5 rounded z-10 ${
                isNew ? 'top-7 left-1' : 'top-1 left-1'
              }`}>
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </div>
            )}
            
            {/* Иконка избранного в правом верхнем углу */}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-1 right-1 z-10"
              aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
              title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
            >
              <div className="p-1 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                {isFavorite ? (
                  <FaHeart className="text-red-500 text-xs" />
                ) : (
                  <FaRegHeart className="text-gray-600 text-xs" />
                )}
              </div>
            </button>
          </div>
        </Link>
      </div>
      
      <div className="p-1.5">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-xs line-clamp-2 h-8 mb-0.5 hover:text-blue-600 transition-colors">
            {product.title || 'Без названия'}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-sm text-blue-600">
              {product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Цена не указана'}
            </span>
          </div>
          
          {/* Кнопка добавления в корзину */}
          <button
            onClick={handleAddToCart}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Добавить в корзину"
            title="Добавить в корзину"
          >
            <FaShoppingCart className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;