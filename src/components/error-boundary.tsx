'use client';

import { AlertTriangle, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useNetworkStatus } from '@/hooks/use-network-status';

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
