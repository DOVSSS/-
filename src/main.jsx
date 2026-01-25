// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Добавьте этот импорт
import './index.css';
import App from './App.jsx';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* Добавьте BrowserRouter здесь */}
      <App />
    </BrowserRouter>
  </StrictMode>,
);

// Регистрация service worker
if (import.meta.env.PROD) {
  serviceWorkerRegistration.register({
    onUpdate: (registration) => {
      if (registration.waiting) {
        if (window.confirm('Доступна новая версия приложения. Обновить?')) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      }
    }
  });
}