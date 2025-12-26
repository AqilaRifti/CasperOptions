'use client';

/**
 * PriceDisplay Component
 * Shows current LST/CSPR price prominently
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOraclePrice } from '../utils/store';
import { formatCspr } from '../utils/calculations';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
    className?: string;
    compact?: boolean;
}

export function PriceDisplay({ className, compact = false }: PriceDisplayProps) {
    const oraclePrice = useOraclePrice();

    // Mock price change for visual appeal (in production, track real changes)
    const priceChange: number = 2.5; // +2.5%
    const isPositive = priceChange > 0;
    const isNeutral = Math.abs(priceChange) < 0.01;

    if (compact) {
        return (
            <div className={cn('flex items-center gap-2', className)}>
                <span className="text-sm text-muted-foreground">LST/CSPR:</span>
                <span className="font-mono font-semibold">{formatCspr(oraclePrice)}</span>
                <Badge
                    variant={isPositive ? 'default' : isNeutral ? 'secondary' : 'destructive'}
                    className={cn(
                        'text-xs',
                        isPositive && 'bg-green-500/10 text-green-600 border-green-500/20',
                        !isPositive && !isNeutral && 'bg-red-500/10 text-red-600 border-red-500/20'
                    )}
                >
                    {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                </Badge>
            </div>
        );
    }

    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">LST/CSPR Price</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold font-mono">
                                {formatCspr(oraclePrice)}
                            </span>
                            <span className="text-lg text-muted-foreground">CSPR</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <Badge
                            variant="outline"
                            className={cn(
                                'text-sm px-3 py-1',
                                isPositive && 'bg-green-500/10 text-green-600 border-green-500/20',
                                !isPositive && !isNeutral && 'bg-red-500/10 text-red-600 border-red-500/20'
                            )}
                        >
                            <span className="flex items-center gap-1">
                                {isPositive ? (
                                    <TrendingUp className="h-4 w-4" />
                                ) : isNeutral ? (
                                    <Minus className="h-4 w-4" />
                                ) : (
                                    <TrendingDown className="h-4 w-4" />
                                )}
                                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                            </span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">24h change</span>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <span>Mock Oracle (Demo)</span>
                    <span>Updated just now</span>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Inline price display for use in text
 */
export function InlinePrice({ className }: { className?: string }) {
    const oraclePrice = useOraclePrice();

    return (
        <span className={cn('font-mono font-medium', className)}>
            {formatCspr(oraclePrice)} CSPR
        </span>
    );
}
