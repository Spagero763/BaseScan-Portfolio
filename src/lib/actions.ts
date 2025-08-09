'use server';

import { aiPortfolioOptimizer, AiPortfolioOptimizerInput } from '@/ai/flows/portfolio-optimizer';
import { portfolioOptimizerSchema } from './schema';
import { z } from 'zod';

export async function getPortfolioAnalysis(data: z.infer<typeof portfolioOptimizerSchema>) {
  const parsedData = portfolioOptimizerSchema.safeParse(data);

  if (!parsedData.success) {
    const errorMessages = parsedData.error.issues.map((issue) => issue.message).join(', ');
    return { error: `Invalid input: ${errorMessages}` };
  }
  
  // The AI flow expects string descriptions, which the schema provides.
  const aiInput: AiPortfolioOptimizerInput = {
    ...parsedData.data,
    riskTolerance: `The user's risk tolerance is ${parsedData.data.riskTolerance}.`,
    investmentGoals: `The user's investment goals are focused on ${parsedData.data.investmentGoals.replace('_', ' ')}.`,
  };

  try {
    const result = await aiPortfolioOptimizer(aiInput);
    return { success: result };
  } catch (error) {
    console.error('AI Portfolio Optimizer Error:', error);
    return { error: 'An unexpected error occurred while analyzing the portfolio.' };
  }
}
