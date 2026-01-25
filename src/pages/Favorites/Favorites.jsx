import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaArrowLeft } from 'react-icons/fa';
import ProductCard from '../../components/ProductCard/ProductCard';
import { useFavoritesStore } from '../../store/store';
import { productService } from '../../services/firebase/productService';

function Favorites() {
  const navigate = useNavigate();
  
  // Используем исправленный метод getFavorites
  const getFavorites = useFavoritesStore((state) => state.getFavorites);
  const favorites = getFavorites();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Favorites: favorites изменились', favorites);
    loadFavoriteProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(favorites)]); // Используем JSON.stringify для сравнения массива

  const loadFavoriteProducts = async () => {
    if (!favorites || favorites.length === 0) {
      console.log('Favorites: нет избранных товаров');
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Загрузка избранных товаров:', favorites.length, 'товаров');
      console.log('ID товаров:', favorites);
      
      // Загружаем все товары (можно оптимизировать, загружая только нужные)
      const allProducts = await productService.getAllProducts();
      console.log('Всего товаров в базе:', allProducts.length);
      
      // Фильтруем товары по ID из избранного
      const favoriteProducts = allProducts.filter(product =>
        favorites.includes(product.id)
      );
      
      console.log('Найдено товаров в избранном:', favoriteProducts.length);
      setProducts(favoriteProducts);
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Проверяем favorites (это массив ID товаров)
  const hasFavorites = favorites && Array.isArray(favorites) && favorites.length > 0;
  
  if (!hasFavorites) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaHeart className="text-gray-400 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Нет избранных товаров</h2>
          <p className="text-gray-600 mb-8">
            Добавляйте товары в избранное, чтобы вернуться к ним позже
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Начать покупки
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Назад"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold">Избранное</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Сетка товаров */}
      <div className="p-4">
        <div className="mb-4 text-sm text-gray-600">
          {products.length} товар{products.length % 10 === 1 && products.length % 100 !== 11 ? '' : 
           products.length % 10 >= 2 && products.length % 10 <= 4 && (products.length % 100 < 10 || products.length % 100 >= 20) ? 'а' : 'ов'}
        </div>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHeart className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-500 mb-4">Товары не найдены</p>
            <p className="text-gray-400 text-sm mb-6">
              Возможно, товары были удалены из магазина
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Вернуться в магазин
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;