import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebase/config';

const InitAuth = () => {
  const { setUser } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('InitAuth: Starting...');
    
    // Сначала проверяем localStorage (быстрая проверка)
    const savedAuth = localStorage.getItem('auth-storage');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed.state?.user) {
          console.log('InitAuth: Found user in localStorage:', parsed.state.user.email);
          // Восстанавливаем из localStorage мгновенно
          setUser(parsed.state.user);
        }
      } catch (e) {
        console.error('InitAuth: Error parsing localStorage:', e);
      }
    }

    // Затем проверяем Firebase (фоновая проверка)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('InitAuth: Firebase check complete:', firebaseUser?.email);
      
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
        };
        
        // Обновляем если данные изменились
        setUser(userData);
      } else {
        // Если в Firebase нет, но в localStorage есть - очищаем
        setUser(null);
      }
      
      setIsInitialized(true);
    });

    // Если Firebase не ответил за 2 секунды, считаем что проверка завершена
    const timeout = setTimeout(() => {
      console.log('InitAuth: Timeout, continuing without Firebase');
      setIsInitialized(true);
    }, 2000);

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [setUser]);

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return null;
};

export default InitAuth;