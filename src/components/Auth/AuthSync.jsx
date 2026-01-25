import { useEffect } from 'react';
import { useAuthStore } from '../../store/store';
import { useCartStore } from '../../store/store';
import { useFavoritesStore } from '../../store/store';

function AuthSync() {
  const { user } = useAuthStore();
  const setCartUser = useCartStore((state) => state.setCurrentUser);
  const setFavoritesUser = useFavoritesStore((state) => state.setCurrentUser);
  const clearOnLogoutCart = useCartStore((state) => state.clearOnLogout);
  const clearOnLogoutFavorites = useFavoritesStore((state) => state.clearOnLogout);

  useEffect(() => {
    console.log('🔄 AuthSync: пользователь изменился', user?.uid);
    
    if (user) {
      // Пользователь вошел - уже обработано в InitAuth
      console.log('✅ Пользователь авторизован, корзина синхронизирована');
    } else {
      // Пользователь вышел
      console.log('🚪 Выход пользователя');
      clearOnLogoutCart();
      clearOnLogoutFavorites();
    }
  }, [user, clearOnLogoutCart, clearOnLogoutFavorites, setCartUser, setFavoritesUser]);

  return null;
}

export default AuthSync;