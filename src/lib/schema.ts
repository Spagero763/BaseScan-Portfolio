import { z } from 'zod';

export const portfolioOptimizerSchema = z.object({
  currentHoldings: z.string().min(1, { message: 'Please describe your current holdings.' }),
  riskTolerance: z.enum(['low', 'medium', 'high'], { required_error: 'Please select your risk tolerance.' }),
  investmentGoals: z.enum(['growth', 'income', 'capital_preservation'], { required_error: 'Please select your investment goal.' }),
  walletBalance: z.string().optional(),
});

export type PortfolioOptimizerSchema = z.infer<typeof portfolioOptimizerSchema>;
