import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';

import { searchProducts } from '../../services/firebase/productService';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 1) {
        performSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async () => {
    if (query.trim().length < 2) return;
    
    setIsLoading(true);
    setShowResults(true);
    
    console.log('🔍 Поиск запроса:', query);
    
    try {
     
      const searchResults = await searchProducts(query);
      console.log('✅ Найдено товаров:', searchResults.length);
      console.log('📦 Результаты:', searchResults);
      
      setResults(searchResults);
    } catch (error) {
      console.error('❌ Ошибка поиска:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = (productId) => {
    navigate(`/product/${productId}`);
    setQuery('');
    setShowResults(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setQuery('');
      setShowResults(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск товаров..."
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX />
            </button>
          )}
        </div>
      </form>

      {/* Результаты поиска */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : results.length > 0 ? (
            results.map((product) => (
              <div
                key={product.id}
                onClick={() => handleSelectProduct(product.id)}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-3"
              >
                <img
                  src={product.images?.[0] || ''}
                  alt={product.title}
                  className="w-12 h-12 object-cover rounded"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.querySelector('.image-fallback')?.classList.remove('hidden');
                  }}
                />
                <div className="image-fallback hidden w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">Нет фото</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.title}</p>
                  <p className="text-blue-600 font-semibold text-sm">
                    {formatPrice(product.price || 0)} ₽
                  </p>
                </div>
              </div>
            ))
          ) : query.length > 1 ? (
            <div className="p-4 text-center text-gray-500">
              Ничего не найдено
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;