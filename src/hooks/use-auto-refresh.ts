'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutoRefreshOptions {
  interval: number;
  enabled?: boolean;
  onRefresh: () => Promise<void> | void;
}

export function useAutoRefresh({ interval, enabled = true, onRefresh }: UseAutoRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const onRefreshRef = useRef(onRefresh);

  // Keep callback ref updated without triggering effect re-runs
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const refresh = useCallback(async () => {
    if (isRefreshing || !isMountedRef.current) return;
    
    setIsRefreshing(true);
    try {
      await onRefreshRef.current();
      if (isMountedRef.current) {
        setLastRefreshed(new Date());
      }
    } catch (error) {
      console.error('Auto refresh failed:', error);
    } finally {
      if (isMountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [isRefreshing]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Clear any existing interval before setting a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(refresh, interval);

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, refresh]);

  return {
    isRefreshing,
    lastRefreshed,
    refresh,
  };
}
