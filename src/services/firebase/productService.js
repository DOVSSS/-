import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';
import { cloudinaryService } from '../cloudinary/cloudinaryService';

// Функция поиска товаров (исправленная)
export const searchProducts = async (searchTerm) => {
  try {
    console.log('Searching for:', searchTerm);
    
    // Получаем все активные товары
    const productsRef = collection(db, 'products');
  //  const q = query(productsRef, where('active', '==', true));
    const snapshot = await getDocs(q);
    
    const searchLower = searchTerm.toLowerCase();
    
    // Фильтруем на клиенте
    const results = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(product => {
        // Проверяем название
        if (product.title && product.title.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Проверяем описание
        if (product.description && product.description.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Проверяем категорию
        if (product.category && product.category.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        return false;
      })
      .slice(0, 10); // Ограничиваем 10 результатами
    
    console.log('Found results:', results.length);
    return results;
    
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};


// Получение всех товаров (ОДНА функция!)
export const getProducts = async () => {
  try {
    const productsRef = collection(db, 'products');
    // УБЕРИТЕ where('active', '==', true) - загружаем ВСЕ товары
    const snapshot = await getDocs(productsRef);
    
    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data
      };
    });
    
    // Сортировка по дате создания (новые первыми)
    return products.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

// Получение товара по ID
export const getProductById = async (id) => {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
};

// Получение категорий
export const getCategories = async () => {
  try {
    const products = await getProducts();
    const categories = new Set();
    
    products.forEach(product => {
      if (product.category) {
        categories.add(product.category);
      }
    });
    
    return Array.from(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Создание товара
export const createProduct = async (productData) => {
  try {
    const productsRef = collection(db, 'products');
    const productWithMeta = {
      ...productData,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0,
      sales: 0,
      rating: 0,
      reviews: 0,
      stock: productData.stock || 100
    };
    
    const docRef = await addDoc(productsRef, productWithMeta);
    return { id: docRef.id, ...productWithMeta };
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Обновление товара
export const updateProduct = async (id, productData) => {
  try {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
      ...productData,
      updatedAt: serverTimestamp()
    });
    return { id, ...productData };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Удаление товара (мягкое удаление)
export const deleteProduct = async (id) => {
  try {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
      active: false,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Увеличение просмотров
export const incrementViews = async (id) => {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentViews = docSnap.data().views || 0;
      await updateDoc(docRef, { views: currentViews + 1 });
    }
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
};

// Объект для обратной совместимости (если используется где-то)
export const productService = {
  getAllProducts: getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  incrementViews,
  getCategories,
  searchProducts
};