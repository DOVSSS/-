import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// === ПРОСТАЯ КОРЗИНА БЕЗ ПРИВЯЗКИ К ПОЛЬЗОВАТЕЛЮ ===
const useSimpleCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (product) => {
        console.log('🛒 Добавление товара:', product.title);
        
        set((state) => {
          const existingItem = state.items.find(item => item.id === product.id);
          
          let newItems;
          if (existingItem) {
            newItems = state.items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                : item
            );
          } else {
            newItems = [...state.items, { 
              ...product, 
              quantity: product.quantity || 1 
            }];
          }
          
          console.log('✅ Товар добавлен, всего в корзине:', newItems.length);
          return { items: newItems };
        });
      },
      
      removeFromCart: (productId) => set((state) => ({
        items: state.items.filter(item => item.id !== productId)
      })),
      
      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      })),
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getTotalItems: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'simple-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useSimpleCartStore };