
'use client';

import { simpleVaultAbi } from '@/lib/abi';
import { formatEther } from 'viem';
import { usePublicClient } from 'wagmi';
import { useEffect, useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface Transaction {
    hash: string;
    type: 'Deposit' | 'Withdrawal';
    amount: string;
    blockNumber: bigint;
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

    const fetchHistory = useCallback(async () => {
        if (!userAddress || !publicClient) return;

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

            const depositLogs = await publicClient.getFilterLogs({ filter: depositFilter });
            const withdrawalLogs = await publicClient.getFilterLogs({ filter: withdrawalFilter });

            const deposits: Transaction[] = depositLogs.map(log => ({
                hash: log.transactionHash,
                type: 'Deposit',
                amount: formatEther((log.args as any).amount),
                blockNumber: log.blockNumber,
            }));

            const withdrawals: Transaction[] = withdrawalLogs.map(log => ({
                hash: log.transactionHash,
                type: 'Withdrawal',
                amount: formatEther((log.args as any).amount),
                blockNumber: log.blockNumber,
            }));

            const combined = [...deposits, ...withdrawals].sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));

            setTransactions(combined);
        } catch (error) {
            console.error("Failed to fetch transaction history:", error);
        } finally {
            setLoading(false);
        }
    }, [userAddress, publicClient, contractAddress]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory, triggerRefetch]);


    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
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
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Tx</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((tx) => (
                                <TableRow key={tx.hash}>
                                    <TableCell>
                                        <Badge variant={tx.type === 'Deposit' ? 'default' : 'secondary'} className={tx.type === 'Deposit' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                                            {tx.type}
                                        </Badge>
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
                    <p className="text-muted-foreground text-center py-8">No transactions yet.</p>
                )}
            </div>
        </div>
    )
}
