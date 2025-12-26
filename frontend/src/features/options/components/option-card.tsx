'use client';

/**
 * OptionCard Component
 * Displays a single option with all relevant details
 */

import { Calendar, TrendingUp, TrendingDown, Clock, Coins, Flame, Zap, Target } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import type { Option } from '@/types/options';
import { useOraclePrice, useOptionsStore } from '../utils/store';
import {
    isInTheMoney,
    isExpired,
    calculateProfit,
    getPremiumInfo,
    formatCspr,
    formatDate,
    formatTimeToExpiry,
    formatPercentage,
} from '../utils/calculations';
import { cn } from '@/lib/utils';

interface OptionCardProps {
    option: Option;
    showBuyButton?: boolean;
    showExerciseButton?: boolean;
    className?: string;
}

export function OptionCard({
    option,
    showBuyButton = true,
    showExerciseButton = false,
    className,
}: OptionCardProps) {
    const oraclePrice = useOraclePrice();
    const { openBuyModal, openExerciseModal, wallet } = useOptionsStore();

    const itm = isInTheMoney(option, oraclePrice);
    const expired = isExpired(option);
    const profit = calculateProfit(option, oraclePrice);
    const premiumInfo = getPremiumInfo(option);
    const timeToExpiry = formatTimeToExpiry(option.expiry);

    // Calculate additional metrics
    const hoursToExpiry = (new Date(option.expiry).getTime() - Date.now()) / (1000 * 60 * 60);
    const isUrgent = hoursToExpiry <= 24 && hoursToExpiry > 0;
    const isWhale = option.amount >= 500;
    const isDeepItm = option.strikePrice < oraclePrice * 0.95;
    const isDeepOtm = option.strikePrice > oraclePrice * 1.15;
    const distanceFromSpot = ((oraclePrice - option.strikePrice) / oraclePrice) * 100;

    // Profit potential score (0-100)
    const profitPotential = Math.min(100, Math.max(0,
        itm ? 50 + (distanceFromSpot * 5) : 50 - (Math.abs(distanceFromSpot) * 2)
    ));

    const handleBuy = () => {
        openBuyModal(option);
    };

    const handleExercise = () => {
        openExerciseModal(option);
    };

    return (
        <Card className={cn(
            'relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]',
            expired && 'opacity-60',
            isUrgent && !expired && 'ring-2 ring-orange-500/50 animate-pulse',
            isDeepItm && !expired && 'ring-2 ring-green-500/30',
            className
        )}>
            {/* Gradient overlay for special options */}
            {isWhale && !expired && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
            )}

            {/* Status Badges - Top Right */}
            <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                {option.exercised ? (
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                        Exercised
                    </Badge>
                ) : expired ? (
                    <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">
                        Expired
                    </Badge>
                ) : isDeepItm ? (
                    <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                        <Target className="h-3 w-3 mr-1" />
                        Deep ITM
                    </Badge>
                ) : itm ? (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        ITM
                    </Badge>
                ) : isDeepOtm ? (
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                        <Zap className="h-3 w-3 mr-1" />
                        Speculative
                    </Badge>
                ) : (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        OTM
                    </Badge>
                )}

                {/* Secondary badges */}
                {isUrgent && !expired && (
                    <Badge variant="destructive" className="bg-red-500/20 text-red-600 border-red-500/30 animate-pulse">
                        <Flame className="h-3 w-3 mr-1" />
                        Urgent
                    </Badge>
                )}
                {isWhale && !expired && (
                    <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                        🐋 Whale
                    </Badge>
                )}
            </div>

            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="text-primary font-bold">LST</span>
                    <span className="text-muted-foreground">{option.optionType}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">#{option.id}</span>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Strike Price</p>
                        <p className="text-xl font-bold font-mono">{formatCspr(option.strikePrice)}</p>
                        <p className="text-xs text-muted-foreground">CSPR</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Amount</p>
                        <p className="text-xl font-bold font-mono">{option.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">LST</p>
                    </div>
                </div>

                {/* Distance from Spot Indicator */}
                {!expired && !option.exercised && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Distance from Spot</span>
                            <span className={cn(
                                'font-medium',
                                distanceFromSpot > 0 ? 'text-green-600' : 'text-orange-500'
                            )}>
                                {distanceFromSpot > 0 ? '+' : ''}{distanceFromSpot.toFixed(1)}%
                            </span>
                        </div>
                        <Progress
                            value={profitPotential}
                            className={cn(
                                'h-2',
                                profitPotential > 60 ? '[&>div]:bg-green-500' :
                                    profitPotential > 40 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-orange-500'
                            )}
                        />
                    </div>
                )}

                {/* Premium & Break-even */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="cursor-help">
                                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                        <Coins className="h-3 w-3" />
                                        Premium
                                    </p>
                                    <p className="font-semibold font-mono">{formatCspr(option.premium)} CSPR</p>
                                    <p className="text-xs text-muted-foreground">
                                        ({formatPercentage(premiumInfo.premiumPercentage)})
                                    </p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Cost to purchase this option</p>
                                <p className="text-xs text-muted-foreground">
                                    Premium = 5% of strike price
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="cursor-help">
                                    <p className="text-xs text-muted-foreground mb-1">Break-even</p>
                                    <p className="font-semibold font-mono">{formatCspr(premiumInfo.breakEvenPrice)} CSPR</p>
                                    <p className="text-xs text-muted-foreground">
                                        Current: {formatCspr(oraclePrice)}
                                    </p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Price at which you break even</p>
                                <p className="text-xs text-muted-foreground">
                                    Break-even = Strike + Premium
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Expiry */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(option.expiry)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                        <Clock className={cn(
                            'h-4 w-4',
                            isUrgent ? 'text-red-500 animate-pulse' : 'text-muted-foreground'
                        )} />
                        <span className={cn(
                            expired ? 'text-destructive' :
                                isUrgent ? 'text-red-500 font-semibold' :
                                    timeToExpiry.includes('h') || timeToExpiry.includes('m') ? 'text-orange-500' : ''
                        )}>
                            {timeToExpiry}
                        </span>
                    </div>
                </div>

                {/* Profit/Loss Display */}
                {!expired && !option.exercised && (
                    <div className={cn(
                        'p-3 rounded-lg relative overflow-hidden',
                        profit.isProfitable ? 'bg-green-500/10' : 'bg-red-500/10'
                    )}>
                        {/* Animated gradient for profitable options */}
                        {profit.isProfitable && profit.netProfit > 5 && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent animate-shimmer" />
                        )}
                        <p className="text-xs text-muted-foreground mb-1">
                            {showExerciseButton ? 'Current P&L' : 'Potential Profit'}
                        </p>
                        <p className={cn(
                            'text-lg font-bold font-mono relative',
                            profit.isProfitable ? 'text-green-600' : 'text-red-600'
                        )}>
                            {profit.netProfit >= 0 ? '+' : ''}{formatCspr(profit.netProfit)} CSPR
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {formatPercentage(profit.profitPercentage)} return
                        </p>
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-0">
                {showBuyButton && !option.owner && !expired && (
                    <Button
                        className={cn(
                            'w-full transition-all',
                            itm && 'bg-green-600 hover:bg-green-700',
                            isUrgent && 'animate-pulse'
                        )}
                        onClick={handleBuy}
                        disabled={!wallet.isConnected}
                    >
                        {wallet.isConnected ? (
                            <>
                                {isUrgent && <Flame className="h-4 w-4 mr-2" />}
                                {itm ? '🔥 Buy ITM Option' : 'Buy Option'}
                            </>
                        ) : 'Connect Wallet to Buy'}
                    </Button>
                )}

                {showExerciseButton && !option.exercised && !expired && (
                    <Button
                        className={cn(
                            'w-full',
                            itm && 'bg-green-600 hover:bg-green-700'
                        )}
                        variant={itm ? 'default' : 'outline'}
                        onClick={handleExercise}
                    >
                        {itm ? '💰 Exercise for Profit' : 'Exercise (Loss)'}
                    </Button>
                )}

                {option.exercised && (
                    <div className="w-full text-center text-sm text-muted-foreground">
                        ✅ This option has been exercised
                    </div>
                )}

                {expired && !option.exercised && (
                    <div className="w-full text-center text-sm text-destructive">
                        ❌ This option expired worthless
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
