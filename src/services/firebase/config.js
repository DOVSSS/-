import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Ваши конфигурационные данные (замените на свои)
const firebaseConfig = {
  apiKey: "AIzaSyD7ABZHbIvA-SmMwcWd1ZuNeHGBbkpL5YU",
  authDomain: "china-is-neerby.firebaseapp.com",
  projectId: "china-is-neerby",
  storageBucket: "china-is-neerby.firebasestorage.app",
  messagingSenderId: "827977059746",
  appId: "1:827977059746:web:185feb81b59fa5790536fb"

};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Сервисы
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;