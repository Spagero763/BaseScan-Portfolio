// Contract configuration
export const CONTRACT_ADDRESS = '0x2d71De053e0DEFbCE58D609E36568d874D07e1a5' as const;

// Price configuration
export const ETH_MOCK_PRICE = 2400;

// Minimum transaction amounts
export const MIN_DEPOSIT_AMOUNT = 0.01;
export const MIN_WITHDRAWAL_AMOUNT = 0.001;

// Chain configuration
export const SUPPORTED_CHAIN_ID = 8453; // Base mainnet
export const BASESCAN_URL = 'https://basescan.org';

// UI configuration
export const REFRESH_INTERVAL_MS = 30000;
export const TOAST_DURATION_MS = 5000;

// Transaction configuration
export const DEFAULT_GAS_LIMIT = 100000n;

// Performance: debounce delays
export const INPUT_DEBOUNCE_MS = 300;
export const SEARCH_DEBOUNCE_MS = 500;

// Performance: batch sizes
export const MAX_BLOCKS_PER_QUERY = 1000;
export const MAX_LOGS_PER_FETCH = 100;

// Cache TTLs (milliseconds)
export const BALANCE_CACHE_TTL = 10000;
export const PRICE_CACHE_TTL = 60000;
export const HISTORY_CACHE_TTL = 30000;
