import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaShareAlt, FaArrowLeft } from 'react-icons/fa';
import ImageSlider from '../../components/ImageSlider/ImageSlider';
import { useCartStore, useFavoritesStore } from '../../store/store';
import { productService } from '../../services/firebase/productService';
import Loader from '../../components/Loader/Loader';

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

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
      quantity: quantity // Используем выбранное количество
    };
    console.log('Adding to cart from product page:', productWithQuantity);
    addToCart(productWithQuantity);
    
    // Можно добавить уведомление
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Товар не найден</h2>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Кнопка назад */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Назад"
      >
        <FaArrowLeft className="text-gray-700" />
      </button>

      {/* Кнопки действий */}
      <div className="fixed top-4 right-4 z-20 flex gap-2">
        <button
          onClick={handleShare}
          className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Поделиться"
        >
          <FaShareAlt className="text-gray-700" />
        </button>
        <button
          onClick={() => toggleFavorite(id)}
          className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Добавить в избранное"
        >
          <FaHeart
            className={isFavorite ? 'text-red-500' : 'text-gray-700'}
          />
        </button>
      </div>

      {/* Слайдер изображений */}
      <div className="bg-white">
        <ImageSlider images={product.images} productName={product.title} />
      </div>

      {/* Информация о товаре */}
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 card-shadow">
          <h1 className="text-xl font-bold mb-2">{product.title}</h1>
          <div className="text-2xl font-bold text-blue-600 mb-4">
            {product.price.toLocaleString()} ₽
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Просмотры:</span>
              <span className="font-medium">{product.views || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Продано:</span>
              <span className="font-medium">{product.sales || 0}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold mb-2">Описание</h3>
              <p className="text-gray-600 whitespace-pre-line">
                {product.description}
              </p>
            </div>
            
            {product.specifications && (
              <div>
                <h3 className="font-semibold mb-2">Характеристики</h3>
                <div className="grid gap-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1 border-b">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Выбор количества */}
        <div className="bg-white rounded-xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Количество:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-50"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Кнопка добавления в корзину */}
        <div className="sticky bottom-16 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t">
          <button
            onClick={handleAddToCart}
            className="w-full btn-primary flex items-center justify-center gap-3 py-4 text-lg"
          >
            <FaShoppingCart />
            Добавить в корзину
            <span className="ml-auto">
              {(product.price * quantity).toLocaleString()} ₽
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;