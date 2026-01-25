import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUpload, 
  FaSpinner, 
  FaCheck, 
  FaTimes,
  FaImage,
  FaExclamationTriangle,
  FaCloudUploadAlt
} from 'react-icons/fa';
import { db } from '../../services/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cloudinaryService } from '../../services/cloudinary/cloudinaryService';

function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: 'electronics',
  });
  
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadMode, setUploadMode] = useState('cloudinary'); // 'cloudinary' или 'demo'

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Проверяем общее количество
    const maxImages = 5;
    const totalImages = images.length + files.length;
    
    if (totalImages > maxImages) {
      setError(`Максимальное количество изображений: ${maxImages}`);
      return;
    }
    
    // Проверяем размер файлов (макс 5MB)
    const oversized = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      setError('Некоторые файлы слишком большие (макс 5MB)');
      return;
    }
    
    // Создаем preview
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false,
      url: null,
      error: null
    }));
    
    setImages([...images, ...newImages]);
    setError('');
    
    // Очищаем input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    // Освобождаем blob URL
    if (images[index].preview) {
      URL.revokeObjectURL(images[index].preview);
    }
    
    setImages(images.filter((_, i) => i !== index));
    setError('');
  };

  const uploadImageToCloudinary = async (imageObj) => {
    try {
      const uploadedUrl = await cloudinaryService.uploadImage(imageObj.file);
      
      return {
        ...imageObj,
        url: uploadedUrl,
        uploaded: true,
        uploading: false,
        error: null
      };
      
    } catch (error) {
      console.error('Ошибка Cloudinary:', error);
      return {
        ...imageObj,
        uploaded: false,
        uploading: false,
        error: error.message || 'Ошибка загрузки'
      };
    }
  };

  // Демо-изображения для теста
  const getDemoImages = (count) => {
    const demoImages = [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop&auto=format'
    ];
    
    return demoImages.slice(0, count);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    setSuccessMessage('');
    
    // Валидация
    if (!formData.title.trim()) {
      setError('Введите название товара');
      setUploading(false);
      return;
    }
    
    if (!formData.price || Number(formData.price) <= 0) {
      setError('Введите корректную цену');
      setUploading(false);
      return;
    }
    
    if (images.length === 0) {
      setError('Добавьте хотя бы одно изображение');
      setUploading(false);
      return;
    }
    
    try {
      let imageUrls = [];
      
      if (uploadMode === 'cloudinary') {
        // Загрузка в Cloudinary
        setUploadProgress(10);
        
        // Обновляем статус изображений
        setImages(images.map(img => ({ ...img, uploading: true })));
        
        // Загружаем все изображения
        const uploadPromises = images.map(img => uploadImageToCloudinary(img));
        const uploadedImages = await Promise.all(uploadPromises);
        
        setUploadProgress(50);
        setImages(uploadedImages);
        
        // Проверяем ошибки
        const failedUploads = uploadedImages.filter(img => img.error);
        if (failedUploads.length > 0) {
          const errorMessages = failedUploads.map(img => img.error).join(', ');
          setError(`Ошибки загрузки: ${errorMessages}. Попробуйте демо-режим.`);
          setUploading(false);
          setUploadProgress(0);
          return;
        }
        
        // Получаем URL
        imageUrls = uploadedImages
          .filter(img => img.url)
          .map(img => img.url);
          
        setUploadProgress(70);
        
      } else {
        // Демо-режим
        imageUrls = getDemoImages(images.length);
        setUploadProgress(50);
      }
      
      if (imageUrls.length === 0) {
        setError('Не удалось получить изображения');
        setUploading(false);
        setUploadProgress(0);
        return;
      }
      
      // Создаем продукт в Firestore
      const productData = {
        title: formData.title.trim(),
        price: Number(formData.price),
        description: formData.description.trim() || 'Описание отсутствует',
        category: formData.category,
        images: imageUrls,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        sales: 0,
        stock: 100,
        sku: `PROD-${Date.now()}`,
        rating: 0,
        reviews: 0
      };
      
      console.log('📤 Сохранение товара в Firestore...');
      
      const productsRef = collection(db, 'products');
      const docRef = await addDoc(productsRef, productData);
      
      setUploadProgress(100);
      
      // Успех
      setSuccessMessage(`✅ Товар "${formData.title}" успешно добавлен! ID: ${docRef.id}`);
      console.log('✅ Товар добавлен с ID:', docRef.id);
      
      // Очищаем форму через 2 секунды
      setTimeout(() => {
        setFormData({
          title: '',
          price: '',
          description: '',
          category: 'electronics',
        });
        
        // Освобождаем blob URLs
        images.forEach(img => {
          if (img.preview) URL.revokeObjectURL(img.preview);
        });
        setImages([]);
        setUploadProgress(0);
        
        navigate('/admin/dashboard/products');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Ошибка добавления товара:', error);
      setError(`Ошибка: ${error.message}`);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current && images.length < 5) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Шапка */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Добавить товар</h1>
        <p className="text-gray-600 mt-2">
          Заполните информацию о товаре
        </p>
      </div>
      
      {/* Режим загрузки */}
      <div className="mb-6 bg-white rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">Режим загрузки изображений</h3>
            <p className="text-sm text-gray-600 mt-1">
              {uploadMode === 'cloudinary' 
                ? 'Изображения будут загружены в Cloudinary' 
                : 'Будут использованы демо-изображения'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUploadMode('cloudinary')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                uploadMode === 'cloudinary' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={uploading}
            >
              <FaCloudUploadAlt />
              Cloudinary
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('demo')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                uploadMode === 'demo' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={uploading}
            >
              Демо-режим
            </button>
          </div>
        </div>
        
        {uploadMode === 'cloudinary' && !import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Cloudinary не настроен. Настройте .env файл или используйте демо-режим.
            </p>
          </div>
        )}
      </div>
      
      {/* Сообщения */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">{error}</p>
            {error.includes('Cloudinary') && (
              <button
                onClick={() => setUploadMode('demo')}
                className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
              >
                Перейти в демо-режим
              </button>
            )}
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg flex items-start gap-3">
          <FaCheck className="text-green-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">{successMessage}</p>
            <p className="text-sm mt-1">Перенаправляем к списку товаров...</p>
          </div>
        </div>
      )}
      
      {/* Прогресс бар */}
      {uploadProgress > 0 && (
        <div className="mb-6 bg-white rounded-xl p-6 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-700">
              {uploadMode === 'cloudinary' ? 'Загрузка в Cloudinary' : 'Демо-режим'}
            </span>
            <span className="font-bold text-blue-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                uploadMode === 'cloudinary' ? 'bg-blue-600' : 'bg-purple-600'
              }`}
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Секция изображений */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Изображения товара</h2>
              <p className="text-gray-600 text-sm mt-1">
                Загрузите до 5 изображений. Первое изображение будет главным.
                {uploadMode === 'demo' && ' (в демо-режиме используются тестовые изображения)'}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {images.length} / 5
            </div>
          </div>
          
          {/* Превью изображений */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className={`aspect-square rounded-xl overflow-hidden border-2 ${
                  image.error ? 'border-red-300' : 
                  image.uploaded ? 'border-green-300' : 
                  image.uploading ? 'border-blue-300' :
                  'border-gray-200'
                }`}>
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Индикатор состояния */}
                  {image.uploading && (
                    <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center">
                      <FaSpinner className="text-blue-500 text-2xl animate-spin" />
                    </div>
                  )}
                  
                  {image.uploaded && (
                    <div className="absolute inset-0 bg-green-50/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaCheck className="text-green-500 text-xl" />
                    </div>
                  )}
                  
                  {image.error && (
                    <div className="absolute inset-0 bg-red-50/90 flex items-center justify-center">
                      <FaExclamationTriangle className="text-red-500 text-xl" />
                    </div>
                  )}
                </div>
                
                {/* Кнопка удаления */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  disabled={uploading}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <FaTimes className="text-xs" />
                </button>
                
                {/* Статус */}
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-500 truncate">
                    {image.uploading ? 'Загрузка...' : 
                     image.uploaded ? 'Загружено' : 
                     image.error ? 'Ошибка' : 'Готово'}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Кнопка добавления */}
            {images.length < 5 && (
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={uploading}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors flex flex-col items-center justify-center group"
              >
                <FaUpload className="text-3xl text-gray-400 group-hover:text-blue-400 mb-3" />
                <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">
                  Добавить
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  JPG, PNG, WebP
                </span>
              </button>
            )}
          </div>
          
          {/* Скрытый input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading || images.length >= 5}
          />
        </div>
        
        {/* Основная информация */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Основная информация</h2>
          
          <div className="space-y-6">
            {/* Название */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название товара *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
                placeholder="Например: Смартфон Xiaomi Redmi Note 12 Pro"
                disabled={uploading}
              />
            </div>
            
            {/* Цена и категория */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена (₽) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
                  placeholder="9999"
                  disabled={uploading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Категория *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
                  disabled={uploading}
                >
                  <option value="electronics">📱 Электроника</option>
                  <option value="clothing">👕 Одежда</option>
                  <option value="home">🏠 Для дома</option>
                  <option value="sports">⚽ Спорт</option>
                  <option value="toys">🎮 Игрушки</option>
                  <option value="beauty">💄 Красота</option>
                </select>
              </div>
            </div>
            
            {/* Описание */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание товара
              </label>
              <textarea
                rows="5"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
                placeholder="Подробное описание товара, характеристики, преимущества..."
                disabled={uploading}
              />
            </div>
          </div>
        </div>
        
        {/* Кнопки действий */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard/products')}
            disabled={uploading}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-4 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FaTimes />
            Отмена
          </button>
          
          <button
            type="submit"
            disabled={uploading || !formData.title || !formData.price || images.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
          >
            {uploading ? (
              <>
                <FaSpinner className="animate-spin" />
                {uploadMode === 'cloudinary' ? 'Загрузка в Cloudinary...' : 'Добавление...'}
              </>
            ) : (
              <>
                <FaCheck />
                Добавить товар
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;