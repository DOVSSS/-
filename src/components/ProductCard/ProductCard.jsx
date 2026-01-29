import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useFavoritesStore } from '../../store/store';
import { cloudinaryService } from '../../services/cloudinary/cloudinaryService';

function ProductCard({ product }) {
  const isFavorite = useFavoritesStore((state) => state.isFavorite(product.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  // Локальный fallback для изображений
  const getFallbackImage = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxRDFFMUUiLz48cGF0aCBkPSJNMTUwIDk1QzEyMS41NjEgOTUgOTggMTE4LjU2MSA5OCAxNDdDOTggMTc1LjQzOSAxMjEuNTYxIDE5OSAxNTAgMTk5QzE3OC40MzkgMTk5IDIwMiAxNzUuNDM5IDIwMiAxNDdDMjAyIDExOC41NjEgMTc4LjQzOSA5NSAxNTAgOTVaIiBmaWxsPSIjMzAzMDMwIi8+PHBhdGggZD0iTTU1IDIxMEwyNDUgMjEwTDIyMiAyNTZMNzggMjU2TDU1IDIxMFoiIGZpbGw9IiMzMDMwMzAiLz48L3N2Zz4=';
  };

  // Получаем оптимизированное изображение
  const getProductImage = () => {
    if (!product.images || product.images.length === 0) {
      return getFallbackImage();
    }
    
    const firstImage = product.images[0];
    
    if (typeof firstImage === 'string' && firstImage.startsWith('blob:')) {
      return getFallbackImage();
    }
    
    if (typeof firstImage === 'string' && firstImage.includes('cloudinary.com')) {
      try {
        return cloudinaryService.getOptimizedUrl(firstImage, { 
          width: 1400, 
          height: 1400,
          quality: 'auto:best',
          crop: 'fill'
        });
      } catch (error) {
        return getFallbackImage();
      }
    }
    
    if (typeof firstImage === 'string') {
      return firstImage;
    }
    
    return getFallbackImage();
  };

  const imageUrl = getProductImage();

  // Проверяем, новый ли товар
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
      return false;
    }
  };

  const isNew = checkIfNew();

  // Обработчик ошибок изображения
  const handleImageError = (e) => {
    e.target.src = getFallbackImage();
    e.target.onerror = null;
  };

  // Обработчик избранного
  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  // Проверяем наличие скидки
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden flex flex-col h-full shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-700/30">
      {/* Упрощенный эффект свечения */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />
      
      <div className="relative flex-grow">
        <Link to={`/product/${product.id}`} className="block h-full">
          <div className="relative pt-[140%] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
            {/* Уменьшенный оверлей на изображении */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-gray-900/0 to-transparent z-10 pointer-events-none opacity-80" />
            
            <img
              src={imageUrl}
              alt={product.title || 'Товар'}
              className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              onError={handleImageError}
              crossOrigin="anonymous"
            />
            
            {/* Бейдж новинки - компактный */}
            {isNew && (
              <div className="absolute top-2 left-2 z-20">
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                  NEW
                </div>
              </div>
            )}
            
            {/* Бейдж скидки - компактный */}
            {hasDiscount && (
              <div className={`absolute z-20 ${
                isNew ? 'top-9 left-2' : 'top-2 left-2'
              }`}>
                <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                  -{discountPercentage}%
                </div>
              </div>
            )}
            
            {/* Иконка избранного - более компактная */}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-2 right-2 z-20 transition-transform duration-300 hover:scale-110 active:scale-95"
              aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
              title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
            >
              <div className="p-2 bg-gray-900/80 backdrop-blur-sm rounded-full border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300">
                {isFavorite ? (
                  <FaHeart className="text-red-400 text-sm" />
                ) : (
                  <FaRegHeart className="text-gray-300 text-sm hover:text-red-300 transition-colors" />
                )}
              </div>
            </button>
          </div>
        </Link>
      </div>
      
      {/* Контент карточки - одна строка */}
      <div className="p-3 bg-gradient-to-t from-gray-900/95 via-gray-900/90 to-gray-900/80 border-t border-gray-700/30">
        <div className="flex items-center justify-between gap-2">
          {/* Название товара - с градиентным текстом */}
          <Link to={`/product/${product.id}`} className="flex-grow min-w-0">
            <h3 className="text-base font-medium truncate bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-500 hover:to-purple-500 transition-all duration-300">
              {product.title || 'Без названия'}
            </h3>
          </Link>
          
          {/* Цена - с градиентным текстом */}
          <div className="flex-shrink-0">
            {hasDiscount ? (
              <div className="flex flex-col items-end">
                <span className="font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : '— ₽'}
                </span>
                <span className="text-[10px] text-gray-400 line-through mt-0.5">
                  {product.originalPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            ) : (
              <span className="font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Цена не указана'}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Минимальная подсветка при наведении */}
      <div className="absolute -inset-px rounded-2xl border border-transparent group-hover:border-blue-500/10 transition-colors duration-300 pointer-events-none" />
    </div>
  );
}

export default ProductCard;