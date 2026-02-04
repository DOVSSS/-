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

// Функция поиска товаров (ИСПРАВЛЕННАЯ)
export const searchProducts = async (searchTerm) => {
  try {
    console.log('🔍 Поиск по запросу:', searchTerm);
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      console.log('Запрос слишком короткий');
      return [];
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Получаем ВСЕ товары
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    if (snapshot.empty) {
      console.log('В базе нет товаров');
      return [];
    }
    
    // Фильтруем на клиенте
    const results = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        };
      })
      .filter(product => {
        // Проверяем активность
        if (product.active === false) return false;
        
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
        
        // Проверяем бренд
        if (product.brand && product.brand.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Проверяем SKU
        if (product.sku && product.sku.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Проверяем теги
        if (product.tags && Array.isArray(product.tags)) {
          return product.tags.some(tag => 
            tag && tag.toLowerCase().includes(searchLower)
          );
        }
        
        return false;
      })
      .sort((a, b) => {
        // Сортируем по релевантности
        const aScore = calculateRelevanceScore(a, searchLower);
        const bScore = calculateRelevanceScore(b, searchLower);
        return bScore - aScore;
      })
      .slice(0, 20); // Ограничиваем 20 результатами
    
    console.log('✅ Найдено результатов:', results.length);
    return results;
    
  } catch (error) {
    console.error('❌ Ошибка поиска:', error);
    return [];
  }
};

// Функция расчета релевантности
const calculateRelevanceScore = (product, searchLower) => {
  let score = 0;
  
  // Название - самый важный фактор
  if (product.title?.toLowerCase().includes(searchLower)) {
    score += 10;
    // Если название начинается с запроса - дополнительный бонус
    if (product.title.toLowerCase().startsWith(searchLower)) {
      score += 5;
    }
    // Если точное совпадение - максимальный бонус
    if (product.title.toLowerCase() === searchLower) {
      score += 10;
    }
  }
  
  // Категория
  if (product.category?.toLowerCase().includes(searchLower)) {
    score += 8;
    if (product.category.toLowerCase() === searchLower) {
      score += 4;
    }
  }
  
  // Бренд
  if (product.brand?.toLowerCase().includes(searchLower)) {
    score += 6;
  }
  
  // Описание
  if (product.description?.toLowerCase().includes(searchLower)) {
    score += 3;
  }
  
  // Теги
  if (product.tags && Array.isArray(product.tags)) {
    const tagMatches = product.tags.filter(tag => 
      tag && tag.toLowerCase().includes(searchLower)
    ).length;
    score += tagMatches * 4;
  }
  
  // SKU
  if (product.sku?.toLowerCase().includes(searchLower)) {
    score += 7;
  }
  
  return score;
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
    await deleteDoc(docRef);  // <- ВМЕСТО updateDoc используйте deleteDoc
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