import { useState, useEffect } from 'react';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import { db } from '../../services/firebase/config';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import Loader from '../../components/Loader/Loader';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef, 
      //  where('active', '==', true),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProducts(productsList);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Пустое пространство под Header */}
      <div className="pt-16"></div>
      
      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-800">
            {products.length > 0 
              ? `Товары (${products.length})` 
              : 'Товары не найдены'
            }
          </h1>
        </div>
        
        {/* Сетка товаров */}
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Товары скоро появятся</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;