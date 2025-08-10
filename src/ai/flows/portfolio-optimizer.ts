// This file uses server-side code, and must have the `'use server'` directive.
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AiPortfolioOptimizerInputSchema = z.object({
  currentHoldings: z
    .string()
    .describe('A description of the user\'s current portfolio holdings.'),
  riskTolerance: z
    .string()
    .describe('The user\'s risk tolerance (e.g., high, medium, low).'),
  investmentGoals: z
    .string()
    .describe('The user\'s investment goals (e.g., growth, income, capital preservation).'),
  walletBalance: z.string().optional().describe("The user's native ETH wallet balance."),
});
export type AiPortfolioOptimizerInput = z.infer<typeof AiPortfolioOptimizerInputSchema>;

const AiPortfolioOptimizerOutputSchema = z.object({
  recommendations: z.string().describe('AI-powered recommendations for optimizing the portfolio.'),
  riskAnalysis: z.string().describe('An analysis of the portfolio risk.'),
  returnAnalysis: z.string().describe('An analysis of the portfolio return.'),
});
export type AiPortfolioOptimizerOutput = z.infer<typeof AiPortfolioOptimizerOutputSchema>;

export async function aiPortfolioOptimizer(input: AiPortfolioOptimizerInput): Promise<AiPortfolioOptimizerOutput> {
  return aiPortfolioOptimizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPortfolioOptimizerPrompt',
  input: {schema: AiPortfolioOptimizerInputSchema},
  output: {schema: AiPortfolioOptimizerOutputSchema},
  prompt: `You are an AI-powered portfolio optimization tool. Based on the user's current holdings, risk tolerance, and investment goals, provide personalized recommendations for optimizing their portfolio. Also, provide a risk and return analysis.

Current Holdings: {{{currentHoldings}}}
{{#if walletBalance}}
Wallet Balance: {{{walletBalance}}}
{{/if}}
Risk Tolerance: {{{riskTolerance}}}
Investment Goals: {{{investmentGoals}}}

Recommendations:`,
});

const aiPortfolioOptimizerFlow = ai.defineFlow(
  {
    name: 'aiPortfolioOptimizerFlow',
    inputSchema: AiPortfolioOptimizerInputSchema,
    outputSchema: AiPortfolioOptimizerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
