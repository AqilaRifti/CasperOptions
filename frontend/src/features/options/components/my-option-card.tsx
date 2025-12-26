'use client';

/**
 * MyOptionCard Component
 * Displays owned option with P&L and exercise functionality
 */

import { Calendar, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Option } from '@/types/options';
import { useOraclePrice, useOptionsStore } from '../utils/store';
import {
    isInTheMoney,
    isExpired,
    calculateProfit,
    canExercise,
    formatCspr,
    formatDate,
    formatTimeToExpiry,
} from '../utils/calculations';
import { cn } from '@/lib/utils';

interface MyOptionCardProps {
    option: Option;
    className?: string;
}

export function MyOptionCard({ option, className }: MyOptionCardProps) {
    const oraclePrice = useOraclePrice();
    const { openExerciseModal } = useOptionsStore();

    const itm = isInTheMoney(option, oraclePrice);
    const expired = isExpired(option);
    const profit = calculateProfit(option, oraclePrice);
    const exercisability = canExercise(option, oraclePrice);
    const timeToExpiry = formatTimeToExpiry(option.expiry);

    // Calculate time progress (for visual indicator)
    const now = new Date().getTime();
    const created = new Date(option.createdAt).getTime();
    const expiry = new Date(option.expiry).getTime();
    const totalDuration = expiry - created;
    const elapsed = now - created;
    const timeProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

    const handleExercise = () => {
        openExerciseModal(option);
    };

    // Determine card status
    const getStatusBadge = () => {
        if (option.exercised) {
            return (
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Exercised
                </Badge>
            );
        }
        if (expired) {
            return (
                <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">
                    Expired
                </Badge>
            );
        }
        if (itm) {
            return (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    In The Money
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                <TrendingDown className="h-3 w-3 mr-1" />
                Out of Money
            </Badge>
        );
    };

    return (
        <Card className={cn(
            'relative overflow-hidden transition-all',
            option.exercised && 'bg-blue-500/5 border-blue-500/20',
            expired && !option.exercised && 'opacity-60 bg-red-500/5',
            itm && !expired && !option.exercised && 'border-green-500/30',
            className
        )}>
            {/* Status indicator bar */}
            <div className={cn(
                'absolute top-0 left-0 right-0 h-1',
                option.exercised && 'bg-blue-500',
                expired && !option.exercised && 'bg-red-500',
                itm && !expired && !option.exercised && 'bg-green-500',
                !itm && !expired && !option.exercised && 'bg-orange-500',
            )} />

            <CardHeader className="pb-2 pt-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="text-primary">LST</span>
                        <span className="text-muted-foreground">{option.optionType}</span>
                        <span className="text-xs text-muted-foreground">#{option.id}</span>
                    </CardTitle>
                    {getStatusBadge()}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* P&L Display - Most prominent */}
                <div className={cn(
                    'p-4 rounded-lg text-center',
                    profit.isProfitable ? 'bg-green-500/10' : 'bg-red-500/10'
                )}>
                    <p className="text-xs text-muted-foreground mb-1">
                        {option.exercised ? 'Final P&L' : 'Current P&L'}
                    </p>
                    <p className={cn(
                        'text-3xl font-bold font-mono',
                        profit.isProfitable ? 'text-green-600' : 'text-red-600'
                    )}>
                        {profit.netProfit >= 0 ? '+' : ''}{formatCspr(profit.netProfit)}
                    </p>
                    <p className="text-sm text-muted-foreground">CSPR</p>
                    <p className={cn(
                        'text-sm mt-1',
                        profit.isProfitable ? 'text-green-600' : 'text-red-600'
                    )}>
                        {profit.profitPercentage >= 0 ? '+' : ''}{profit.profitPercentage.toFixed(1)}% return
                    </p>
                </div>

                {/* Option Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Strike</p>
                        <p className="font-semibold font-mono">{formatCspr(option.strikePrice)} CSPR</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Current Price</p>
                        <p className="font-semibold font-mono">{formatCspr(oraclePrice)} CSPR</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-semibold font-mono">{option.amount} LST</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Premium Paid</p>
                        <p className="font-semibold font-mono">{formatCspr(option.premium)} CSPR</p>
                    </div>
                </div>

                {/* Time Progress */}
                {!option.exercised && !expired && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{formatDate(option.expiry)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className={cn(
                                    timeToExpiry.includes('h') || timeToExpiry.includes('m')
                                        ? 'text-orange-500 font-medium'
                                        : ''
                                )}>
                                    {timeToExpiry}
                                </span>
                            </div>
                        </div>
                        <Progress value={timeProgress} className="h-1.5" />
                    </div>
                )}

                {/* Exercise Warning */}
                {exercisability.warning && !option.exercised && !expired && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-sm text-orange-600">
                        ⚠️ {exercisability.warning}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-0">
                {!option.exercised && !expired && exercisability.canExercise && (
                    <Button
                        className="w-full"
                        variant={itm ? 'default' : 'outline'}
                        onClick={handleExercise}
                    >
                        {itm ? (
                            <>
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Exercise for +{formatCspr(profit.netProfit)} CSPR
                            </>
                        ) : (
                            'Exercise (Will Result in Loss)'
                        )}
                    </Button>
                )}

                {option.exercised && (
                    <div className="w-full text-center py-2">
                        <p className="text-sm text-blue-600 font-medium">
                            ✓ Successfully exercised
                        </p>
                    </div>
                )}

                {expired && !option.exercised && (
                    <div className="w-full text-center py-2">
                        <p className="text-sm text-red-600">
                            This option expired worthless
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Lost: {formatCspr(option.premium)} CSPR (premium)
                        </p>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
