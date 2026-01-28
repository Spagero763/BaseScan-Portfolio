import { formatEther, parseEther } from 'viem';
import { ETH_MOCK_PRICE } from './constants';

/**
 * Format ETH amount to a human-readable string
 */
export function formatEthAmount(value: bigint, decimals: number = 4): string {
  return parseFloat(formatEther(value)).toFixed(decimals);
}

/**
 * Format ETH amount to USD value
 */
export function formatEthToUsd(ethAmount: number, price: number = ETH_MOCK_PRICE): string {
  return (ethAmount * price).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Safely parse ETH input string to bigint
 */
export function safeParseEther(value: string): bigint | null {
  try {
    if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
      return null;
    }
    return parseEther(value);
  } catch {
    return null;
  }
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format gas fee in ETH
 */
export function formatGasFee(gasEstimate: bigint, gasPrice: bigint): string {
  const fee = gasEstimate * gasPrice;
  return parseFloat(formatEther(fee)).toFixed(6);
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Format large numbers with abbreviations
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

/**
 * Validate Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
