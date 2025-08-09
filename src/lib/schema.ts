import { z } from 'zod';

export const portfolioOptimizerSchema = z.object({
  currentHoldings: z.string().min(20, { message: 'Please provide a more detailed description of your holdings (at least 20 characters).' }),
  riskTolerance: z.enum(['low', 'medium', 'high'], { required_error: 'Please select your risk tolerance.' }),
  investmentGoals: z.enum(['growth', 'income', 'capital_preservation'], { required_error: 'Please select your investment goal.' }),
});

export type PortfolioOptimizerSchema = z.infer<typeof portfolioOptimizerSchema>;
