'use client';

import { useCallback, useMemo, useState } from 'react';

interface UseDebounceReturn<T> {
  value: T;
  debouncedValue: T;
  setValue: (value: T) => void;
  isPending: boolean;
}

export function useDebounce<T>(initialValue: T, delay: number = 500): UseDebounceReturn<T> {
  const [value, setValueState] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isPending, setIsPending] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const setValue = useCallback((newValue: T) => {
    setValueState(newValue);
    setIsPending(true);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const id = setTimeout(() => {
      setDebouncedValue(newValue);
      setIsPending(false);
    }, delay);

    setTimeoutId(id);
  }, [delay, timeoutId]);

  return useMemo(() => ({
    value,
    debouncedValue,
    setValue,
    isPending,
  }), [value, debouncedValue, setValue, isPending]);
}

/**
 * Simple debounce function for callbacks
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
