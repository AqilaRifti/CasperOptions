'use client';

/**
 * TransactionList Component
 * Displays recent transactions with explorer links
 */

import { ExternalLink, ArrowUpRight, ArrowDownRight, Plus, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Transaction, TransactionType, TransactionStatus } from '@/types/options';
import { useTransactions } from '../utils/store';
import { formatCspr, formatDateTime, truncateAddress } from '../utils/calculations';
import { getDeployUrl } from '../constants/config';
import { cn } from '@/lib/utils';

interface TransactionListProps {
    limit?: number;
    showHeader?: boolean;
    className?: string;
}

export function TransactionList({
    limit,
    showHeader = true,
    className
}: TransactionListProps) {
    const transactions = useTransactions();

    const displayTransactions = limit
        ? transactions.slice(0, limit)
        : transactions;

    if (displayTransactions.length === 0) {
        return (
            <Card className={className}>
                {showHeader && (
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Transactions</CardTitle>
                    </CardHeader>
                )}
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No transactions yet</p>
                        <p className="text-sm mt-1">Your transaction history will appear here</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            {showHeader && (
                <CardHeader>
                    <CardTitle className="text-lg">Recent Transactions</CardTitle>
                </CardHeader>
            )}
            <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                    <div className="divide-y">
                        {displayTransactions.map((tx) => (
                            <TransactionItem key={tx.id} transaction={tx} />
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

interface TransactionItemProps {
    transaction: Transaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
    const { type, optionId, deployHash, status, timestamp, amount } = transaction;

    const getTypeIcon = (type: TransactionType) => {
        switch (type) {
            case 'BUY':
                return <ArrowDownRight className="h-4 w-4" />;
            case 'EXERCISE':
                return <ArrowUpRight className="h-4 w-4" />;
            case 'CREATE':
                return <Plus className="h-4 w-4" />;
        }
    };

    const getTypeLabel = (type: TransactionType) => {
        switch (type) {
            case 'BUY':
                return 'Bought Option';
            case 'EXERCISE':
                return 'Exercised Option';
            case 'CREATE':
                return 'Created Option';
        }
    };

    const getTypeColor = (type: TransactionType) => {
        switch (type) {
            case 'BUY':
                return 'text-blue-600 bg-blue-500/10';
            case 'EXERCISE':
                return 'text-green-600 bg-green-500/10';
            case 'CREATE':
                return 'text-purple-600 bg-purple-500/10';
        }
    };

    const getStatusIcon = (status: TransactionStatus) => {
        switch (status) {
            case 'PENDING':
                return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
            case 'SUCCESS':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'FAILED':
                return <XCircle className="h-4 w-4 text-red-500" />;
        }
    };

    const getStatusBadge = (status: TransactionStatus) => {
        switch (status) {
            case 'PENDING':
                return (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                        Pending
                    </Badge>
                );
            case 'SUCCESS':
                return (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        Success
                    </Badge>
                );
            case 'FAILED':
                return (
                    <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">
                        Failed
                    </Badge>
                );
        }
    };

    return (
        <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
                {/* Type Icon */}
                <div className={cn(
                    'p-2 rounded-full',
                    getTypeColor(type)
                )}>
                    {getTypeIcon(type)}
                </div>

                {/* Details */}
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{getTypeLabel(type)}</span>
                        <span className="text-sm text-muted-foreground">#{optionId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDateTime(timestamp)}</span>
                        <span>•</span>
                        <span className="font-mono">{truncateAddress(deployHash)}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Amount */}
                <div className="text-right">
                    <p className={cn(
                        'font-mono font-medium',
                        type === 'BUY' && 'text-red-600',
                        type === 'EXERCISE' && amount > 0 && 'text-green-600',
                        type === 'CREATE' && 'text-muted-foreground'
                    )}>
                        {type === 'BUY' ? '-' : type === 'EXERCISE' && amount > 0 ? '+' : ''}
                        {formatCspr(Math.abs(amount))} CSPR
                    </p>
                    {getStatusBadge(status)}
                </div>

                {/* Explorer Link */}
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8"
                >
                    <a
                        href={getDeployUrl(deployHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on Explorer"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </Button>
            </div>
        </div>
    );
}

/**
 * Compact transaction list for sidebar/widget use
 */
export function TransactionListCompact({ limit = 5 }: { limit?: number }) {
    const transactions = useTransactions();
    const displayTransactions = transactions.slice(0, limit);

    if (displayTransactions.length === 0) {
        return (
            <div className="text-center py-4 text-sm text-muted-foreground">
                No recent transactions
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {displayTransactions.map((tx) => (
                <div
                    key={tx.id}
                    className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50"
                >
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            'text-xs font-medium px-1.5 py-0.5 rounded',
                            tx.type === 'BUY' && 'bg-blue-500/10 text-blue-600',
                            tx.type === 'EXERCISE' && 'bg-green-500/10 text-green-600',
                            tx.type === 'CREATE' && 'bg-purple-500/10 text-purple-600',
                        )}>
                            {tx.type}
                        </span>
                        <span className="text-muted-foreground">#{tx.optionId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono">
                            {tx.type === 'BUY' ? '-' : '+'}{formatCspr(Math.abs(tx.amount))}
                        </span>
                        {tx.status === 'PENDING' && (
                            <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
                        )}
                        {tx.status === 'SUCCESS' && (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                        )}
                        {tx.status === 'FAILED' && (
                            <XCircle className="h-3 w-3 text-red-500" />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
