'use client';

/**
 * ExerciseModal Component
 * Confirmation modal for exercising an option
 */

import { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle2, ExternalLink, AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useOptionsStore, useExerciseModal, useOraclePrice } from '../utils/store';
import {
    formatCspr,
    formatDate,
    calculateProfit,
    isInTheMoney,
    canExercise,
} from '../utils/calculations';
import { getDeployUrl } from '../constants/config';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ModalState = 'confirm' | 'processing' | 'success' | 'error';

export function ExerciseModal() {
    const { isOpen, option } = useExerciseModal();
    const { closeExerciseModal, exerciseOption } = useOptionsStore();
    const oraclePrice = useOraclePrice();

    const [state, setState] = useState<ModalState>('confirm');
    const [deployHash, setDeployHash] = useState<string>('');
    const [error, setError] = useState<string>('');

    if (!option) return null;

    const profit = calculateProfit(option, oraclePrice);
    const itm = isInTheMoney(option, oraclePrice);
    const exercisability = canExercise(option, oraclePrice);

    const handleConfirm = async () => {
        setState('processing');
        setError('');

        try {
            const result = await exerciseOption(option.id);

            if (result.success) {
                setDeployHash(result.deployHash);
                setState('success');
                toast.success('Option exercised successfully!');
            } else {
                setError(result.error || 'Transaction failed');
                setState('error');
                toast.error(result.error || 'Transaction failed');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            setState('error');
            toast.error(errorMessage);
        }
    };

    const handleClose = () => {
        setState('confirm');
        setDeployHash('');
        setError('');
        closeExerciseModal();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                {state === 'confirm' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Exercise Option</DialogTitle>
                            <DialogDescription>
                                {itm
                                    ? 'This option is in the money. Exercise to realize your profit.'
                                    : 'This option is out of the money. Exercising will result in a loss.'
                                }
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* OTM Warning */}
                            {!itm && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Warning: Out of The Money</AlertTitle>
                                    <AlertDescription>
                                        The current price ({formatCspr(oraclePrice)} CSPR) is below your strike price
                                        ({formatCspr(option.strikePrice)} CSPR). Exercising will result in a loss.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Profit/Loss Display */}
                            <div className={cn(
                                'p-4 rounded-lg text-center',
                                profit.isProfitable ? 'bg-green-500/10' : 'bg-red-500/10'
                            )}>
                                <p className="text-sm text-muted-foreground mb-1">
                                    {profit.isProfitable ? 'You will receive' : 'You will lose'}
                                </p>
                                <p className={cn(
                                    'text-3xl font-bold font-mono',
                                    profit.isProfitable ? 'text-green-600' : 'text-red-600'
                                )}>
                                    {profit.isProfitable ? '+' : ''}{formatCspr(Math.abs(profit.netProfit))}
                                </p>
                                <p className="text-sm text-muted-foreground">CSPR</p>
                            </div>

                            {/* Calculation Breakdown */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Current LST Price</span>
                                    <span className="font-mono">{formatCspr(oraclePrice)} CSPR</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Strike Price</span>
                                    <span className="font-mono">{formatCspr(option.strikePrice)} CSPR</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Price Difference</span>
                                    <span className={cn(
                                        'font-mono',
                                        oraclePrice > option.strikePrice ? 'text-green-600' : 'text-red-600'
                                    )}>
                                        {oraclePrice > option.strikePrice ? '+' : ''}
                                        {formatCspr(oraclePrice - option.strikePrice)} CSPR
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-mono">× {option.amount} LST</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Gross Value</span>
                                    <span className="font-mono">{formatCspr(profit.grossProfit)} CSPR</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Premium Paid</span>
                                    <span className="font-mono text-red-600">-{formatCspr(option.premium)} CSPR</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                    <span>Net {profit.isProfitable ? 'Profit' : 'Loss'}</span>
                                    <span className={cn(
                                        'font-mono',
                                        profit.isProfitable ? 'text-green-600' : 'text-red-600'
                                    )}>
                                        {profit.isProfitable ? '+' : ''}{formatCspr(profit.netProfit)} CSPR
                                    </span>
                                </div>
                            </div>

                            {/* Option Details */}
                            <div className="bg-muted/50 rounded-lg p-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Option ID</span>
                                    <span>#{option.id}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-muted-foreground">Expiry</span>
                                    <span>{formatDate(option.expiry)}</span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                variant={itm ? 'default' : 'destructive'}
                                disabled={!exercisability.canExercise}
                            >
                                {itm ? 'Exercise Option' : 'Exercise Anyway'}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {state === 'processing' && (
                    <div className="py-8 text-center">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                        <h3 className="mt-4 text-lg font-semibold">Processing Exercise</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            Please wait while your transaction is being processed...
                        </p>
                    </div>
                )}

                {state === 'success' && (
                    <div className="py-8 text-center">
                        <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
                        <h3 className="mt-4 text-lg font-semibold">Exercise Successful!</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            {profit.isProfitable
                                ? `You received ${formatCspr(profit.netProfit)} CSPR profit.`
                                : 'Your option has been exercised.'
                            }
                        </p>

                        {deployHash && (
                            <a
                                href={getDeployUrl(deployHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-4"
                            >
                                View on Explorer
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        )}

                        <DialogFooter className="mt-6">
                            <Button onClick={handleClose} className="w-full">
                                Done
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {state === 'error' && (
                    <div className="py-8 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
                        <h3 className="mt-4 text-lg font-semibold">Exercise Failed</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            {error || 'An error occurred while processing your transaction.'}
                        </p>

                        <DialogFooter className="mt-6 flex-col gap-2">
                            <Button onClick={handleConfirm} className="w-full">
                                Try Again
                            </Button>
                            <Button variant="outline" onClick={handleClose} className="w-full">
                                Cancel
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
