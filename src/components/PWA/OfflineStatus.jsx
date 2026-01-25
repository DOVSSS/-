import React, { useState, useEffect } from 'react';
import { FiWifi, FiWifiOff } from 'react-icons/fi';

const OfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-64 z-50 animate-fade-in">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-3">
        <FiWifiOff className="text-yellow-600" />
        <div>
          <p className="font-medium text-yellow-800">Оффлайн режим</p>
          <p className="text-sm text-yellow-600">Некоторые функции могут быть недоступны</p>
        </div>
      </div>
    </div>
  );
};

export default OfflineStatus;