'use client';

/**
 * My Options Page
 * View owned options and exercise functionality
 */

import { useEffect, useMemo, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PriceDisplay } from '@/features/options/components/price-display';
import { WalletButton } from '@/features/options/components/wallet-button';
import { MyOptionCard } from '@/features/options/components/my-option-card';
import { ExerciseModal } from '@/features/options/components/exercise-modal';
import { PayoffChart } from '@/features/options/components/payoff-chart';
import { useOptionsStore, useMyOptions, useOraclePrice, useWallet } from '@/features/options/utils/store';
import { isInTheMoney, isExpired, calculateProfit, formatCspr } from '@/features/options/utils/calculations';
import { cn } from '@/lib/utils';
import type { Option } from '@/types/options';

export default function MyOptionsPage() {
    const { loadOptions, isLoadingOptions } = useOptionsStore();
    const myOptions = useMyOptions();
    const oraclePrice = useOraclePrice();
    const wallet = useWallet();
    const [selectedOption, setSelectedOption] = useState<Option | null>(null);

    // Load options on mount
    useEffect(() => {
        loadOptions();
    }, [loadOptions]);

    // Auto-select first active option for chart
    useEffect(() => {
        const active = myOptions.filter(o => !o.exercised && !isExpired(o));
        if (active.length > 0 && !selectedOption) {
            setSelectedOption(active[0]);
        }
    }, [myOptions, selectedOption]);

    // Calculate portfolio stats
    const stats = useMemo(() => {
        const active = myOptions.filter(o => !o.exercised && !isExpired(o));
        const exercised = myOptions.filter(o => o.exercised);
        const expired = myOptions.filter(o => isExpired(o) && !o.exercised);
        const itm = active.filter(o => isInTheMoney(o, oraclePrice));

        const totalPnL = myOptions.reduce((sum, o) => {
            const profit = calculateProfit(o, oraclePrice);
            return sum + profit.netProfit;
        }, 0);

        const totalPremiumPaid = myOptions.reduce((sum, o) => sum + o.premium, 0);

        return {
            total: myOptions.length,
            active: active.length,
            exercised: exercised.length,
            expired: expired.length,
            itm: itm.length,
            otm: active.length - itm.length,
            totalPnL,
            totalPremiumPaid,
        };
    }, [myOptions, oraclePrice]);

    // Filter options by status
    const activeOptions = myOptions.filter(o => !o.exercised && !isExpired(o));
    const exercisedOptions = myOptions.filter(o => o.exercised);
    const expiredOptions = myOptions.filter(o => isExpired(o) && !o.exercised);

    // Not connected state
    if (!wallet.isConnected) {
        return (
            <PageContainer
                pageTitle="My Options"
                pageDescription="View and manage your LST options portfolio"
                pageHeaderAction={<WalletButton />}
            >
                <div className="flex flex-col items-center justify-center py-16">
                    <Wallet className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                    <p className="text-muted-foreground text-center mb-6 max-w-md">
                        Connect your Casper wallet to view your options portfolio and exercise profitable positions.
                    </p>
                    <WalletButton />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            pageTitle="My Options"
            pageDescription="View and manage your LST options portfolio"
            pageHeaderAction={<WalletButton />}
        >
            <div className="space-y-6">
                {/* Price Display and Payoff Chart */}
                <div className="grid gap-4 md:grid-cols-2">
                    <PriceDisplay />
                    {selectedOption && (
                        <PayoffChart option={selectedOption} currentPrice={oraclePrice} />
                    )}
                </div>

                {/* Portfolio Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total P&L
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={cn(
                                'text-2xl font-bold',
                                stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                            )}>
                                {stats.totalPnL >= 0 ? '+' : ''}{formatCspr(stats.totalPnL)} CSPR
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Premium paid: {formatCspr(stats.totalPremiumPaid)} CSPR
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                In The Money
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">{stats.itm}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Ready to exercise for profit
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-orange-500" />
                                Out of Money
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-orange-500">{stats.otm}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Waiting for price movement
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-blue-500" />
                                Exercised
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-blue-600">{stats.exercised}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Successfully closed positions
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Options Tabs */}
                <Tabs defaultValue="active" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="active" className="gap-2">
                            <Clock className="h-4 w-4" />
                            Active ({stats.active})
                        </TabsTrigger>
                        <TabsTrigger value="exercised" className="gap-2">
                            <DollarSign className="h-4 w-4" />
                            Exercised ({stats.exercised})
                        </TabsTrigger>
                        <TabsTrigger value="expired" className="gap-2">
                            Expired ({stats.expired})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-4">
                        {activeOptions.length === 0 ? (
                            <EmptyState
                                icon={<Clock className="h-12 w-12" />}
                                title="No Active Options"
                                description="You don't have any active options. Visit the marketplace to buy some!"
                            />
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {activeOptions.map((option) => (
                                    <div
                                        key={option.id}
                                        onClick={() => setSelectedOption(option)}
                                        className={cn(
                                            "cursor-pointer transition-all",
                                            selectedOption?.id === option.id && "ring-2 ring-primary rounded-xl"
                                        )}
                                    >
                                        <MyOptionCard option={option} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="exercised" className="space-y-4">
                        {exercisedOptions.length === 0 ? (
                            <EmptyState
                                icon={<DollarSign className="h-12 w-12" />}
                                title="No Exercised Options"
                                description="Options you exercise will appear here."
                            />
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {exercisedOptions.map((option) => (
                                    <MyOptionCard key={option.id} option={option} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="expired" className="space-y-4">
                        {expiredOptions.length === 0 ? (
                            <EmptyState
                                icon={<Clock className="h-12 w-12" />}
                                title="No Expired Options"
                                description="Expired options that weren't exercised will appear here."
                            />
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {expiredOptions.map((option) => (
                                    <MyOptionCard key={option.id} option={option} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Exercise Modal */}
            <ExerciseModal />
        </PageContainer>
    );
}

function EmptyState({
    icon,
    title,
    description
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground/50 mb-4">{icon}</div>
            <h3 className="text-lg font-semibold text-muted-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">{description}</p>
        </div>
    );
}
