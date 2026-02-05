import React, { useState, useEffect } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import OrderForm from '../../pages/Cart/components/OrderForm'; // ИМПОРТИРУЙТЕ ВАШ КОМПОНЕНТ
import { getProductById, getProducts } from '../../services/firebase/productService';
import Loader from '../Loader/Loader';
import { useAuthStore } from '../../store/store'; // ДЛЯ ПОЛУЧЕНИЯ ДАННЫХ ПОЛЬЗОВАТЕЛЯ

const SearchResults = ({ productId, searchQuery, searchResults, products, activeCategory, onClose, onProductSelect }) => {
  const [mainProduct, setMainProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState('default');
  const [showOrderForm, setShowOrderForm] = useState(false); // НОВОЕ: состояние для формы
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false); // НОВОЕ: состояние загрузки заказа

  const { userData } = useAuthStore(); // ПОЛУЧАЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ

  useEffect(() => {
    determineDisplayMode();
  }, [productId, searchQuery, searchResults, products]);

  useEffect(() => {
    if (displayMode === 'default' && products) {
      // Используем переданные товары
      setAllProducts(products);
      setMainProduct(null);
      setSimilarProducts(products);
    } else if (displayMode === 'search' && searchResults) {
      loadSearchResults();
    } else if (displayMode === 'product' && productId) {
      loadProductWithSimilar();
    }
  }, [displayMode, productId, searchResults, products]);

  const determineDisplayMode = () => {
    if (productId) {
      setDisplayMode('product');
    } else if (searchQuery || (searchResults && searchResults.length > 0)) {
      setDisplayMode('search');
    } else {
      setDisplayMode('default');
    }
  };

  const loadSearchResults = () => {
    if (!searchResults || searchResults.length === 0) {
      setMainProduct(null);
      setSimilarProducts([]);
      return;
    }

    // Первый товар - как основной
    const [firstProduct, ...rest] = searchResults;
    setMainProduct(firstProduct);
    setSimilarProducts(rest);
    setAllProducts(searchResults);
  };

  const loadProductWithSimilar = async () => {
    if (!productId) return;
    
    setIsLoading(true);
    try {
      // Загружаем основной товар
      const product = await getProductById(productId);
      setMainProduct(product);
      
      // Загружаем все товары для поиска похожих
      const allProductsData = await getProducts();
      setAllProducts(allProductsData);
      
      // Находим похожие товары
      if (product?.category) {
        const similar = allProductsData
          .filter(p => 
            p.id !== productId && 
            p.category === product.category &&
            p.active !== false
          )
          .slice(0, 8);
        setSimilarProducts(similar);
      } else {
        setSimilarProducts([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки товара:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // НОВАЯ ФУНКЦИЯ: обработка отправки заказа
  const handleOrderSubmit = async (orderData) => {
    if (!mainProduct) return;
    
    setIsOrderSubmitting(true);
    
    try {
      // Здесь ваш запрос на создание заказа
      console.log('Создание заказа:', {
        ...orderData,
        productId: mainProduct.id,
        productName: mainProduct.title,
        productPrice: mainProduct.price,
        userId: userData?.uid,
        userEmail: userData?.email
      });

      // Симуляция успешного заказа (замените на реальный API запрос)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('✅ Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.');
      setShowOrderForm(false);
      
      // Можно добавить логику очистки корзины или других действий
      
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      alert('❌ Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
    } finally {
      setIsOrderSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <Loader />
      </div>
    );
  }

  // Определяем что показывать
  const displayTitle = () => {
    if (displayMode === 'product') return 'Выбранный товар';
    if (displayMode === 'search') return `Результаты поиска: "${searchQuery}"`;
    if (activeCategory) return `Категория: ${activeCategory}`;
    
  };

  const displaySubtitle = () => {
    if (displayMode === 'product') return 'и похожие товары';
    if (displayMode === 'search') return `Найдено: ${allProducts.length} товаров`;
    if (activeCategory) return `Товаров в категории: ${allProducts.length}`;
    
  };

  const displayProducts = () => {
    if (displayMode === 'product') return similarProducts;
    return allProducts;
  };

  const shouldShowMainProduct = (displayMode === 'product' || displayMode === 'search') && mainProduct;

  return (
    <div className="py-0">
      {/* Заголовок с кнопкой закрытия */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">
            {displayTitle()}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {displaySubtitle()}
          </p>
        </div>
        
        {(displayMode === 'product' || displayMode === 'search') && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-800/50 text-gray-300 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition"
          >
            Показать все товары
          </button>
        )}
      </div>

      {/* Основной товар (если есть) */}
      {shouldShowMainProduct && !showOrderForm && (
        <div className="mb-8 bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Изображение */}
            <div className="md:w-1/3">
              <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                <img
                  src={mainProduct.images?.[0] || '/placeholder.jpg'}
                  alt={mainProduct.title}
                  className="w-full aspect-square object-cover"
                />
              </div>
            </div>
            
            {/* Информация о товаре */}
            <div className="md:w-2/3">
              <h3 className="text-xl font-bold text-gray-100 mb-2">
                {mainProduct.title}
              </h3>
              
              {mainProduct.category && (
                <div className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm mb-3">
                  {mainProduct.category}
                </div>
              )}
              
              <div className="text-3xl font-bold text-blue-400 mb-4">
                {mainProduct.price?.toLocaleString('ru-RU')} ₽
              </div>
              
              {mainProduct.description && (
                <div className="text-gray-300 mb-4">
                  <p>{mainProduct.description}</p>
                </div>
              )}
              
              {/* Дополнительная информация */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {mainProduct.brand && (
                  <div>
                    <p className="text-sm text-gray-400">Бренд:</p>
                    <p className="text-gray-300 font-medium">{mainProduct.brand}</p>
                  </div>
                )}
                {mainProduct.sku && (
                  <div>
                    <p className="text-sm text-gray-400">Артикул:</p>
                    <p className="text-gray-300 font-medium">{mainProduct.sku}</p>
                  </div>
                )}
                {mainProduct.stock !== undefined && (
                  <div>
                    <p className="text-sm text-gray-400">Наличие:</p>
                    <p className={`font-medium ${mainProduct.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {mainProduct.stock > 0 ? `В наличии (${mainProduct.stock} шт.)` : 'Нет в наличии'}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Кнопки действий - ОСНОВНАЯ КНОПКА "КУПИТЬ" */}
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setShowOrderForm(true)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium text-lg"
                >
                  Купить сейчас
                </button>
               
                
               
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Форма оформления заказа */}
      {showOrderForm && mainProduct && (
        <div className="mb-8">
          <OrderForm
            onClose={() => setShowOrderForm(false)}
            onSubmit={handleOrderSubmit}
            loading={isOrderSubmitting}
            userData={userData}
          />
        </div>
      )}

      {/* Список товаров (показываем только если не открыта форма заказа) */}
      {!showOrderForm && (
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-0">
            {displayMode === 'product' ? 'Похожие товары' : 'Товары'}
            <span className="ml-2 text-sm text-gray-400">({displayProducts().length})</span>
          </h3>
          
          {displayProducts().length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
              {displayProducts().map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onProductClick={onProductSelect}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              {displayMode === 'product' ? 'Нет похожих товаров' : 'Товары не найдены'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;