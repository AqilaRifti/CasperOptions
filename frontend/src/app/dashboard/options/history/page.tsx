'use client';

/**
 * Transaction History Page
 * View all options transactions
 */

import { useEffect } from 'react';
import { History, Wallet } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { WalletButton } from '@/features/options/components/wallet-button';
import { TransactionList } from '@/features/options/components/transaction-list';
import { useOptionsStore, useWallet, useTransactions } from '@/features/options/utils/store';

export default function TransactionHistoryPage() {
    const { loadOptions } = useOptionsStore();
    const wallet = useWallet();
    const transactions = useTransactions();

    // Load options/transactions on mount
    useEffect(() => {
        loadOptions();
    }, [loadOptions]);

    // Not connected state
    if (!wallet.isConnected) {
        return (
            <PageContainer
                pageTitle="Transaction History"
                pageDescription="View your options trading activity"
                pageHeaderAction={<WalletButton />}
            >
                <div className="flex flex-col items-center justify-center py-16">
                    <Wallet className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                    <p className="text-muted-foreground text-center mb-6 max-w-md">
                        Connect your Casper wallet to view your transaction history.
                    </p>
                    <WalletButton />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            pageTitle="Transaction History"
            pageDescription="View your options trading activity"
            pageHeaderAction={<WalletButton />}
        >
            <div className="space-y-6">
                {/* Stats Summary */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Total Transactions</p>
                        <p className="text-2xl font-bold mt-1">{transactions.length}</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Purchases</p>
                        <p className="text-2xl font-bold mt-1 text-blue-600">
                            {transactions.filter(t => t.type === 'BUY').length}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Exercises</p>
                        <p className="text-2xl font-bold mt-1 text-green-600">
                            {transactions.filter(t => t.type === 'EXERCISE').length}
                        </p>
                    </div>
                </div>

                {/* Transaction List */}
                <TransactionList showHeader={false} />
            </div>
        </PageContainer>
    );
}
