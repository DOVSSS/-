import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// === ПРЕДВАРИТЕЛЬНАЯ ОЧИСТКА СТАРЫХ ДАННЫХ ===
if (typeof window !== 'undefined') {
  const oldKeys = [
    'cart-storage', 
    'cart-storage-v2', 
    'cart-storage-v3',
    'simple-cart-storage',
    'Cart', 
    'cart',
    'favorites-storage',
    'favorites-storage-v2',
    'favorites-storage-v3'
  ];
  oldKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`🗑️ Удален старый ключ: ${key}`);
    }
  });
}

// === МНОГОПОЛЬЗОВАТЕЛЬСКАЯ КОРЗИНА (ИСПРАВЛЕННАЯ) ===
const useCartStore = create(
  persist(
    (set, get) => ({
      // Структура: { userId1: [товары], userId2: [товары], 'guest': [товары] }
      userCarts: {},
      currentUserId: 'guest', // По умолчанию гость
      
      // === ФУНКЦИИ ВМЕСТО ГЕТТЕРОВ (надежнее) ===
      
      // Получение корзины текущего пользователя
      getItems: () => {
        const state = get();
        const userId = state.currentUserId || 'guest';
        const cart = state.userCarts[userId] || [];
        
        console.log('🛍️ getItems вызван для пользователя:', userId);
        console.log('🛍️ Результат:', cart);
        
        return cart;
      },
      
      // Получение общей суммы
      getTotal: () => {
        const items = get().getItems();
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        console.log('💰 getTotal:', total, 'для', items.length, 'товаров');
        
        return total;
      },
      
      // Получение общего количества товаров
      getTotalItems: () => {
        const items = get().getItems();
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        
        console.log('🔢 getTotalItems:', totalItems, 'для', items.length, 'товаров');
        
        return totalItems;
      },
      
      // === ОСНОВНЫЕ МЕТОДЫ ===
      
      // Установка текущего пользователя
      setCurrentUser: (userId) => {
        const finalUserId = userId || 'guest';
        console.log('👤 Установлен пользователь корзины:', finalUserId);
        
        set({ 
          currentUserId: finalUserId 
        });
        
        // Проверяем после установки
        setTimeout(() => {
          const state = get();
          console.log('✅ Проверка после setCurrentUser:');
          console.log('   currentUserId:', state.currentUserId);
          console.log('   Корзина пользователя:', state.userCarts[finalUserId] || []);
        }, 0);
      },
      
      // Добавление в корзину текущего пользователя
      addToCart: (product) => {
        console.log('🛒 addToCart вызван для товара:', product.title);
        
        set((state) => {
          const userId = state.currentUserId || 'guest';
          const currentCart = state.userCarts[userId] || [];
          
          console.log(`📊 Перед добавлением для ${userId}:`, currentCart.length, 'товаров');
          
          const existingIndex = currentCart.findIndex(item => item.id === product.id);
          
          let updatedCart;
          if (existingIndex >= 0) {
            updatedCart = currentCart.map((item, index) => 
              index === existingIndex 
                ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                : item
            );
          } else {
            updatedCart = [...currentCart, { 
              ...product, 
              quantity: product.quantity || 1 
            }];
          }
          
          const newUserCarts = {
            ...state.userCarts,
            [userId]: updatedCart
          };
          
          console.log(`✅ Товар "${product.title}" добавлен для пользователя ${userId}`);
          console.log(`📦 Теперь в корзине ${updatedCart.length} товаров`);
          console.log('🔄 Обновленные userCarts:', Object.keys(newUserCarts));
          
          return {
            userCarts: newUserCarts
          };
        });
        
        // Проверяем после добавления
        setTimeout(() => {
          const state = get();
          const userId = state.currentUserId || 'guest';
          const items = state.userCarts[userId] || [];
          
          console.log('🔄 Проверка после addToCart:');
          console.log('   Текущий пользователь:', userId);
          console.log('   Товаров в корзине:', items.length);
          console.log('   Содержимое корзины:', items);
        }, 0);
      },
      
      // Удаление из корзины
      removeFromCart: (productId) => {
        console.log('🗑️ removeFromCart вызван для productId:', productId);
        
        set((state) => {
          const userId = state.currentUserId || 'guest';
          const currentCart = state.userCarts[userId] || [];
          const updatedCart = currentCart.filter(item => item.id !== productId);
          
          console.log(`✅ Товар удален из корзины пользователя ${userId}`);
          
          return {
            userCarts: {
              ...state.userCarts,
              [userId]: updatedCart
            }
          };
        });
      },
      
      // Обновление количества
      updateQuantity: (productId, quantity) => {
        console.log('📈 updateQuantity:', productId, '->', quantity);
        
        set((state) => {
          const userId = state.currentUserId || 'guest';
          const currentCart = state.userCarts[userId] || [];
          
          const updatedCart = currentCart.map(item =>
            item.id === productId ? { ...item, quantity } : item
          );
          
          return {
            userCarts: {
              ...state.userCarts,
              [userId]: updatedCart
            }
          };
        });
      },
      
      // Очистка корзины текущего пользователя
      clearCart: () => {
        console.log('🧹 clearCart вызван');
        
        set((state) => {
          const userId = state.currentUserId || 'guest';
          
          console.log(`✅ Корзина пользователя ${userId} очищена`);
          
          return {
            userCarts: {
              ...state.userCarts,
              [userId]: []
            }
          };
        });
      },
      
      // Синхронизация при входе: объединяем гостевую и пользовательскую корзины
      syncCartOnLogin: (userId) => {
        console.log('🔄 syncCartOnLogin вызван для пользователя:', userId);
        
        set((state) => {
          const guestCart = state.userCarts['guest'] || [];
          const userCart = state.userCarts[userId] || [];
          
          console.log('   Гостевая корзина:', guestCart.length, 'товаров');
          console.log('   Пользовательская корзина до:', userCart.length, 'товаров');
          
          // Объединяем корзины
          const mergedCart = [...userCart];
          
          guestCart.forEach(guestItem => {
            const existingIndex = mergedCart.findIndex(item => item.id === guestItem.id);
            if (existingIndex >= 0) {
              // Увеличиваем количество если товар уже есть
              mergedCart[existingIndex].quantity += guestItem.quantity;
              console.log(`   📈 Объединен товар: ${guestItem.title} (+${guestItem.quantity})`);
            } else {
              // Добавляем новый товар
              mergedCart.push(guestItem);
              console.log(`   ➕ Добавлен товар: ${guestItem.title}`);
            }
          });
          
          const newUserCarts = {
            ...state.userCarts,
            [userId]: mergedCart,
            'guest': [] // Очищаем гостевую
          };
          
          console.log('✅ Синхронизация завершена');
          console.log('   Пользовательская корзина после:', mergedCart.length, 'товаров');
          
          return {
            currentUserId: userId,
            userCarts: newUserCarts
          };
        });
      },
      
      // Очистка при выходе
      clearOnLogout: () => {
        console.log('👋 clearOnLogout: сброс пользователя на guest');
        set({ currentUserId: 'guest' });
      },
      
      // === ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ ===
      
      // Получение корзины конкретного пользователя (для админа)
      getUserCart: (userId) => {
        const state = get();
        return state.userCarts[userId] || [];
      },
      
      // Получение всех пользовательских корзин (для отладки)
      getAllCarts: () => {
        return get().userCarts;
      }
    }),
    {
      name: 'cart-storage-v4',
      storage: createJSONStorage(() => localStorage),
      // Миграция из старой версии
      migrate: (persistedState, version) => {
        console.log('🔄 Миграция корзины с версии', version);
        
        if (!persistedState) {
          console.log('   Нет сохраненных данных, создаем новую структуру');
          return {
            userCarts: {},
            currentUserId: 'guest'
          };
        }
        
        // Если старая структура с прямыми items
        if (persistedState.items && !persistedState.userCarts) {
          console.log('   Конвертируем старые данные (прямые items)');
          return {
            userCarts: {
              'guest': persistedState.items || []
            },
            currentUserId: 'guest'
          };
        }
        
        // Если старая структура с userCarts но без currentUserId
        if (persistedState.userCarts && !persistedState.currentUserId) {
          console.log('   Добавляем currentUserId');
          return {
            ...persistedState,
            currentUserId: 'guest'
          };
        }
        
        console.log('   Миграция не требуется');
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Корзина восстановлена из localStorage');
        if (state) {
          console.log('   Текущий пользователь:', state.currentUserId);
          console.log('   Всего пользовательских корзин:', Object.keys(state.userCarts || {}).length);
        }
      }
    }
  )
);

