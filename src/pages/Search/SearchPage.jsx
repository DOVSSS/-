import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import Loader from '../../components/Loader/Loader';
import { searchProducts } from '../../services/firebase/productService';
import { FiSearch } from 'react-icons/fi';

const SearchPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchProducts(query);
        setProducts(results);
      } catch (error) {
        console.error('Search error:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  if (isLoading) {
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
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Заголовок поиска */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            Результаты поиска: "{query}"
          </h1>
          <p className="text-gray-600">
            Найдено товаров: {products.length}
          </p>
        </div>

        {/* Результаты */}
        {products.length > 0 ? (
          <>
            <div className="mb-6">
              <ProductGrid products={products} />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FiSearch className="text-gray-400" size={24} />
            </div>
            <h2 className="text-xl font-semibold mb-2">Ничего не найдено</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Попробуйте изменить поисковый запрос или посмотрите другие товары
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/catalog"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Смотреть все товары
              </Link>
              <Link
                to="/"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                На главную
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;