import { useEffect } from 'react';
import { auth } from '../../services/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getCurrentUser } from '../../services/firebase/authService';
import { useAuthStore, useCartStore, useFavoritesStore } from '../../store/store';
import Loader from '../Loader/Loader';

function InitAuth({ children }) {
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  const setCartUser = useCartStore((state) => state.setCurrentUser);
  const setFavoritesUser = useFavoritesStore((state) => state.setCurrentUser);
  const syncCartOnLogin = useCartStore((state) => state.syncCartOnLogin);
  const syncFavoritesOnLogin = useFavoritesStore((state) => state.syncFavoritesOnLogin);

  useEffect(() => {
    console.log('🔐 InitAuth: начата инициализация аутентификации');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('👤 Firebase auth state changed:', user?.email);
      
      if (user) {
        try {
          console.log('🔄 Получение данных пользователя...');
          const authData = await getCurrentUser();
          
          if (authData) {
            console.log('✅ Пользователь установлен:', authData.user.email);
            
            // Устанавливаем пользователя в хранилищах
            setCartUser(user.uid);
            setFavoritesUser(user.uid);
            
            // Синхронизируем данные (объединяем гостевые и пользовательские)
            setTimeout(() => {
              syncCartOnLogin(user.uid);
              syncFavoritesOnLogin(user.uid);
            }, 100);
            
            // Устанавливаем данные аутентификации
            setAuthData(authData.user, authData.userData);
          } else {
            console.log('⚠️ Данные пользователя не получены');
            clearAuth();
            setCartUser('guest');
            setFavoritesUser('guest');
          }
        } catch (error) {
          console.error('❌ Auth state error:', error);
          clearAuth();
          setCartUser('guest');
          setFavoritesUser('guest');
        }
      } else {
        console.log('👋 Пользователь не авторизован');
        clearAuth();
        setCartUser('guest');
        setFavoritesUser('guest');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setAuthData, clearAuth, setLoading, setCartUser, setFavoritesUser, syncCartOnLogin, syncFavoritesOnLogin]);

  if (isLoading) {
    console.log('⏳ Загрузка аутентификации...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  console.log('🚀 InitAuth готов, рендерим children');
  return children;
}

export default InitAuth;