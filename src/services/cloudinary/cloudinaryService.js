class CloudinaryService {
  constructor() {
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  }

  async uploadImage(file) {
    try {
      console.log('📤 Загрузка изображения:', file.name, 'размер:', Math.round(file.size / 1024), 'KB');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      
      // Дополнительные параметры для оптимизации
      formData.append('tags', 'chinese_store,product');
      formData.append('context', `caption=${file.name}`);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Cloudinary API Error:', errorData);
        throw new Error(`Cloudinary: ${errorData.error?.message || `HTTP ${response.status}`}`);
      }
      
      const data = await response.json();
      console.log('✅ Cloudinary ответ:', data);
      
      if (data.secure_url) {
        // Возвращаем оптимизированный URL
        return this.getOptimizedUrl(data.secure_url);
      } else {
        throw new Error('Нет URL в ответе Cloudinary');
      }
      
    } catch (error) {
      console.error('❌ Ошибка загрузки в Cloudinary:', error);
      throw error;
    }
  }

  async uploadMultipleImages(files) {
    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }

  getOptimizedUrl(originalUrl, options = {}) {
    if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
      return originalUrl;
    }
    
    const { width = 600, height = 600, quality = 'auto', format = 'auto' } = options;
    
    // Вставляем параметры оптимизации в URL
    return originalUrl.replace(
      '/upload/',
      `/upload/w_${width},h_${height},c_fill,q_${quality},f_${format}/`
    );
  }

  getThumbnailUrl(originalUrl) {
    return this.getOptimizedUrl(originalUrl, { width: 300, height: 300 });
  }
}

export const cloudinaryService = new CloudinaryService();