// === ИЗБРАННОЕ С ПОДДЕРЖКОЙ ПОЛЬЗОВАТЕЛЕЙ (ИСПРАВЛЕННАЯ) ===
const useFavoritesStore = create(
  persist(
    (set, get) => ({
      userFavorites: {},
      currentUserId: 'guest',
      
      // === ФУНКЦИИ ВМЕСТО ГЕТТЕРОВ ===
      
      // Получение избранного текущего пользователя
      getFavorites: () => {
        const state = get();
        const userId = state.currentUserId || 'guest';
        const favorites = state.userFavorites[userId] || [];
        
       
        
        return favorites;
      },
      
      // === ОСНОВНЫЕ МЕТОДЫ ===
      
      // Установка текущего пользователя
      setCurrentUser: (userId) => {
        const finalUserId = userId || 'guest';
        console.log('👤 Установлен пользователь избранного:', finalUserId);
        
        set({ 
          currentUserId: finalUserId 
        });
      },
      
      // Переключение избранного
      toggleFavorite: (productId) => {
       
        
        set((state) => {
          const userId = state.currentUserId || 'guest';
          const userFavorites = state.userFavorites[userId] || [];
          
          let updatedFavorites;
          if (userFavorites.includes(productId)) {
            updatedFavorites = userFavorites.filter(id => id !== productId);
            console.log(`✅ Товар ${productId} удален из избранного пользователя ${userId}`);
          } else {
            updatedFavorites = [...userFavorites, productId];
            console.log(`✅ Товар ${productId} добавлен в избранное пользователя ${userId}`);
          }
          
          const newUserFavorites = {
            ...state.userFavorites,
            [userId]: updatedFavorites
          };
          
          console.log(`📊 Теперь в избранном ${updatedFavorites.length} товаров`);
          
          return {
            userFavorites: newUserFavorites
          };
        });
      },
      
      // Проверка избранного
      isFavorite: (productId) => {
        const state = get();
        const userId = state.currentUserId || 'guest';
        const userFavorites = state.userFavorites[userId] || [];
        const result = userFavorites.includes(productId);
        
       
        
        return result;
      },
      
      // Удаление из избранного
      removeFromFavorites: (productId) => {
        console.log('🗑️ removeFromFavorites вызван для productId:', productId);
        
        set((state) => {
          const userId = state.currentUserId || 'guest';
          const userFavorites = state.userFavorites[userId] || [];
          const updatedFavorites = userFavorites.filter(id => id !== productId);
          
          console.log(`✅ Товар ${productId} удален из избранного пользователя ${userId}`);
          
          return {
            userFavorites: {
              ...state.userFavorites,
              [userId]: updatedFavorites
            }
          };
        });
      },
      
      // Очистка избранного текущего пользователя
      clearFavorites: () => {
        console.log('🧹 clearFavorites вызван');
        
        set((state) => {
          const userId = state.currentUserId || 'guest';
          
          console.log(`✅ Избранное пользователя ${userId} очищено`);
          
          return {
            userFavorites: {
              ...state.userFavorites,
              [userId]: []
            }
          };
        });
      },
      
      // Синхронизация при входе
      syncFavoritesOnLogin: (userId) => {
        console.log('🔄 syncFavoritesOnLogin для пользователя:', userId);
        
        set((state) => {
          const guestFavorites = state.userFavorites['guest'] || [];
          const userFavorites = state.userFavorites[userId] || [];
          
          console.log('   Гостевое избранное:', guestFavorites.length, 'товаров');
          console.log('   Пользовательское избранное до:', userFavorites.length, 'товаров');
          
          // Объединяем через Set для уникальности
          const mergedFavorites = [...new Set([...userFavorites, ...guestFavorites])];
          
          const newUserFavorites = {
            ...state.userFavorites,
            [userId]: mergedFavorites,
            'guest': [] // Очищаем гостевую
          };
          
          console.log('✅ Синхронизация избранного завершена');
          console.log('   Пользовательское избранное после:', mergedFavorites.length, 'товаров');
          
          return {
            currentUserId: userId,
            userFavorites: newUserFavorites
          };
        });
      },
      
      // Очистка при выходе
      clearOnLogout: () => {
        console.log('👋 clearOnLogout избранного: сброс пользователя на guest');
        set({ currentUserId: 'guest' });
      },
      
      // Получение избранного конкретного пользователя
      getUserFavorites: (userId) => {
        const state = get();
        return state.userFavorites[userId] || [];
      },
      
      // Получение всех пользовательских избранных
      getAllFavorites: () => {
        return get().userFavorites;
      }
    }),
    {
      name: 'favorites-storage-v4',
      storage: createJSONStorage(() => localStorage),
      // Миграция из старой версии
      migrate: (persistedState, version) => {
        console.log('🔄 Миграция избранного с версии', version);
        
        if (!persistedState) {
          console.log('   Нет сохраненных данных, создаем новую структуру');
          return {
            userFavorites: {},
            currentUserId: 'guest'
          };
        }
        
        // Если старая структура с прямым массивом favorites
        if (Array.isArray(persistedState)) {
          console.log('   Конвертируем старые данные (прямой массив)');
          return {
            userFavorites: {
              'guest': persistedState
            },
            currentUserId: 'guest'
          };
        }
        
        // Если старая структура с favorites но без userFavorites
        if (persistedState.favorites && !persistedState.userFavorites) {
          console.log('   Конвертируем старые данные (favorites)');
          return {
            userFavorites: {
              'guest': persistedState.favorites || []
            },
            currentUserId: 'guest'
          };
        }
        
        // Если старая структура с userFavorites но без currentUserId
        if (persistedState.userFavorites && !persistedState.currentUserId) {
          console.log('   Добавляем currentUserId');
          return {
            ...persistedState,
            currentUserId: 'guest'
          };
        }
        
        console.log('   Миграция не требуется');
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Избранное восстановлено из localStorage');
        if (state) {
          console.log('   Текущий пользователь:', state.currentUserId);
          console.log('   Всего пользовательских избранных:', Object.keys(state.userFavorites || {}).length);
        }
      }
    }
  )
);

