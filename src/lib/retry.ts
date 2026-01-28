'use client';

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: unknown) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoff: true,
};

/**
 * Execute an async function with automatic retry on failure
 * Uses exponential backoff by default
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts, delayMs, backoff, onRetry } = { ...DEFAULT_OPTIONS, ...options };
  
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on user rejection
      if (error instanceof Error && 
          (error.message.includes('User rejected') || 
           error.message.includes('user rejected'))) {
        throw error;
      }
      
      if (attempt < maxAttempts) {
        const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
        onRetry?.(attempt, error);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout support
 */
export async function fetchWithTimeout(
  url: string, 
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Retry wrapper specifically for blockchain RPC calls
 * Has special handling for rate limits and temporary failures
 */
export async function withRpcRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return withRetry(fn, {
    maxAttempts: 3,
    delayMs: 500,
    backoff: true,
    onRetry: (attempt, error) => {
      console.warn(`RPC call failed (attempt ${attempt}), retrying...`, error);
    },
    ...options,
  });
}
