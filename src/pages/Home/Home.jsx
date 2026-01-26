import { useState, useEffect } from 'react';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import { db } from '../../services/firebase/config';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import Loader from '../../components/Loader/Loader';
import { FiSearch, FiX } from 'react-icons/fi';

function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  // Фильтрация товаров при изменении поискового запроса
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(allProducts);
      return;
    }

    const queryText = searchQuery.toLowerCase().trim();
    
    // Фильтруем товары
    const filtered = allProducts.filter(product => {
      // Проверяем различные поля товара
      const searchFields = [
        product.title,
        product.description,
        product.category,
        product.brand,
        product.sku || ''
      ];

      return searchFields.some(field => 
        field && field.toLowerCase().includes(queryText)
      );
    });

    // Сортируем по релевантности
    const sortedResults = sortProductsByRelevance(filtered, queryText);
    setFilteredProducts(sortedResults);
  }, [searchQuery, allProducts]);

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef, 
        // where('active', '==', true),
        limit(50) // Увеличил лимит для лучшего поиска
      );
      
      const snapshot = await getDocs(q);
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAllProducts(productsList);
      setFilteredProducts(productsList);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  // Функция сортировки по релевантности
  const sortProductsByRelevance = (products, queryText) => {
    return products.sort((a, b) => {
      const aScore = calculateRelevanceScore(a, queryText);
      const bScore = calculateRelevanceScore(b, queryText);
      return bScore - aScore; // Сначала товары с большим score
    });
  };

  // Функция расчета релевантности
  const calculateRelevanceScore = (product, queryText) => {
    let score = 0;
    
    // Название (самый важный параметр)
    if (product.title?.toLowerCase().includes(queryText)) {
      score += 10;
      // Если название начинается с запроса - дополнительный бонус
      if (product.title.toLowerCase().startsWith(queryText)) {
        score += 5;
      }
    }
    
    // Категория
    if (product.category?.toLowerCase().includes(queryText)) {
      score += 8;
      // Если точное совпадение категории
      if (product.category.toLowerCase() === queryText) {
        score += 4;
      }
    }
    
    // Бренд
    if (product.brand?.toLowerCase().includes(queryText)) {
      score += 6;
    }
    
    // Описание
    if (product.description?.toLowerCase().includes(queryText)) {
      score += 3;
    }
    
    return score;
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Пустое пространство под Header */}
      <div className="pt-16"></div>
      
      {/* Поисковая строка */}
      <div className="sticky top-16 z-10 bg-white border-b px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Поиск товаров..."
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            )}
          </div>
          
          {/* Индикатор поиска */}
          {searchQuery && (
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-gray-600">
                Найдено: {filteredProducts.length} товаров
                <span className="ml-1 text-gray-400">
                  (всего: {allProducts.length})
                </span>
              </span>
              <button
                onClick={clearSearch}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Очистить поиск
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-800">
            {searchQuery ? (
              <>
                Результаты поиска "{searchQuery}"
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({filteredProducts.length} товаров)
                </span>
              </>
            ) : (
              `Товары (${filteredProducts.length})`
            )}
          </h1>
        </div>
        
        {/* Сетка товаров */}
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : searchQuery ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
              <FiSearch className="text-gray-400" size={20} />
            </div>
            <p className="text-gray-600 mb-2">Товары не найдены</p>
            <p className="text-gray-400 text-sm mb-6">
              Попробуйте изменить запрос или посмотрите все товары
            </p>
            <button
              onClick={clearSearch}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Показать все товары
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Товары скоро появятся</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;