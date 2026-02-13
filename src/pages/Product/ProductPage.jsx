import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaShareAlt, FaArrowLeft } from 'react-icons/fa';
import { useCartStore, useFavoritesStore } from '../../store/store';
import { productService } from '../../services/firebase/productService';
import Loader from '../../components/Loader/Loader';

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0); // НОВОЕ: индекс выбранного изображения

  const addToCart = useCartStore((state) => state.addToCart);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await productService.getProductById(id);
      setProduct(data);
    } catch (error) {
      console.error('Ошибка загрузки товара:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      const productWithQuantity = { 
        id: product.id,
        title: product.title,
        price: product.price,
        images: product.images || [],
        quantity: quantity
      };
      addToCart(productWithQuantity);
      alert(`Добавлено ${quantity} шт. в корзину!`);
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Ошибка шаринга:', error);
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Товар не найден</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const images = product.images || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Кнопка назад */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-20 bg-gray-900/80 backdrop-blur-md p-3 rounded-full border border-gray-700/50 hover:border-gray-600/70 transition-all shadow-lg"
        aria-label="Назад"
      >
        <FaArrowLeft className="text-gray-300" />
      </button>

      {/* Кнопки действий */}
      <div className="fixed top-4 right-4 z-20 flex gap-2">
        <button
          onClick={handleShare}
          className="bg-gray-900/80 backdrop-blur-md p-3 rounded-full border border-gray-700/50 hover:border-gray-600/70 transition-all shadow-lg"
          aria-label="Поделиться"
        >
          <FaShareAlt className="text-gray-300" />
        </button>
        <button
          onClick={() => toggleFavorite(id)}
          className="bg-gray-900/80 backdrop-blur-md p-3 rounded-full border border-gray-700/50 hover:border-gray-600/70 transition-all shadow-lg"
          aria-label="Добавить в избранное"
        >
          <FaHeart
            className={isFavorite ? 'text-red-400' : 'text-gray-300'}
          />
        </button>
      </div>

      {/* ГЛАВНОЕ ИЗОБРАЖЕНИЕ */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-b border-gray-700/50">
        <div className="max-w-2xl mx-auto">
          <div className="relative aspect-square">
            <img
              src={images[selectedImage] || '/placeholder.jpg'}
              alt={product.title}
              className="w-full h-full object-contain p-4"
              onError={(e) => {
                e.target.src = '/placeholder.jpg';
              }}
            />
          </div>
        </div>
      </div>

      {/* МИНИАТЮРЫ других изображений */}
      {images.length > 1 && (
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === index 
                    ? 'border-blue-500 ring-2 ring-blue-500/30' 
                    : 'border-gray-700/50 hover:border-gray-600/70'
                }`}
              >
                <img
                  src={img}
                  alt={`${product.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder.jpg';
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Информация о товаре */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700/50">
          <h1 className="text-xl font-bold text-gray-100 mb-3">{product.title}</h1>
          
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold text-blue-400">
              {product.price?.toLocaleString()} ₽
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Просмотры:</span>
                <span className="font-medium text-gray-300">{product.views || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Продано:</span>
                <span className="font-medium text-gray-300">{product.sales || 0}</span>
              </div>
            </div>
          </div>
          
          {/* Категория и теги */}
          {product.category && (
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm border border-blue-500/30">
                {product.category}
              </span>
            </div>
          )}
          
          <div className="space-y-4">
            {product.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Описание</h3>
                <p className="text-gray-400 whitespace-pre-line text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
            
            {product.specifications && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Характеристики</h3>
                <div className="grid gap-2 bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-gray-700/50 last:border-0">
                      <span className="text-gray-400 text-sm">{key}:</span>
                      <span className="font-medium text-gray-300 text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Выбор количества */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-300">Количество:</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-300 flex items-center justify-center hover:bg-gray-700/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="w-12 text-center font-bold text-gray-100">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-300 flex items-center justify-center hover:bg-gray-700/50 transition"
              >
                +
              </button>
            </div>
          </div>
          {product.stock !== undefined && (
            <p className="text-xs text-gray-400 mt-3">
              Доступно: {product.stock} шт.
            </p>
          )}
        </div>

        {/* Кнопка добавления в корзину */}
        <div className="sticky bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent backdrop-blur-md border-t border-gray-700/50">
          <button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 text-lg rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            <FaShoppingCart />
            Добавить в корзину
            <span className="ml-auto text-white/90">
              {(product.price * quantity).toLocaleString()} ₽
            </span>
          </button>
        </div>
        
        {/* Отступ для BottomNav */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}

export default ProductPage;