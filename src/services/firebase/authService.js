import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Регистрация пользователя
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Определяем роль (админ или обычный пользователь)
    const role = email === 'admin@example.com' ? 'admin' : 'user';
    
    const userDoc = {
      uid: user.uid,
      email: user.email,
      displayName: userData.name || '',
      phone: userData.phone || '',
      role: role, // Сохраняем роль
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, 'users', user.uid), userDoc);
    
    if (userData.name) {
      await updateProfile(user, {
        displayName: userData.name
      });
    }
    
    return { user, userData: userDoc };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Логин пользователя
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Получаем или создаем документ пользователя
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    let userData;
    
    if (userDoc.exists()) {
      // Если документ уже существует
      userData = userDoc.data();
    } else {
      // Создаем новый документ для пользователя (особенно для админа)
      const role = email === 'admin@example.com' ? 'admin' : 'user';
      userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        role: role,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(userRef, userData);
    }
    
    return { user, userData };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Выход пользователя
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Получение текущего пользователя
// Получение текущего пользователя
export const getCurrentUser = async () => {
  const user = auth.currentUser;
  console.log('📞 getCurrentUser вызван, user:', user?.email);
  
  if (!user) {
    console.log('❌ Нет текущего пользователя');
    return null;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      console.log('✅ Данные пользователя найдены в Firestore');
      return {
        user,
        userData: userDoc.data()
      };
    } else {
      // Если документа нет, создаем его
      console.log('📝 Создаем документ пользователя...');
      const role = user.email === 'admin@example.com' ? 'admin' : 'user';
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        role: role,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      console.log('✅ Документ пользователя создан');
      return {
        user,
        userData
      };
    }
  } catch (error) {
    console.error('❌ Get user error:', error);
    return null;
  }
};