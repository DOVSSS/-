import ProductCard from '../ProductCard/ProductCard';

function ProductGrid({ products, searchQuery = '' }) {
  if (!products || products.length === 0) {
    return null;
  }

  // Просто сортируем товары по совпадению с поиском
  const sortedProducts = [...products].sort((a, b) => {
    const aHasMatch = a.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const bHasMatch = b.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (aHasMatch && !bHasMatch) return -1;
    if (!aHasMatch && bHasMatch) return 1;
    return 0;
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      {sortedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;