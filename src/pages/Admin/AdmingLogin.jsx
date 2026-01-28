import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/firebase/authService';
import { useAuthStore } from '../../store/store';

function AdminLogin() {
  const navigate = useNavigate();
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user, userData } = await loginUser(credentials.email, credentials.password);
      
      // Проверяем, является ли пользователь админом
      if (userData.role === 'admin') {
        setAuthData(user, userData);
        navigate('/admin/dashboard');
      } else {
        setError('Доступ запрещён. Только для администраторов.');
        // Но все равно сохраняем данные пользователя
        setAuthData(user, userData);
        navigate('/');
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      setError(error.message.includes('user-not-found') || error.message.includes('wrong-password')
        ? 'Неверный email или пароль'
        : 'Ошибка при входе'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Вход в админку
          </h1>
          <p className="text-gray-600">
            Доступ только для администраторов магазина
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={credentials.email}
              onChange={(e) => setCredentials({
                ...credentials,
                email: e.target.value
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль
            </label>
            <input
              type="password"
              required
              value={credentials.password}
              onChange={(e) => setCredentials({
                ...credentials,
                password: e.target.value
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            Тестовый доступ: admin@example.com / admin123
          </p>
          <div className="text-center mt-2">
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Войти как пользователь
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;