// === АВТОРИЗАЦИЯ ===
const useAuthStore = create((set, get) => ({
  user: null,
  userData: null,
  isAdmin: false,
  isLoading: true,
  
  setAuthData: (user, userData) => {
    console.log('✅ setAuthData:', user?.email, 'isAdmin:', userData?.role === 'admin');
    
    set({ 
      user,
      userData,
      isAdmin: userData?.role === 'admin',
      isLoading: false
    });
  },
  
  clearAuth: () => {
    console.log('🚪 clearAuth: выход пользователя');
    
    set({ 
      user: null, 
      userData: null, 
      isAdmin: false,
      isLoading: false 
    });
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  isAuthenticated: () => {
    return !!get().user;
  }
}));

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ СИНХРОНИЗАЦИИ ===

// Функция для синхронизации обоих хранилищ при входе
const syncStoresOnLogin = (userId) => {
  console.log('🔄 syncStoresOnLogin: Синхронизация всех хранилищ для пользователя:', userId);
  
  // Синхронизируем корзину
  const cartStore = useCartStore.getState();
  if (cartStore.syncCartOnLogin) {
    cartStore.syncCartOnLogin(userId);
  }
  
  // Синхронизируем избранное
  const favoritesStore = useFavoritesStore.getState();
  if (favoritesStore.syncFavoritesOnLogin) {
    favoritesStore.syncFavoritesOnLogin(userId);
  }
  
  // Устанавливаем пользователя в обоих хранилищах
  cartStore.setCurrentUser(userId);
  favoritesStore.setCurrentUser(userId);
};

// Функция для очистки при выходе
const clearStoresOnLogout = () => {
  console.log('👋 clearStoresOnLogout: Очистка всех хранилищ при выходе');
  
  const cartStore = useCartStore.getState();
  const favoritesStore = useFavoritesStore.getState();
  
  if (cartStore.clearOnLogout) {
    cartStore.clearOnLogout();
  }
  
  if (favoritesStore.clearOnLogout) {
    favoritesStore.clearOnLogout();
  }
  
  // Устанавливаем гостевой режим
  cartStore.setCurrentUser('guest');
  favoritesStore.setCurrentUser('guest');
};

// === ФУНКЦИИ ДЛЯ ОТЛАДКИ ===
if (typeof window !== 'undefined') {
  // Показать все пользовательские корзины
  window.debugUserCarts = () => {
    const store = useCartStore.getState();
    console.log('=== ОТЛАДКА ПОЛЬЗОВАТЕЛЬСКИХ КОРЗИН ===');
    console.log('Текущий пользователь:', store.currentUserId);
    console.log('Все корзины:');
    
    Object.entries(store.userCarts).forEach(([userId, items]) => {
      console.log(`👤 ${userId}: ${items.length} товаров`);
      items.forEach(item => console.log(`   • ${item.title} x${item.quantity} - ${item.price} ₽`));
    });
    
    console.log('Текущая корзина (getItems()):', store.getItems());
  };
  
  // Тест добавления товара
  window.testAddToCart = () => {
    const store = useCartStore.getState();
    const testProduct = {
      id: 'test-' + Date.now(),
      title: 'Тестовый товар',
      price: 1000,
      images: [],
      quantity: 1
    };
    
    console.log('🧪 Тест добавления товара:', testProduct);
    store.addToCart(testProduct);
    
    // Проверка через секунду
    setTimeout(() => {
      console.log('✅ После теста:', store.getItems());
    }, 100);
  };
  
  // Показать все пользовательские избранные
  window.debugUserFavorites = () => {
    const store = useFavoritesStore.getState();
    console.log('=== ОТЛАДКА ПОЛЬЗОВАТЕЛЬСКИХ ИЗБРАННЫХ ===');
    console.log('Текущий пользователь:', store.currentUserId);
    console.log('Все избранные:');
    
    Object.entries(store.userFavorites).forEach(([userId, items]) => {
      console.log(`👤 ${userId}: ${items.length} товаров`);
      console.log('   Товары:', items);
    });
    
    console.log('Текущее избранное (getFavorites()):', store.getFavorites());
  };
  
  // Тест добавления в избранное
  window.testAddToFavorites = () => {
    const store = useFavoritesStore.getState();
    const testProductId = 'test-fav-' + Date.now();
    
    console.log('🧪 Тест избранного для productId:', testProductId);
    store.toggleFavorite(testProductId);
    
    // Проверка через секунду
    setTimeout(() => {
      console.log('✅ После теста:', store.getFavorites());
      console.log('✅ isFavorite проверка:', store.isFavorite(testProductId));
    }, 100);
  };
  
  // Очистить все данные
  window.clearAllCartData = () => {
    localStorage.removeItem('cart-storage-v4');
    localStorage.removeItem('favorites-storage-v4');
    console.log('🧹 Все данные корзины и избранного очищены');
    window.location.reload();
  };
  
  // Синхронизировать текущего пользователя
  window.syncCurrentUser = () => {
    const authStore = useAuthStore.getState();
    if (authStore.user) {
      const userId = authStore.user.email || authStore.user.uid || 'user';
      console.log('🔄 Ручная синхронизация для пользователя:', userId);
      syncStoresOnLogin(userId);
    } else {
      console.log('🔄 Ручная синхронизация для гостя');
      clearStoresOnLogout();
    }
  };
}

// === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ===
if (typeof window !== 'undefined') {
  // Функция для инициализации пользователя при загрузке
  const initializeUserStores = () => {
    const authStore = useAuthStore.getState();
    const cartStore = useCartStore.getState();
    const favoritesStore = useFavoritesStore.getState();
    
    if (authStore.user && authStore.userData) {
      const userId = authStore.user.email || authStore.user.uid || 'user';
      console.log('🔄 Инициализация хранилищ для пользователя:', userId);
      
      // Устанавливаем текущего пользователя
      if (cartStore.setCurrentUser) {
        cartStore.setCurrentUser(userId);
      }
      
      if (favoritesStore.setCurrentUser) {
        favoritesStore.setCurrentUser(userId);
      }
      
      // Синхронизируем данные
      if (cartStore.syncCartOnLogin) {
        cartStore.syncCartOnLogin(userId);
      }
      
      if (favoritesStore.syncFavoritesOnLogin) {
        favoritesStore.syncFavoritesOnLogin(userId);
      }
    } else {
      console.log('🔄 Инициализация гостевого режима');
      if (cartStore.setCurrentUser) {
        cartStore.setCurrentUser('guest');
      }
      
      if (favoritesStore.setCurrentUser) {
        favoritesStore.setCurrentUser('guest');
      }
    }
  };
  
  // Запускаем инициализацию после загрузки страницы
  window.addEventListener('load', initializeUserStores);
  
  // Также запускаем при изменении состояния аутентификации
  let unsubscribeAuth;
  setTimeout(() => {
    unsubscribeAuth = useAuthStore.subscribe((state) => {
      if (!state.isLoading) {
        initializeUserStores();
      }
    });
  }, 100);
  
  // Очистка при размонтировании (если нужно)
  window.addEventListener('beforeunload', () => {
    if (unsubscribeAuth) {
      unsubscribeAuth();
    }
  });
}

// Экспорт
export { 
  useCartStore, 
  useFavoritesStore, 
  useAuthStore, 
  syncStoresOnLogin, 
  clearStoresOnLogout 
};