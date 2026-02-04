import React, { useState } from 'react';

const ProductFilters = ({ 
  onFilterChange, 
  categories = [],
  initialCategory = 'all'
}) => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    onFilterChange({ category });
  };

  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split('_');
    onFilterChange({ 
      category: selectedCategory,
      sortBy,
      sortOrder
    });
  };

  return (
    <div className="flex flex-wrap gap-4 items-center mb-6">
      {/* Категории */}
      <div className="flex-1 min-w-[250px]">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Категория
        </label>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
        >
          <option value="all">Все категории</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      {/* Сортировка */}
      <div className="min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Сортировка
        </label>
        <select
          onChange={handleSortChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
        >
          <option value="createdAt_desc">По новизне</option>
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
          <option value="title_asc">По названию (А-Я)</option>
        </select>
      </div>
    </div>
  );
};

export default ProductFilters;