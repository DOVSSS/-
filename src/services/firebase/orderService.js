import { db } from './config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  limit,
  startAfter,
  getDoc
} from 'firebase/firestore';

// Создание заказа
export const createOrder = async (orderData, userId) => {
  try {
    const ordersRef = collection(db, 'orders');
    
    const orderWithMeta = {
      ...orderData,
      userId,
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending'
    };
    
    const docRef = await addDoc(ordersRef, orderWithMeta);
    
    return {
      id: docRef.id,
      ...orderWithMeta
    };
  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    throw error;
  }
};

// Получение заказов пользователя
export const getUserOrders = async (userId) => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    throw error;
  }
};

// Получение ВСЕХ заказов (для 
// В getAllOrders добавьте проверку:
export const getAllOrders = async (limitCount = 50, lastDoc = null) => {
  try {
    console.log('📦 Загрузка всех заказов...');
    
    const ordersRef = collection(db, 'orders');
    
    let q = query(
      ordersRef,
      orderBy('createdAt', 'desc')
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    let lastVisible = null;
    
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        orders.push({
          id: doc.id,
          ...data
        });
        lastVisible = doc;
      } catch (error) {
        console.error('❌ Ошибка обработки документа заказа:', error);
      }
    });
    
    console.log(`✅ Загружено ${orders.length} заказов`);
    
    return {
      orders,
      lastVisible,
      hasMore: orders.length === limitCount
    };
  } catch (error) {
    console.error('❌ Ошибка получения всех заказов:', error);
    // Возвращаем пустой результат при ошибке
    return {
      orders: [],
      lastVisible: null,
      hasMore: false,
      error: error.message
    };
  }
};
// Получение заказа по ID
export const getOrderById = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (orderDoc.exists()) {
      return {
        id: orderDoc.id,
        ...orderDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Ошибка получения заказа по ID:', error);
    throw error;
  }
};

// Обновление статуса заказа
export const updateOrderStatus = async (orderId, status, adminNote = '') => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    const updateData = {
      status,
      updatedAt: serverTimestamp()
    };
    
    if (adminNote) {
      updateData.adminNote = adminNote;
      updateData.updatedByAdmin = true;
    }
    
    await updateDoc(orderRef, updateData);
    
    return true;
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    throw error;
  }
};

// Получение статистики заказов
export const getOrdersStats = async () => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    
    const stats = {
      total: 0,
      byStatus: {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      },
      totalRevenue: 0,
      recentOrders: []
    };
    
    const now = new Date();
    const last30Days = new Date(now.setDate(now.getDate() - 30));
    
    querySnapshot.forEach((doc) => {
      const order = doc.data();
      stats.total++;
      
      // Статистика по статусам
      if (stats.byStatus[order.status] !== undefined) {
        stats.byStatus[order.status]++;
      } else {
        stats.byStatus[order.status] = 1;
      }
      
      // Общая выручка
      if (order.total && order.status !== 'cancelled') {
        stats.totalRevenue += order.total;
      }
      
      // Последние 10 заказов
      if (stats.recentOrders.length < 10) {
        stats.recentOrders.push({
          id: doc.id,
          ...order
        });
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    throw error;
  }
};