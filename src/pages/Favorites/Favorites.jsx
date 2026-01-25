import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import ProductCard from '../../components/ProductCard/ProductCard';
import { useFavoritesStore } from '../../store/store';
import { productService } from '../../services/firebase/productService';

function Favorites() {
  const navigate = useNavigate();
  const favorites = useFavoritesStore((state) => state.favorites);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoriteProducts();
  }, [favorites]);

  const loadFavoriteProducts = async () => {
    try {
      const allProducts = await productService.getAllProducts();
      const favoriteProducts = allProducts.filter(product =>
        favorites.includes(product.id)
      );
      setProducts(favoriteProducts);
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
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

  if (favorites.length === 0) {
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
            className="btn-primary"
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
            className="p-2"
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
          {products.length} товар{products.length % 10 === 1 ? '' : products.length % 10 >= 2 && products.length % 10 <= 4 ? 'а' : 'ов'}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Favorites;