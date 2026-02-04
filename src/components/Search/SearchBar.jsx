import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiShoppingBag } from 'react-icons/fi';
import { searchProducts } from '../../services/firebase/productService';

// ДОБАВЛЕНО: пропс onProductSelect
const SearchBar = ({ onProductSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchRef = useRef(null);

  // Дебаунс запроса
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Поиск при изменении debouncedQuery
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      performSearch();
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [debouncedQuery]);

  // Закрытие результатов при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async () => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    
    setIsLoading(true);
    setShowResults(true);
    
    try {
      const searchResults = await searchProducts(debouncedQuery);
      console.log('🔍 Результаты поиска:', searchResults.length, 'товаров');
      setResults(searchResults);
    } catch (error) {
      console.error('❌ Ошибка поиска:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ОБНОВЛЕНО: Передаем ID товара через onProductSelect
  const handleSelectProduct = (productId) => {
    if (onProductSelect) {
      onProductSelect(productId);
    }
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  // Оставляем старую навигацию для поиска
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Можно оставить или убрать - зависит от нужного поведения
      // navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setResults([]);
      setShowResults(false);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Цена не указана';
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            placeholder="Поиск товаров..."
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
            autoComplete="off"
            aria-label="Поиск товаров"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Очистить поиск"
            >
              <FiX />
            </button>
          )}
        </div>
      </form>

      {/* Результаты поиска */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-600 font-medium">
              {isLoading ? 'Поиск...' : `Найдено: ${results.length} товаров`}
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-6 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-sm text-gray-500">Ищем товары...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product.id)}
                  className="p-3 hover:bg-blue-50 cursor-pointer transition-colors flex items-center gap-3 group"
                >
                  <div className="flex-shrink-0 relative">
                    <img
                      src={product.images?.[0] || '/placeholder-image.jpg'}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded-md border border-gray-200 group-hover:border-blue-300 transition-colors"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                      {product.title}
                    </p>
                    {product.category && (
                      <p className="text-xs text-gray-500 truncate">
                        {product.category}
                      </p>
                    )}
                    <p className="text-blue-600 font-bold text-sm mt-1">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <FiShoppingBag className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <FiSearch className="text-gray-400" />
              </div>
              <p className="text-gray-700 font-medium mb-1">Ничего не найдено</p>
              <p className="text-gray-500 text-sm">Попробуйте изменить запрос</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;