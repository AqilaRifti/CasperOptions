'use client';

/**
 * OptionGrid Component
 * Responsive grid layout for displaying options
 */

import { useMemo } from 'react';
import { PackageOpen } from 'lucide-react';
import type { Option } from '@/types/options';
import { OptionCard } from './option-card';
import { sortOptionsByExpiry } from '../utils/calculations';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface OptionGridProps {
    options: Option[];
    isLoading?: boolean;
    showBuyButton?: boolean;
    showExerciseButton?: boolean;
    emptyMessage?: string;
    className?: string;
}

export function OptionGrid({
    options,
    isLoading = false,
    showBuyButton = true,
    showExerciseButton = false,
    emptyMessage = 'No options available',
    className,
}: OptionGridProps) {
    // Sort options by expiry (nearest first)
    const sortedOptions = useMemo(() => {
        return sortOptionsByExpiry(options);
    }, [options]);

    // Loading state
    if (isLoading) {
        return (
            <div className={cn(
                'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
                className
            )}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <OptionCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    // Empty state
    if (sortedOptions.length === 0) {
        return (
            <div className={cn(
                'flex flex-col items-center justify-center py-16 text-center',
                className
            )}>
                <PackageOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">
                    {emptyMessage}
                </h3>
                <p className="text-sm text-muted-foreground/70 mt-1">
                    Check back later for new opportunities
                </p>
            </div>
        );
    }

    return (
        <div className={cn(
            'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            className
        )}>
            {sortedOptions.map((option) => (
                <OptionCard
                    key={option.id}
                    option={option}
                    showBuyButton={showBuyButton}
                    showExerciseButton={showExerciseButton}
                />
            ))}
        </div>
    );
}

/**
 * Skeleton loader for option cards
 */
function OptionCardSkeleton() {
    return (
        <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-12" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-8 w-20" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-8 w-16" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-5 w-20" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </div>

            <div className="flex justify-between pt-2 border-t">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
            </div>

            <Skeleton className="h-16 w-full rounded-lg" />

            <Skeleton className="h-10 w-full" />
        </div>
    );
}

/**
 * Stats summary for option grid
 */
interface OptionStatsProps {
    options: Option[];
    oraclePrice: number;
    className?: string;
}

export function OptionStats({ options, oraclePrice, className }: OptionStatsProps) {
    const stats = useMemo(() => {
        const active = options.filter(o => !o.exercised && new Date(o.expiry) > new Date());
        const itm = active.filter(o => oraclePrice > o.strikePrice);
        const otm = active.filter(o => oraclePrice <= o.strikePrice);
        const totalValue = active.reduce((sum, o) => sum + o.premium, 0);
        const totalVolume = active.reduce((sum, o) => sum + (o.amount * o.strikePrice), 0);

        // Expiring soon (within 24 hours)
        const expiringSoon = active.filter(o => {
            const hoursToExpiry = (new Date(o.expiry).getTime() - Date.now()) / (1000 * 60 * 60);
            return hoursToExpiry <= 24 && hoursToExpiry > 0;
        });

        // Whale options (amount >= 500)
        const whaleOptions = active.filter(o => o.amount >= 500);

        // Average strike price
        const avgStrike = active.length > 0
            ? active.reduce((sum, o) => sum + o.strikePrice, 0) / active.length
            : 0;

        // Deep ITM (strike < 95% of current price)
        const deepItm = active.filter(o => o.strikePrice < oraclePrice * 0.95);

        // Deep OTM (strike > 115% of current price)
        const deepOtm = active.filter(o => o.strikePrice > oraclePrice * 1.15);

        return {
            total: options.length,
            active: active.length,
            itm: itm.length,
            otm: otm.length,
            totalValue,
            totalVolume,
            expiringSoon: expiringSoon.length,
            whaleOptions: whaleOptions.length,
            avgStrike,
            deepItm: deepItm.length,
            deepOtm: deepOtm.length,
        };
    }, [options, oraclePrice]);

    return (
        <div className={cn('space-y-4', className)}>
            {/* Main Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                    label="Total Options"
                    value={stats.total}
                    icon="📊"
                />
                <StatCard
                    label="Active"
                    value={stats.active}
                    icon="🔥"
                />
                <StatCard
                    label="In The Money"
                    value={stats.itm}
                    variant="success"
                    icon="💰"
                />
                <StatCard
                    label="Out of Money"
                    value={stats.otm}
                    variant="warning"
                    icon="📉"
                />
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                    label="Expiring Soon"
                    value={stats.expiringSoon}
                    variant={stats.expiringSoon > 0 ? 'danger' : 'default'}
                    icon="⏰"
                    subtitle="< 24 hours"
                />
                <StatCard
                    label="Whale Positions"
                    value={stats.whaleOptions}
                    icon="🐋"
                    subtitle="≥ 500 LST"
                />
                <StatCard
                    label="Deep ITM"
                    value={stats.deepItm}
                    variant="success"
                    icon="🎯"
                    subtitle="< 95% spot"
                />
                <StatCard
                    label="Deep OTM"
                    value={stats.deepOtm}
                    variant="warning"
                    icon="🚀"
                    subtitle="> 115% spot"
                />
            </div>

            {/* Volume Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">💎</span>
                        <p className="text-xs text-muted-foreground">Total Premium Value</p>
                    </div>
                    <p className="text-2xl font-bold mt-1 font-mono">
                        {stats.totalValue.toFixed(2)} <span className="text-sm text-muted-foreground">CSPR</span>
                    </p>
                </div>
                <div className="rounded-xl border bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">📈</span>
                        <p className="text-xs text-muted-foreground">Total Notional Volume</p>
                    </div>
                    <p className="text-2xl font-bold mt-1 font-mono">
                        {stats.totalVolume.toFixed(0)} <span className="text-sm text-muted-foreground">CSPR</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: number | string;
    variant?: 'default' | 'success' | 'warning' | 'danger';
    icon?: string;
    subtitle?: string;
}

function StatCard({ label, value, variant = 'default', icon, subtitle }: StatCardProps) {
    return (
        <div className={cn(
            'rounded-xl border bg-card p-4 transition-all hover:shadow-md',
            variant === 'success' && 'border-green-500/30 bg-green-500/5',
            variant === 'warning' && 'border-orange-500/30 bg-orange-500/5',
            variant === 'danger' && 'border-red-500/30 bg-red-500/5',
        )}>
            <div className="flex items-center gap-2">
                {icon && <span className="text-lg">{icon}</span>}
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
            <p className={cn(
                'text-2xl font-bold mt-1',
                variant === 'success' && 'text-green-600',
                variant === 'warning' && 'text-orange-500',
                variant === 'danger' && 'text-red-600',
            )}>
                {value}
            </p>
            {subtitle && (
                <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>
            )}
        </div>
    );
}
