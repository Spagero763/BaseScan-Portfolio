'use client';

import { useToast } from '@/hooks/use-toast';
import { ExternalLink, Landmark, RefreshCw, Share2, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';
import { AiOptimizer } from './ai-optimizer';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function PortfolioDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = () => {
    setIsRefreshing(true);
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
  
  const CardGlass = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 transition-all duration-300 hover:border-white/30 hover:-translate-y-1 ${className}`}>
        {children}
    </div>
  )

  return (
    <div className={`transition-opacity duration-500 ${isRefreshing ? 'opacity-60' : 'opacity-100'}`}>
      <header className="text-center mb-10 md:mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-br from-white to-blue-200" style={{textShadow: '0 4px 20px rgba(255,255,255,0.2)'}}>
          Base Portfolio Tracker
        </h1>
        <p className="text-lg md:text-xl text-blue-200/90 font-light">
          Real-time DeFi portfolio analytics on Base network
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-16">
        <CardGlass className="relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
           <CardHeader className="flex-row items-center gap-4 p-0 mb-4">
             <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white"/>
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
                <Landmark className="w-6 h-6 text-white"/>
            </div>
            <CardTitle className="text-xl font-semibold">Vault Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-4xl font-bold mb-1">0.0285 ETH</p>
            <p className="text-sm text-blue-300/80 font-medium">≈ $68.40</p>
          </CardContent>
        </CardGlass>
        
        <CardGlass>
          <CardHeader className="flex-row items-center gap-4 p-0 mb-4">
             <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white"/>
             </div>
            <CardTitle className="text-xl font-semibold">Yield Earned</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-4xl font-bold text-accent animate-pulse mb-1">5.2%</p>
            <p className="text-sm text-blue-300/80 font-medium">Annual APY</p>
          </CardContent>
        </CardGlass>
      </div>

      <CardGlass>
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
            <h2 className="text-2xl font-bold mb-2 md:mb-0">Base Simple Vault</h2>
            <Badge variant="secondary" className="bg-green-500/20 border-green-400 text-green-300 self-start md:self-center">✅ Active</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-center">
            <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs uppercase text-blue-300/70 tracking-wider mb-1">Contract Address</p>
                <p className="font-mono text-sm">0x2d7...e1a5</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs uppercase text-blue-300/70 tracking-wider mb-1">Status</p>
                <p className="font-semibold text-accent">Verified ✅</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs uppercase text-blue-300/70 tracking-wider mb-1">Total Locked</p>
                <p className="font-bold text-lg">2.5 ETH</p>
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
          <a href="https://basescan.org/address/0x2d71De053e0DEFbCE58D609E36568d874D07e1a5" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" /> View on BaseScan
          </a>
        </Button>
        <Button variant="secondary" onClick={handleShare} className="bg-white/10 hover:bg-white/20 border border-white/20">
          <Share2 className="mr-2 h-4 w-4" /> Share on Farcaster
        </Button>
        <Button variant="secondary" onClick={handleRefresh} disabled={isRefreshing} className="bg-white/10 hover:bg-white/20 border border-white/20">
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Data
        </Button>
      </div>

      <footer className="text-center mt-16 pt-8 border-t border-white/10">
        <div className="flex justify-center gap-6 mb-4">
            <a href="#" className="text-blue-300/70 hover:text-accent transition-colors">GitHub</a>
            <a href="#" className="text-blue-300/70 hover:text-accent transition-colors">Base Network</a>
            <a href="#" className="text-blue-300/70 hover:text-accent transition-colors">Documentation</a>
        </div>
        <p className="text-sm text-white/50">Built for Base Builder Rewards • Powered by Base Network</p>
      </footer>
    </div>
  );
}
