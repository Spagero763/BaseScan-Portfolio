import { z } from 'zod';

export const portfolioOptimizerSchema = z.object({
  currentHoldings: z.string().min(1, { message: 'Please describe your current holdings.' }),
  riskTolerance: z.enum(['low', 'medium', 'high'], { required_error: 'Please select your risk tolerance.' }),
  investmentGoals: z.enum(['growth', 'income', 'capital_preservation'], { required_error: 'Please select your investment goal.' }),
  walletBalance: z.string().optional(),
  timeHorizon: z.enum(['short', 'medium', 'long']).optional(),
});

export type PortfolioOptimizerSchema = z.infer<typeof portfolioOptimizerSchema>;

// Deposit validation schema
export const depositSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)), 'Must be a valid number')
    .refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0')
    .refine((val) => parseFloat(val) >= 0.01, 'Minimum deposit is 0.01 ETH'),
});

export type DepositSchema = z.infer<typeof depositSchema>;

// Withdrawal validation schema
export const withdrawalSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)), 'Must be a valid number')
    .refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0'),
});

export type WithdrawalSchema = z.infer<typeof withdrawalSchema>;

// Address validation
export const ethereumAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

export type EthereumAddress = z.infer<typeof ethereumAddressSchema>;
