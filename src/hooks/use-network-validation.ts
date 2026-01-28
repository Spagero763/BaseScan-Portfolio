'use client';

import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { useCallback, useMemo } from 'react';
import { SUPPORTED_CHAIN_ID } from '@/lib/constants';

interface UseNetworkValidationReturn {
  isCorrectNetwork: boolean;
  isWrongNetwork: boolean;
  currentChainId: number | undefined;
  expectedChainId: number;
  switchToBase: () => Promise<void>;
  isSwitching: boolean;
  networkName: string;
}

/**
 * Hook to validate and manage network state
 * Ensures user is on Base mainnet before transactions
 */
export function useNetworkValidation(): UseNetworkValidationReturn {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isCorrectNetwork = useMemo(() => {
    if (!isConnected) return true; // Don't block if not connected
    return chainId === SUPPORTED_CHAIN_ID;
  }, [isConnected, chainId]);

  const isWrongNetwork = useMemo(() => {
    if (!isConnected) return false;
    return chainId !== SUPPORTED_CHAIN_ID;
  }, [isConnected, chainId]);

  const networkName = useMemo(() => {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 8453: return 'Base';
      case 84532: return 'Base Sepolia';
      case 10: return 'Optimism';
      case 42161: return 'Arbitrum';
      case 137: return 'Polygon';
      default: return `Chain ${chainId}`;
    }
  }, [chainId]);

  const switchToBase = useCallback(async () => {
    try {
      await switchChain({ chainId: base.id });
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  }, [switchChain]);

  return {
    isCorrectNetwork,
    isWrongNetwork,
    currentChainId: chainId,
    expectedChainId: SUPPORTED_CHAIN_ID,
    switchToBase,
    isSwitching,
    networkName,
  };
}

/**
 * Validate network before executing a transaction
 * Returns a wrapped function that checks network first
 */
export function useNetworkGuardedAction<T extends (...args: any[]) => any>(
  action: T,
  onWrongNetwork?: () => void
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  const { isCorrectNetwork, switchToBase } = useNetworkValidation();

  return useCallback((...args: Parameters<T>) => {
    if (!isCorrectNetwork) {
      onWrongNetwork?.();
      // Attempt to switch networks
      switchToBase().catch(() => {});
      return undefined;
    }
    return action(...args);
  }, [isCorrectNetwork, action, onWrongNetwork, switchToBase]) as any;
}
