import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebase/config';

const AuthChecker = () => {
  const { setUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log('AuthChecker: Starting auth check...');
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('AuthChecker: Firebase auth state changed:', firebaseUser?.email);
      
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      
      setIsChecking(false);
      console.log('AuthChecker: Auth check complete');
    });

    return () => unsubscribe();
  }, [setUser]);

  if (isChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Загрузка приложения...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthChecker;