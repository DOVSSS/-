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
        limit(50)
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
      return bScore - aScore;
    });
  };

  // Функция расчета релевантности
  const calculateRelevanceScore = (product, queryText) => {
    let score = 0;
    
    if (product.title?.toLowerCase().includes(queryText)) {
      score += 10;
      if (product.title.toLowerCase().startsWith(queryText)) {
        score += 5;
      }
    }
    
    if (product.category?.toLowerCase().includes(queryText)) {
      score += 8;
      if (product.category.toLowerCase() === queryText) {
        score += 4;
      }
    }
    
    if (product.brand?.toLowerCase().includes(queryText)) {
      score += 6;
    }
    
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    
      {/* Поисковая строка */}
      <div className="sticky top-16 z-10 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 backdrop-blur-md bg-opacity-95 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Поиск товаров..."
              className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-100 placeholder-gray-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 outline-none transition text-sm backdrop-blur-sm"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <FiX />
              </button>
            )}
          </div>
          
          {/* Индикатор поиска */}
          {searchQuery && (
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-gray-300">
                Найдено: {filteredProducts.length} товаров
                <span className="ml-1 text-gray-400">
                  (всего: {allProducts.length})
                </span>
              </span>
              <button
                onClick={clearSearch}
                className="text-xs text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:from-blue-500 hover:to-purple-500 transition-all"
              >
                Очистить поиск
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-0 py-6">
        
        {/* Сетка товаров */}
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : searchQuery ? (
          <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 mb-4">
              <FiSearch className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-300 mb-2 text-lg">Товары не найдены</p>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Попробуйте изменить запрос или посмотрите все товары
            </p>
            <button
              onClick={clearSearch}
              className="px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 text-sm font-medium"
            >
              Показать все товары
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">Товары скоро появятся</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;