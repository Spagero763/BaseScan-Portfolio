'use client';

import { AlertTriangle, WifiOff, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { Button } from './ui/button';

export function NetworkStatusBanner() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
      <WifiOff className="h-4 w-4" />
      <AlertTitle>No Internet Connection</AlertTitle>
      <AlertDescription>
        You appear to be offline. Some features may not work correctly until you reconnect.
      </AlertDescription>
    </Alert>
  );
}

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4 max-w-md">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      {resetErrorBoundary && (
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

/**
 * Parse and format blockchain transaction errors into user-friendly messages
 */
export function parseTransactionError(error: unknown): string {
  if (!error) return 'Transaction failed';
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // User rejection
  if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
    return 'Transaction was cancelled';
  }
  
  // Insufficient funds
  if (errorMessage.includes('insufficient funds') || errorMessage.includes('InsufficientFunds')) {
    return 'Insufficient ETH balance for this transaction';
  }
  
  // Gas estimation failed
  if (errorMessage.includes('gas required exceeds') || errorMessage.includes('out of gas')) {
    return 'Transaction would fail - check your balance and try a smaller amount';
  }
  
  // Network issues
  if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED')) {
    return 'Network error - please check your connection and try again';
  }
  
  // Contract revert
  if (errorMessage.includes('revert') || errorMessage.includes('execution reverted')) {
    const revertMatch = errorMessage.match(/reason="([^"]+)"/);
    if (revertMatch) {
      return `Contract error: ${revertMatch[1]}`;
    }
    return 'Transaction would fail - contract rejected the operation';
  }
  
  // Nonce issues
  if (errorMessage.includes('nonce')) {
    return 'Transaction nonce error - please refresh and try again';
  }
  
  // Default: return first line of error
  return errorMessage.split('\n')[0].slice(0, 100);
}

interface TransactionErrorProps {
  error: unknown;
  onRetry?: () => void;
}

export function TransactionError({ error, onRetry }: TransactionErrorProps) {
  const message = parseTransactionError(error);
  
  return (
    <Alert variant="destructive" className="mt-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Transaction Failed</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
