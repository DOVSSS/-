import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchResults from '../../components/Search/SearchResults';
import Loader from '../../components/Loader/Loader';
import { getCategories, getProducts, searchProducts } from '../../services/firebase/productService';
import { FiSearch, FiX, FiFilter } from 'react-icons/fi';

const Home = ({ selectedProductId, setSelectedProductId }) => {
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categoryFromUrl = searchParams.get('category') || 'all';

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoadingProducts(true);
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);

      const productsData = await getProducts();
      setAllProducts(productsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Поиск товаров
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchProducts(searchQuery.trim());
      setSearchResults(results);
      // Используем переданный setSelectedProductId
      if (setSelectedProductId) {
        setSelectedProductId(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Обработчик выбора товара из поиска
  const handleProductSelect = (productId) => {
    console.log('🏠 Home: handleProductSelect вызван с ID:', productId);
    // Используем переданный setSelectedProductId
    if (setSelectedProductId) {
      setSelectedProductId(productId);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    // Используем переданный setSelectedProductId
    if (setSelectedProductId) {
      setSelectedProductId(null);
    }
  };

  const clearCategory = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('category');
    setSearchParams(params);
    clearSearch();
  };

  const handleBackToAll = () => {
    clearSearch();
  };

  // Фильтрация товаров по категории
  const getFilteredProducts = () => {
    if (categoryFromUrl === 'all') {
      return allProducts;
    }
    return allProducts.filter(product => product.category === categoryFromUrl);
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Поисковая строка */}
      <div className="sticky top-16 z-10 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 backdrop-blur-md bg-opacity-95 px-0 py-0">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск товаров..."
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-100 placeholder-gray-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 outline-none transition text-sm backdrop-blur-sm"
                autoComplete="off"
              />
              {(searchQuery || searchResults.length > 0 || selectedProductId) && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <FiX />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Категории */}
        <div className="mb-6 bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-3">
            <FiFilter className="text-gray-400" />
            <h2 className="text-sm font-medium text-gray-300">Категории</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Кнопка "Все" */}
            <button
              onClick={() => {
                clearCategory();
                handleBackToAll();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${categoryFromUrl === 'all' 
                ? 'bg-blue-600 text-white border border-blue-500' 
                : 'bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:border-gray-600/50'
              }`}
            >
              Все
            </button>
            
            {/* Кнопки категорий */}
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set('category', cat);
                  setSearchParams(params);
                  handleBackToAll();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${categoryFromUrl === cat
                  ? 'bg-blue-600 text-white border border-blue-500' 
                  : 'bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:border-gray-600/50'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Активная категория с очисткой */}
          {categoryFromUrl !== 'all' && (
            <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Активная категория:</p>
                <p className="text-blue-400 font-medium">{categoryFromUrl}</p>
              </div>
              <button
                onClick={clearCategory}
                className="px-3 py-1 text-xs bg-gray-800/50 text-gray-300 rounded border border-gray-700/50 hover:border-gray-600/50 transition"
              >
                Очистить
              </button>
            </div>
          )}
        </div>

        {/* Индикатор загрузки */}
        {isLoadingProducts ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : (
          <>
            {/* Результаты поиска */}
            {isSearching ? (
              <div className="flex justify-center py-12">
                <Loader />
              </div>
            ) : searchResults.length > 0 ? (
              <SearchResults
                searchResults={searchResults}
                onProductSelect={handleProductSelect}
                onClose={handleBackToAll}
              />
            ) : selectedProductId ? (
              <SearchResults
                productId={selectedProductId}
                onClose={handleBackToAll}
              />
            ) : (
              <SearchResults 
                products={filteredProducts}
                onClose={handleBackToAll}
                activeCategory={categoryFromUrl !== 'all' ? categoryFromUrl : null}
                onProductSelect={handleProductSelect}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;