import React, { useState } from 'react';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const ProductFilters = ({ 
  onFilterChange, 
  categories = [],
  initialFilters = {} 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    category: initialFilters.category || 'all',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    inStock: initialFilters.inStock || false,
    sortBy: initialFilters.sortBy || 'createdAt',
    sortOrder: initialFilters.sortOrder || 'desc'
  });

  const sortOptions = [
    { value: 'createdAt', label: 'По новизне' },
    { value: 'price', label: 'По цене' },
    { value: 'title', label: 'По названию' },
    { value: 'rating', label: 'По рейтингу' },
    { value: 'sales', label: 'По популярности' }
  ];

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceBlur = () => {
    if (filters.minPrice || filters.maxPrice) {
      onFilterChange(filters);
    }
  };

  const resetFilters = () => {
    const resetFilters = {
      category: 'all',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Заголовок фильтров */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-600" />
          <span className="font-medium">Фильтры и сортировка</span>
        </div>
        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {/* Контент фильтров */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Категории */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">Все категории</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Цена от */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена от, ₽
              </label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleChange('minPrice', e.target.value)}
                onBlur={handlePriceBlur}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="0"
              />
            </div>

            {/* Цена до */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена до, ₽
              </label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleChange('maxPrice', e.target.value)}
                onBlur={handlePriceBlur}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="10000"
              />
            </div>

            {/* Сортировка */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сортировка
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Дополнительные фильтры */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => handleChange('inStock', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Только в наличии</span>
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => handleChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                {filters.sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
              </button>
              
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                Сбросить фильтры
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;