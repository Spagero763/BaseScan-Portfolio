

'use client';

import { useToast } from '@/hooks/use-toast';
import {
  ExternalLink,
  Landmark,
  RefreshCw,
  Share2,
  TrendingUp,
  Wallet,
  ArrowRight,
  Loader2,
  User,
  Shield,
  Fuel,
  LineChart as LineChartIcon,
  Info,
} from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { AiOptimizer } from './ai-optimizer';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAccount, useConnect, useDisconnect, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract, useEstimateGas, useFeeData, usePublicClient } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { parseEther, formatEther, formatGwei } from 'viem';
import { simpleVaultAbi } from '@/lib/abi';
import { Input } from './ui/input';
import { TransactionHistory } from './transaction-history';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const contractAddress = '0x2d71De053e0DEFbCE58D609E36568d874D07e1a5';

interface VaultEvent {
    type: 'Deposit' | 'Withdrawal';
    amount: bigint;
    blockNumber: bigint;
    timestamp: number;
}

interface ChartDataPoint {
    date: string;
    balance: number;
}

function ConnectWalletButton() {
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <Button onClick={() => disconnect()} variant="secondary" className="bg-white/10 hover:bg-white/20 border border-white/20">
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => connect({ connector: injected() })}
      className="bg-accent hover:bg-accent/90"
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}

function GasFeeEstimator({ amount, type, enabled }: { amount: string; type: 'deposit' | 'withdraw'; enabled: boolean }) {
    const { data: feeData } = useFeeData();

    const estimateQuery = useEstimateGas({
        address: contractAddress,
        abi: simpleVaultAbi,
        functionName: type,
        value: type === 'deposit' ? parseEther(amount || '0') : 0n,
        args: type === 'withdraw' ? [parseEther(amount || '0')] : [],
        query: {
            enabled: enabled && !!amount && parseFloat(amount) > 0 && !!feeData?.gasPrice,
        },
    });

    const estimatedFee = useMemo(() => {
        if (estimateQuery.data && feeData?.gasPrice) {
            const fee = estimateQuery.data * feeData.gasPrice;
            return formatEther(fee);
        }
        return null;
    }, [estimateQuery.data, feeData?.gasPrice]);
    
    if (!estimatedFee) return null;

    return (
        <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Fuel className="w-3 h-3 mr-1" />
            Estimated Fee: ~{parseFloat(estimatedFee).toFixed(6)} ETH
        </div>
    );
}

