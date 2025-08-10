
'use client';

import type { AiPortfolioOptimizerOutput } from '@/ai/flows/portfolio-optimizer';
import { getPortfolioAnalysis } from '@/lib/actions';
import { portfolioOptimizerSchema, type PortfolioOptimizerSchema } from '@/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAccount, useReadContract, useBalance } from 'wagmi';
import { simpleVaultAbi } from '@/lib/abi';
import { formatEther } from 'viem';
import { CardGlass } from './ui/card-glass';

export function AiOptimizer({ userBalanceInEth: propBalance }: { userBalanceInEth: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiPortfolioOptimizerOutput | null>(null);
  const { toast } = useToast();
  const { address, isConnected } = useAccount();

   const { data: userVaultBalanceData } = useReadContract({
    abi: simpleVaultAbi,
    address: '0x2d71De053e0DEFbCE58D609E36568d874D07e1a5',
    functionName: 'getBalance',
    args: [address!],
    query: {
      enabled: isConnected && open,
    }
  });

  const { data: userWalletBalanceData } = useBalance({
    address: address,
    query: {
      enabled: isConnected && open,
    }
  });

  const form = useForm<PortfolioOptimizerSchema>({
    resolver: zodResolver(portfolioOptimizerSchema),
    defaultValues: {
      currentHoldings: '',
    },
  });

  useEffect(() => {
    if (open) {
      const vaultBalance = userVaultBalanceData ? parseFloat(formatEther(userVaultBalanceData as bigint)) : 0;
      const walletBalance = userWalletBalanceData ? parseFloat(formatEther(userWalletBalanceData.value)) : 0;
      
      let holdings = '';
      if (vaultBalance > 0) {
        holdings += `I have ${vaultBalance.toFixed(4)} ETH in the Simple Vault.`;
      }
      if (walletBalance > 0) {
        holdings += `\nI also have ${walletBalance.toFixed(4)} ETH in my wallet.`;
      }
      form.setValue('currentHoldings', holdings.trim() || '');
      
      if(userWalletBalanceData) {
        form.setValue('walletBalance', `${parseFloat(formatEther(userWalletBalanceData.value)).toFixed(4)} ETH`);
      }

    } else {
      form.reset();
    }
  }, [userVaultBalanceData, userWalletBalanceData, open, form]);


  async function onSubmit(values: PortfolioOptimizerSchema) {
    setLoading(true);
    setResult(null);
    const response = await getPortfolioAnalysis(values);
    setLoading(false);

    if (response.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.error,
      });
    } else if (response.success) {
      setResult(response.success);
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
      setResult(null);
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <Sparkles className="mr-2 h-4 w-4" />
          AI Portfolio Optimizer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-card/80 dark:bg-card/60 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="text-primary" />
            AI-Powered Portfolio Optimizer
          </DialogTitle>
          <DialogDescription>
            Get personalized recommendations to optimize your portfolio based on your goals and risk tolerance.
          </DialogDescription>
        </DialogHeader>
        
        {result ? (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <Card className="bg-transparent border-border/50">
              <CardHeader><CardTitle className="text-lg text-primary">Recommendations</CardTitle></CardHeader>
              <CardContent><p className="text-card-foreground/80">{result.recommendations}</p></CardContent>
            </Card>
            <Card className="bg-transparent border-border/50">
              <CardHeader><CardTitle className="text-lg text-primary">Risk Analysis</CardTitle></CardHeader>
              <CardContent><p className="text-card-foreground/80">{result.riskAnalysis}</p></CardContent>
            </Card>
             <Card className="bg-transparent border-border/50">
              <CardHeader><CardTitle className="text-lg text-primary">Return Analysis</CardTitle></CardHeader>
              <CardContent><p className="text-card-foreground/80">{result.returnAnalysis}</p></CardContent>
            </Card>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentHoldings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Holdings</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 50% ETH, 25% DEGEN, 25% in a liquidity pool on Aerodrome."
                        className="resize-none bg-background/50 border-input"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="riskTolerance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Tolerance</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50 border-input"><SelectValue placeholder="Select your risk tolerance" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="investmentGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Goals</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50 border-input"><SelectValue placeholder="Select your primary goal" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="growth">Growth</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="capital_preservation">Capital Preservation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Get Analysis'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
