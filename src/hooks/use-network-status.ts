'use client';

import { useState, useEffect, useCallback } from 'react';

type NetworkStatus = 'online' | 'offline' | 'unknown';

interface UseNetworkStatusReturn {
  status: NetworkStatus;
  isOnline: boolean;
  isOffline: boolean;
  lastOnline: Date | null;
}

export function useNetworkStatus(): UseNetworkStatusReturn {
  const [status, setStatus] = useState<NetworkStatus>('unknown');
  const [lastOnline, setLastOnline] = useState<Date | null>(null);

  const updateOnlineStatus = useCallback(() => {
    const isOnline = navigator.onLine;
    setStatus(isOnline ? 'online' : 'offline');
    if (isOnline) {
      setLastOnline(new Date());
    }
  }, []);

  useEffect(() => {
    // Set initial status
    updateOnlineStatus();

    // Add event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [updateOnlineStatus]);

  return {
    status,
    isOnline: status === 'online',
    isOffline: status === 'offline',
    lastOnline,
  };
}