export default function PortfolioDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const fetchVaultHistory = useCallback(async () => {
    if (!publicClient) return;

    try {
      const depositFilter = await publicClient.createEventFilter({
        address: contractAddress,
        event: {
          type: 'event',
          name: 'Deposit',
          inputs: [{ type: 'address', name: 'user', indexed: true }, { type: 'uint256', name: 'amount' }],
        },
        fromBlock: 'earliest',
      });

      const withdrawalFilter = await publicClient.createEventFilter({
        address: contractAddress,
        event: {
          type: 'event',
          name: 'Withdrawal',
          inputs: [{ type: 'address', name: 'user', indexed: true }, { type: 'uint256', name: 'amount' }],
        },
        fromBlock: 'earliest',
      });

      const [depositLogs, withdrawalLogs] = await Promise.all([
          publicClient.getFilterLogs({ filter: depositFilter }),
          publicClient.getFilterLogs({ filter: withdrawalFilter }),
      ]);
      
      const blocks = await Promise.all(
        [...depositLogs, ...withdrawalLogs].map(log => publicClient.getBlock({ blockNumber: log.blockNumber }))
      );
      const blockMap = new Map(blocks.map(block => [block.number, block]));

      const deposits: VaultEvent[] = depositLogs.map(log => ({
        type: 'Deposit',
        amount: (log.args as any).amount,
        blockNumber: log.blockNumber,
        timestamp: Number(blockMap.get(log.blockNumber)!.timestamp) * 1000
      }));

      const withdrawals: VaultEvent[] = withdrawalLogs.map(log => ({
        type: 'Withdrawal',
        amount: (log.args as any).amount,
        blockNumber: log.blockNumber,
        timestamp: Number(blockMap.get(log.blockNumber)!.timestamp) * 1000
      }));

      const combined = [...deposits, ...withdrawals].sort((a, b) => a.timestamp - b.timestamp);
      
      let currentBalance = 0n;
      const data: ChartDataPoint[] = [];

      if (combined.length > 0) {
        data.push({ date: format(new Date(combined[0].timestamp - 86400000), 'MMM d'), balance: 0 });
      }

      for (const event of combined) {
        if (event.type === 'Deposit') {
          currentBalance += event.amount;
        } else {
          currentBalance -= event.amount;
        }
        data.push({
          date: format(new Date(event.timestamp), 'MMM d'),
          balance: parseFloat(formatEther(currentBalance)),
        });
      }

      setChartData(data);

    } catch (error) {
      console.error("Failed to fetch vault history:", error);
    }
  }, [publicClient]);

  useEffect(() => {
    fetchVaultHistory();
  }, [fetchVaultHistory]);


  const chartConfig = {
    balance: {
      label: 'Vault Balance (ETH)',
      color: 'hsl(var(--accent))',
    },
  } satisfies ChartConfig;

  const { data: contractBalanceData, refetch: refetchContractBalance } = useBalance({
    address: contractAddress,
  });

  const { data: userVaultBalanceData, refetch: refetchUserVaultBalance } = useReadContract({
    abi: simpleVaultAbi,
    address: contractAddress,
    functionName: 'getBalance',
    args: [address!],
    query: {
      enabled: isConnected,
    }
  });

  const { data: contractOwnerAddress } = useReadContract({
    abi: simpleVaultAbi,
    address: contractAddress,
    functionName: 'owner',
    query: {
        enabled: isConnected,
    }
  });

  const isOwner = isConnected && address === contractOwnerAddress;

  const { data: depositHash, writeContract: deposit, isPending: isDepositLoading, error: depositError } = useWriteContract();

    const { isLoading: isDepositConfirming, isSuccess: isDepositConfirmed } = useWaitForTransactionReceipt({ 
        hash: depositHash,
    });

  const { data: withdrawHash, writeContract: withdraw, isPending: isWithdrawLoading, error: withdrawError } = useWriteContract();

  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawConfirmed } = useWaitForTransactionReceipt({ 
      hash: withdrawHash,
  });

  useEffect(() => {
    if (isDepositConfirmed || isWithdrawConfirmed) {
      toast({ 
        title: 'Transaction Confirmed!', 
        description: 'Your balances have been updated.',
        variant: 'default'
      });
      refetchContractBalance();
      refetchUserVaultBalance();
      fetchVaultHistory();
      if(isDepositConfirmed) setDepositAmount('');
      if(isWithdrawConfirmed) setWithdrawAmount('');
    }
  }, [isDepositConfirmed, isWithdrawConfirmed, refetchContractBalance, refetchUserVaultBalance, toast, fetchVaultHistory]);

  useEffect(() => {
    if (depositError) {
      toast({
        variant: 'destructive',
        title: 'Deposit Error',
        description: depositError.message.split('\n')[0],
      });
    }
     if (withdrawError) {
      toast({
        variant: 'destructive',
        title: 'Withdrawal Error',
        description: withdrawError.message.split('\n')[0],
      });
    }
  }, [depositError, withdrawError, toast]);
  

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetchContractBalance();
    refetchUserVaultBalance();
    fetchVaultHistory();
    toast({
      title: 'Refreshing portfolio data...',
    });
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: 'Data refreshed!',
        description: 'Your portfolio is up to date.',
      });
    }, 1500);
  };

  const handleShare = () => {
    const shareText = '🏦 My Base Portfolio Update:\n💰 Total: $2,847.32\n📈 Performance: +12.4% (24h)\n🔥 Vault APY: 5.2%';
    navigator.clipboard.writeText(shareText).then(
      () => {
        toast({
          title: 'Copied to clipboard!',
          description: 'You can now share your portfolio on Farcaster.',
        });
      },
      () => {
        toast({
          variant: 'destructive',
          title: 'Failed to copy',
          description: 'Could not copy text to clipboard.',
        });
      }
    );
  };

  const handleDeposit = () => {
    if (!depositAmount || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0) {
      toast({ variant: 'destructive', title: 'Invalid amount', description: 'Please enter a valid amount to deposit.' });
      return;
    }
    if (parseFloat(depositAmount) < 0.01) {
      toast({ variant: 'destructive', title: 'Deposit too small', description: 'Minimum deposit amount is 0.01 ETH.' });
      return;
    }
    deposit({
      address: contractAddress,
      abi: simpleVaultAbi,
      functionName: 'deposit',
      value: parseEther(depositAmount),
    }, {
      onSuccess: () => {
        toast({ title: 'Transaction Sent', description: 'Waiting for confirmation...' });
      }
    });
  };
  
  const handleWithdraw = () => {
    if (!withdrawAmount || isNaN(parseFloat(withdrawAmount)) || parseFloat(withdrawAmount) <= 0) {
      toast({ variant: 'destructive', title: 'Invalid amount', description: 'Please enter a valid amount to withdraw.' });
      return;
    }
    const requestedAmount = parseEther(withdrawAmount);

    if (userVaultBalanceData !== undefined && requestedAmount > userVaultBalanceData) {
        toast({
            variant: 'destructive',
            title: 'Insufficient Balance',
            description: 'You cannot withdraw more than you have in the vault.',
        });
        return;
    }

    withdraw({
      address: contractAddress,
      abi: simpleVaultAbi,
      functionName: 'withdraw',
      args: [requestedAmount],
    }, {
      onSuccess: () => {
        toast({ title: 'Transaction Sent', description: 'Waiting for confirmation...' });
      }
    });
  };

  const CardGlass = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div
      className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 transition-all duration-300 hover:border-white/30 hover:-translate-y-1 ${className}`}
    >
      {children}
    </div>
  );

  return (
    <div className={`transition-opacity duration-500 ${isRefreshing ? 'opacity-60' : 'opacity-100'}`}>
      <header className="flex justify-between items-center mb-10 md:mb-16">
        <div className="text-left">
           <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-br from-white to-blue-200" style={{textShadow: '0 4px 20px rgba(255,255,255,0.2)'}}>
            Base Portfolio Tracker
          </h1>
          <p className="text-lg md:text-xl text-blue-200/90 font-light">
            Real-time DeFi portfolio analytics on Base network
          </p>
        </div>
        <ConnectWalletButton />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 mb-10 md:mb-16">
        <CardGlass className="relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex-row items-center gap-4 p-0 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold">Total Portfolio</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-accent to-white mb-1">$2,847.32</p>
            <p className="text-sm text-green-400 font-medium">+12.4% (24h)</p>
          </CardContent>
        </CardGlass>
        
        <CardGlass>
          <CardHeader className="flex-row items-center gap-4 p-0 mb-4">
             <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold">Your Vault Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <p className="text-4xl font-bold mb-1">
              {isConnected && userVaultBalanceData !== undefined ? `${parseFloat(formatEther(userVaultBalanceData as bigint)).toFixed(4)} ETH` : '0.00 ETH'}
            </p>
            <p className="text-sm text-blue-300/80 font-medium">≈ ${isConnected && userVaultBalanceData !== undefined ? (parseFloat(formatEther(userVaultBalanceData as bigint)) * 2400).toFixed(2) : '0.00'}</p>
          </CardContent>
        </CardGlass>

        <CardGlass>
          <CardHeader className="flex-row items-center gap-4 p-0 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold">Total Vault Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-4xl font-bold mb-1">
              {contractBalanceData ? `${parseFloat(formatEther(contractBalanceData.value)).toFixed(4)} ETH` : '0.00 ETH'}
            </p>
            <p className="text-sm text-blue-300/80 font-medium">≈ ${contractBalanceData ? (parseFloat(formatEther(contractBalanceData.value)) * 2400).toFixed(2) : '0.00'}</p>
          </CardContent>
        </CardGlass>

        <CardGlass>
          <CardHeader className="flex-row items-center gap-4 p-0 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold">Yield Earned</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-4xl font-bold text-accent animate-pulse mb-1">5.2%</p>
            <p className="text-sm text-blue-300/80 font-medium">Annual APY</p>
          </CardContent>
        </CardGlass>
      </div>

      <div className="mb-10 md:mb-16">
        <CardGlass>
            <CardHeader className="flex-row items-center gap-4 p-0 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                    <LineChartIcon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Vault Growth</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-80">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8} 
                      tickFormatter={(value) => value}
                      style={{ fill: 'hsla(var(--muted-foreground))', fontSize: '12px' }}
                    />
                    <YAxis
                       tickLine={false}
                       axisLine={false}
                       tickMargin={8}
                       tickFormatter={(value) => `${value} ETH`}
                       style={{ fill: 'hsla(var(--muted-foreground))', fontSize: '12px' }}
                     />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" labelClassName="text-background" className="bg-foreground" />}
                    />
                    <Line
                      dataKey="balance"
                      type="monotone"
                      stroke="var(--color-balance)"
                      strokeWidth={2}
                      dot={false}
                    />
                </LineChart>
              </ChartContainer>
            </CardContent>
        </CardGlass>
      </div>

      {isOwner && (
        <div className="mb-10 md:mb-16">
            <CardGlass>
                <CardHeader className="flex-row items-center gap-4 p-0 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <p className="text-muted-foreground">Welcome, owner. Here you can manage the vault.</p>
                    {/* Admin features will go here */}
                </CardContent>
            </CardGlass>
        </div>
      )}
      
      {!isConnected ? (
        <CardGlass>
          <CardHeader className="flex-row items-center gap-4 p-0 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                  <Info className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <p className="text-muted-foreground">Welcome to the Base Portfolio Tracker! To get started, connect your wallet.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-2">1. Connect Your Wallet</h3>
                    <p className="text-sm text-blue-300/70">Click the "Connect Wallet" button in the top right to get started.</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-2">2. Deposit ETH</h3>
                    <p className="text-sm text-blue-300/70">Once connected, you can deposit ETH into the vault to start earning yield.</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-2">3. Track Your Portfolio</h3>
                    <p className="text-sm text-blue-300/70">Your balances and transaction history will appear here once you've made a deposit.</p>
                </div>
            </div>
          </CardContent>
        </CardGlass>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 md:mb-16">
          <CardGlass>
            <h2 className="text-2xl font-bold mb-4">Vault Actions</h2>
            <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Deposit ETH</h3>
                  <div className="flex gap-2">
                    <Input 
                      type="text" 
                      placeholder="Amount in ETH" 
                      className="bg-slate-800/50 border-slate-700"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      disabled={isDepositLoading || isDepositConfirming}
                    />
                    <Button onClick={handleDeposit} disabled={isDepositLoading || isDepositConfirming}>
                      {isDepositLoading && <><Loader2 className="animate-spin" /> Sending...</>}
                      {isDepositConfirming && <><Loader2 className="animate-spin" /> Confirming...</>}
                      {!isDepositLoading && !isDepositConfirming && 'Deposit'}
                    </Button>
                  </div>
                   <GasFeeEstimator amount={depositAmount} type="deposit" enabled={isConnected} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Withdraw ETH</h3>
                  <div className="flex gap-2">
                     <Input 
                      type="text" 
                      placeholder="Amount in ETH" 
                      className="bg-slate-800/50 border-slate-700"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      disabled={isWithdrawLoading || isWithdrawConfirming}
                    />
                    <Button onClick={handleWithdraw} variant="secondary" disabled={isWithdrawLoading || isWithdrawConfirming}>
                      {isWithdrawLoading && <><Loader2 className="animate-spin" /> Sending...</>}
                      {isWithdrawConfirming && <><Loader2 className="animate-spin" /> Confirming...</>}
                      {!isWithdrawLoading && !isWithdrawConfirming && 'Withdraw'}
                    </Button>
                  </div>
                  <GasFeeEstimator amount={withdrawAmount} type="withdraw" enabled={isConnected && userVaultBalanceData !== undefined && parseEther(withdrawAmount || '0') <= userVaultBalanceData} />
                </div>
            </div>
          </CardGlass>
          <CardGlass>
            <TransactionHistory 
              contractAddress={contractAddress}
              userAddress={address}
              triggerRefetch={isDepositConfirmed || isWithdrawConfirmed}
            />
          </CardGlass>
        </div>
      )}

      <CardGlass>
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
          <h2 className="text-2xl font-bold mb-2 md:mb-0">Base Simple Vault</h2>
          <Badge variant="secondary" className="bg-green-500/20 border-green-400 text-green-300 self-start md:self-center">
            ✅ Active
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-center">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-xs uppercase text-blue-300/70 tracking-wider mb-1">Contract Address</p>
            <p className="font-mono text-sm break-all">{contractAddress}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-xs uppercase text-blue-300/70 tracking-wider mb-1">Status</p>
            <p className="font-semibold text-accent">Verified ✅</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-xs uppercase text-blue-300/70 tracking-wider mb-1">Total Locked</p>
            <p className="font-bold text-lg">{contractBalanceData ? `${parseFloat(formatEther(contractBalanceData.value)).toFixed(2)} ETH` : '...'}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-xs uppercase text-blue-300/70 tracking-wider mb-1">Share Ratio</p>
            <p className="font-bold text-lg">1.15</p>
          </div>
        </div>
      </CardGlass>

      <div className="flex flex-wrap gap-4 justify-center mt-8">
        <AiOptimizer />
        <Button asChild variant="secondary" className="bg-white/10 hover:bg-white/20 border border-white/20">
          <a href={`https://basescan.org/address/${contractAddress}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" /> View on BaseScan
          </a>
        </Button>
        <Button variant="secondary" onClick={handleShare} className="bg-white/10 hover:bg-white/20 border border-white/20">
          <Share2 className="mr-2 h-4 w-4" /> Share on Farcaster
        </Button>
        <Button
          variant="secondary"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-white/10 hover:bg-white/20 border border-white/20"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Data
        </Button>
      </div>

      <footer className="text-center mt-16 pt-8 border-t border-white/10">
        <p className="text-sm text-white/50">Built for Base Builder Rewards • Powered by Base Network</p>
      </footer>
    </div>
  );
}
    

    

    

    




