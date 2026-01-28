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
 * Sanitize and validate ETH input string
 * Returns cleaned string with only valid numeric characters
 */
export function sanitizeEthInput(value: string): string {
  // Remove any non-numeric characters except decimal point
  let sanitized = value.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit decimal places to 18 (ETH precision)
  if (parts.length === 2 && parts[1].length > 18) {
    sanitized = parts[0] + '.' + parts[1].slice(0, 18);
  }
  
  // Prevent leading zeros (except for "0.")
  if (sanitized.length > 1 && sanitized[0] === '0' && sanitized[1] !== '.') {
    sanitized = sanitized.replace(/^0+/, '') || '0';
  }
  
  return sanitized;
}

/**
 * Safely parse ETH input string to bigint
 */
export function safeParseEther(value: string): bigint | null {
  try {
    const sanitized = sanitizeEthInput(value);
    if (!sanitized || isNaN(parseFloat(sanitized)) || parseFloat(sanitized) <= 0) {
      return null;
    }
    return parseEther(sanitized);
  } catch {
    return null;
  }
}

/**
 * Validate ETH amount against balance
 */
export function validateAmount(amount: string, balance: bigint, minAmount: number = 0): { valid: boolean; error?: string } {
  const sanitized = sanitizeEthInput(amount);
  
  if (!sanitized || sanitized === '0') {
    return { valid: false, error: 'Please enter an amount' };
  }
  
  const numAmount = parseFloat(sanitized);
  if (isNaN(numAmount)) {
    return { valid: false, error: 'Invalid amount format' };
  }
  
  if (numAmount < minAmount) {
    return { valid: false, error: `Minimum amount is ${minAmount} ETH` };
  }
  
  try {
    const amountWei = parseEther(sanitized);
    if (amountWei > balance) {
      return { valid: false, error: 'Insufficient balance' };
    }
  } catch {
    return { valid: false, error: 'Invalid amount' };
  }
  
  return { valid: true };
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
