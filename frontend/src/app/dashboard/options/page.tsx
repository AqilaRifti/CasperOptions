'use client';

/**
 * Options Marketplace Page
 * Browse and buy LST call options
 */

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { PriceDisplay } from '@/features/options/components/price-display';
import { WalletButton } from '@/features/options/components/wallet-button';
import { OptionGrid, OptionStats } from '@/features/options/components/option-grid';
import { BuyModal } from '@/features/options/components/buy-modal';
import { CreateOptionForm } from '@/features/options/components/create-option-form';
import { PriceChart } from '@/features/options/components/price-chart';
import { useOptionsStore, useOptions, useOraclePrice } from '@/features/options/utils/store';

export default function OptionsMarketplacePage() {
    const { loadOptions, isLoadingOptions, wallet } = useOptionsStore();
    const options = useOptions();
    const oraclePrice = useOraclePrice();

    // Load options on mount
    useEffect(() => {
        loadOptions();
    }, [loadOptions]);

    return (
        <PageContainer
            pageTitle="LST Options Marketplace"
            pageDescription="Browse and buy call options on Casper Liquid Staking Tokens"
            pageHeaderAction={
                <div className="flex items-center gap-3">
                    <CreateOptionForm />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadOptions()}
                        disabled={isLoadingOptions}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingOptions ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <WalletButton />
                </div>
            }
        >
            <div className="space-y-6">
                {/* Price Chart and Stats */}
                <div className="grid gap-4 md:grid-cols-2">
                    <PriceChart currentPrice={oraclePrice} timeframe="1W" />
                    <div className="space-y-4">
                        <PriceDisplay />
                        <div className="rounded-xl border bg-card p-4">
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Market Overview</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-2xl font-bold">{options.length}</p>
                                    <p className="text-xs text-muted-foreground">Available Options</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">
                                        {options.filter(o => oraclePrice > o.strikePrice).length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">In The Money</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <OptionStats options={options} oraclePrice={oraclePrice} />

                {/* Connection Prompt */}
                {!wallet.isConnected && (
                    <div className="rounded-xl border border-dashed bg-muted/50 p-6 text-center">
                        <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Connect your Casper wallet to start trading LST options
                        </p>
                        <WalletButton />
                    </div>
                )}

                {/* Options Grid */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Available Options</h2>
                    <OptionGrid
                        options={options}
                        isLoading={isLoadingOptions}
                        showBuyButton={true}
                        emptyMessage="No options available for purchase"
                    />
                </div>
            </div>

            {/* Buy Modal */}
            <BuyModal />
        </PageContainer>
    );
}
