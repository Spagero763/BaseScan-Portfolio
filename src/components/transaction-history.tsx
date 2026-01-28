
'use client';

import { simpleVaultAbi } from '@/lib/abi';
import { formatEther } from 'viem';
import { usePublicClient } from 'wagmi';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ScrollText, Clock } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { CardHeader, CardContent, CardTitle } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

interface Transaction {
    hash: string;
    type: 'Deposit' | 'Withdrawal';
    amount: string;
    blockNumber: bigint;
    timestamp?: number;
}

interface TransactionHistoryProps {
    contractAddress: `0x${string}`;
    userAddress?: `0x${string}`;
    triggerRefetch: boolean;
}

export function TransactionHistory({ contractAddress, userAddress, triggerRefetch }: TransactionHistoryProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const publicClient = usePublicClient();
    const fetchIdRef = useRef(0);
    const isMountedRef = useRef(true);

    const fetchHistory = useCallback(async () => {
        if (!userAddress || !publicClient) return;

        const currentFetchId = ++fetchIdRef.current;
        setLoading(true);

        try {
            const depositFilter = await publicClient.createEventFilter({
                address: contractAddress,
                event: {
                    type: 'event',
                    name: 'Deposit',
                    inputs: [{ type: 'address', name: 'user', indexed: true }, { type: 'uint256', name: 'amount' }],
                },
                args: {
                    user: userAddress,
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
                args: {
                    user: userAddress,
                },
                fromBlock: 'earliest',
            });

            // Check if this fetch is still relevant
            if (currentFetchId !== fetchIdRef.current || !isMountedRef.current) return;

            const depositLogs = await publicClient.getFilterLogs({ filter: depositFilter });
            const withdrawalLogs = await publicClient.getFilterLogs({ filter: withdrawalFilter });

            // Another stale check after async operations
            if (currentFetchId !== fetchIdRef.current || !isMountedRef.current) return;

            // Fetch block timestamps for all logs
            const allLogs = [...depositLogs, ...withdrawalLogs];
            const uniqueBlockNumbers = [...new Set(allLogs.map(log => log.blockNumber))];
            const blocks = await Promise.all(
                uniqueBlockNumbers.map(blockNum => publicClient.getBlock({ blockNumber: blockNum }))
            );
            
            if (currentFetchId !== fetchIdRef.current || !isMountedRef.current) return;
            
            const blockTimestamps = new Map(blocks.map(block => [block.number, Number(block.timestamp) * 1000]));

            const deposits: Transaction[] = depositLogs.map(log => ({
                hash: log.transactionHash,
                type: 'Deposit',
                amount: formatEther((log.args as any).amount),
                blockNumber: log.blockNumber,
                timestamp: blockTimestamps.get(log.blockNumber),
            }));

            const withdrawals: Transaction[] = withdrawalLogs.map(log => ({
                hash: log.transactionHash,
                type: 'Withdrawal',
                amount: formatEther((log.args as any).amount),
                blockNumber: log.blockNumber,
                timestamp: blockTimestamps.get(log.blockNumber),
            }));

            const combined = [...deposits, ...withdrawals].sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));

            // Final stale check before updating state
            if (currentFetchId === fetchIdRef.current && isMountedRef.current) {
                setTransactions(combined);
            }
        } catch (error) {
            console.error("Failed to fetch transaction history:", error);
        } finally {
            if (currentFetchId === fetchIdRef.current && isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [userAddress, publicClient, contractAddress]);

    useEffect(() => {
        isMountedRef.current = true;
        fetchHistory();
        
        return () => {
            isMountedRef.current = false;
        };
    }, [fetchHistory, triggerRefetch]);


    return (
        <div>
            <CardHeader>
                <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="max-h-60 overflow-y-auto pr-2">
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : transactions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Tx</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => (
                                    <TableRow key={tx.hash}>
                                        <TableCell>
                                            <Badge variant={tx.type === 'Deposit' ? 'default' : 'secondary'} className={tx.type === 'Deposit' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}>
                                                {tx.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {tx.timestamp ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {new Date(tx.timestamp).toLocaleString()}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{parseFloat(tx.amount).toFixed(4)} ETH</TableCell>
                                        <TableCell className="text-right">
                                            <a href={`https://basescan.org/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="inline-block hover:text-accent">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-4 text-center py-8">
                            <div className="text-4xl text-muted-foreground/20">
                                <ScrollText />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg text-muted-foreground">No History Yet</h3>
                                <p className="text-sm text-muted-foreground/70">Your recent transactions will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </div>
    )
}
