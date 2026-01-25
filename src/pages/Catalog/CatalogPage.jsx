import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import ProductFilters from '../../components/Filters/ProductFilters';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import Loader from '../../components/Loader/Loader';
import { getProducts, getCategories } from '../../services/firebase/productService';

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Получаем параметры из URL
  const searchQuery = searchParams.get('q') || '';
  const categoryFromUrl = searchParams.get('category') || 'all';

  useEffect(() => {
    loadProductsAndCategories();
  }, [location.search]);

  const loadProductsAndCategories = async () => {
    setIsLoading(true);
    try {
      // Загружаем категории
      const categoriesData = await getCategories();
      setCategories(categoriesData);

      // Загружаем продукты
      const productsData = await getProducts();
      let filtered = [...productsData];

      // Фильтруем по поисковому запросу
      if (searchQuery) {
        filtered = filtered.filter(product =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      // Фильтруем по категории из URL
      if (categoryFromUrl !== 'all') {
        filtered = filtered.filter(product => product.category === categoryFromUrl);
      }

      setProducts(filtered);
      setFilteredProducts(filtered);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    let filtered = [...products];

    // Фильтрация по категории
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Фильтрация по цене
    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= Number(filters.maxPrice));
    }

    // Фильтрация по наличию
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      if (filters.sortBy === 'price') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Заголовок с результатами поиска */}
        {(searchQuery || categoryFromUrl !== 'all') && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {searchQuery 
                ? `Результаты поиска: "${searchQuery}"`
                : `Категория: ${categoryFromUrl}`
              }
            </h1>
            <p className="text-gray-600">
              Найдено товаров: {filteredProducts.length}
            </p>
          </div>
        )}

        {/* Фильтры */}
        <ProductFilters 
          onFilterChange={handleFilterChange}
          categories={categories}
          initialFilters={{
            category: categoryFromUrl
          }}
        />

        {/* Сетка товаров */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">
                Показано {filteredProducts.length} из {products.length} товаров
              </p>
            </div>
            <ProductGrid products={filteredProducts} />
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Товары не найдены</h2>
            <p className="text-gray-600 mb-6">
              Попробуйте изменить параметры поиска или фильтры
            </p>
            <button
              onClick={() => {
                // Сброс фильтров
                handleFilterChange({
                  category: 'all',
                  minPrice: '',
                  maxPrice: '',
                  inStock: false,
                  sortBy: 'createdAt',
                  sortOrder: 'desc'
                });
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Показать все товары
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;