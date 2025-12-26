'use client';

/**
 * BuyModal Component
 * Confirmation modal for purchasing an option
 */

import { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useOptionsStore, useBuyModal, useOraclePrice, useWallet } from '../utils/store';
import {
    formatCspr,
    formatDate,
    formatTimeToExpiry,
    getPremiumInfo,
    calculateProfit,
    isInTheMoney,
    canAffordPurchase,
} from '../utils/calculations';
import { ESTIMATED_GAS_FEE, getDeployUrl } from '../constants/config';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ModalState = 'confirm' | 'processing' | 'success' | 'error';

export function BuyModal() {
    const { isOpen, option } = useBuyModal();
    const { closeBuyModal, buyOption } = useOptionsStore();
    const wallet = useWallet();
    const oraclePrice = useOraclePrice();

    const [state, setState] = useState<ModalState>('confirm');
    const [deployHash, setDeployHash] = useState<string>('');
    const [error, setError] = useState<string>('');

    if (!option) return null;

    const premiumInfo = getPremiumInfo(option);
    const profit = calculateProfit(option, oraclePrice);
    const itm = isInTheMoney(option, oraclePrice);
    const affordCheck = canAffordPurchase(wallet.balance, option.premium, ESTIMATED_GAS_FEE);
    const totalCost = option.premium + ESTIMATED_GAS_FEE;

    const handleConfirm = async () => {
        setState('processing');
        setError('');

        try {
            const result = await buyOption(option.id);

            if (result.success) {
                setDeployHash(result.deployHash);
                setState('success');
                toast.success('Option purchased successfully!');
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
        closeBuyModal();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                {state === 'confirm' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Buy LST Call Option</DialogTitle>
                            <DialogDescription>
                                Review the details below before confirming your purchase.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Option Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Strike Price</p>
                                    <p className="font-semibold font-mono">{formatCspr(option.strikePrice)} CSPR</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Amount</p>
                                    <p className="font-semibold font-mono">{option.amount} LST</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Expiry</p>
                                    <p className="font-semibold">{formatDate(option.expiry)}</p>
                                    <p className="text-xs text-muted-foreground">{formatTimeToExpiry(option.expiry)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Status</p>
                                    <p className={cn(
                                        'font-semibold',
                                        itm ? 'text-green-600' : 'text-orange-500'
                                    )}>
                                        {itm ? 'In The Money' : 'Out of The Money'}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Cost Breakdown */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Premium</span>
                                    <span className="font-mono">{formatCspr(option.premium)} CSPR</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Est. Gas Fee</span>
                                    <span className="font-mono">{formatCspr(ESTIMATED_GAS_FEE)} CSPR</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                    <span>Total Cost</span>
                                    <span className="font-mono">{formatCspr(totalCost)} CSPR</span>
                                </div>
                            </div>

                            {/* Break-even Info */}
                            <div className="bg-muted/50 rounded-lg p-3 text-sm">
                                <p className="text-muted-foreground mb-1">Break-even Price</p>
                                <p className="font-semibold font-mono">{formatCspr(premiumInfo.breakEvenPrice)} CSPR</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Current price: {formatCspr(oraclePrice)} CSPR
                                </p>
                            </div>

                            {/* Balance Warning */}
                            {!affordCheck.canAfford && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Insufficient balance. You need {formatCspr(affordCheck.shortfall)} more CSPR.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={!affordCheck.canAfford}
                            >
                                Confirm Purchase
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {state === 'processing' && (
                    <div className="py-8 text-center">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                        <h3 className="mt-4 text-lg font-semibold">Processing Transaction</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            Please wait while your transaction is being processed...
                        </p>
                    </div>
                )}

                {state === 'success' && (
                    <div className="py-8 text-center">
                        <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
                        <h3 className="mt-4 text-lg font-semibold">Purchase Successful!</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            Your option has been added to your portfolio.
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
                        <h3 className="mt-4 text-lg font-semibold">Transaction Failed</h3>
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
