import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import ProductGrid from '../../components/ProductGrid/ProductGrid';
import Loader from '../../components/Loader/Loader';
import { getProducts, getCategories } from '../../services/firebase/productService';
import { FiSearch, FiX } from 'react-icons/fi';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Получаем параметры из URL
  const categoryFromUrl = searchParams.get('category') || 'all';

  useEffect(() => {
    loadProductsAndCategories();
  }, [categoryFromUrl]); // Загружаем при изменении категории из URL

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
      if (searchQuery.trim()) {
        const queryText = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(product =>
          product.title.toLowerCase().includes(queryText) ||
          (product.description && product.description.toLowerCase().includes(queryText)) ||
          (product.category && product.category.toLowerCase().includes(queryText))
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

 

  

  const clearSearch = () => {
    setSearchQuery('');
    loadProductsAndCategories(); // Перезагружаем без поиска
  };

  const clearCategory = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('category');
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
     

      <div className="max-w-7xl mx-auto px-4 py-6">
       

        {/* Фильтры (только категории) */}
        <div className="mb-6">
          <div className="bg-gray-800/30 rounded-lg border border-gray-700/50 p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[250px]">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Категория
                </label>
                <select
                  value={categoryFromUrl}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams);
                    if (e.target.value === 'all') {
                      params.delete('category');
                    } else {
                      params.set('category', e.target.value);
                    }
                    setSearchParams(params);
                  }}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-100 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 outline-none transition"
                >
                  <option value="all" className="bg-gray-800">Все категории</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-gray-800">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
             
            </div>
          </div>
        </div>

        {/* Сетка товаров */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-300 text-sm">
                Показано <span className="font-semibold text-gray-100">{filteredProducts.length}</span> товаров
              </p>
            </div>
            <ProductGrid products={filteredProducts} />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 mb-4">
              <FiSearch className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-300 mb-2 text-lg">Товары не найдены</p>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Попробуйте изменить запрос или выберите другую категорию
            </p>
            <button
              onClick={() => {
                clearSearch();
                clearCategory();
              }}
              className="px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 text-sm font-medium"
            >
              Показать все товары
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;