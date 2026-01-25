import { useEffect } from 'react';
import { useAuthStore } from '../../store/store';
import { syncStoresOnLogin, clearStoresOnLogout } from '../../store/store';

function AuthSync() {
  const { user, userData } = useAuthStore();

  useEffect(() => {
    console.log('🔄 AuthSync: статус пользователя изменился', user?.email);
    
    if (user && userData) {
      // Получаем ID пользователя
      const userId = user.email || user.uid || 'user';
      console.log('✅ Пользователь вошел:', userId);
      
      // Используем единую функцию синхронизации
      syncStoresOnLogin(userId);
    } else if (!user) {
      console.log('🚪 Пользователь вышел');
      // Используем единую функцию очистки
      clearStoresOnLogout();
    }
  }, [user, userData]);

  // Этот компонент не рендерит ничего видимого
  return null;
}

export default AuthSync;