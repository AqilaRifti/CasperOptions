'use client';

/**
 * CreateOptionForm Component
 * Simple form for creating new options (demo/admin use)
 */

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useOptionsStore, useWallet } from '../utils/store';
import { calculatePremium, formatCspr } from '../utils/calculations';
import { toast } from 'sonner';

const createOptionSchema = z.object({
    strikePrice: z.number().min(0.01, 'Strike price must be at least 0.01'),
    amount: z.number().int().min(1, 'Amount must be at least 1'),
    expiryDays: z.number().int().min(1, 'Expiry must be at least 1 day'),
});

type CreateOptionFormData = z.infer<typeof createOptionSchema>;

export function CreateOptionForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { createOption } = useOptionsStore();
    const wallet = useWallet();

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<CreateOptionFormData>({
        resolver: zodResolver(createOptionSchema),
        defaultValues: {
            strikePrice: 1.0,
            amount: 100,
            expiryDays: 7,
        },
    });

    const watchStrikePrice = watch('strikePrice');
    const estimatedPremium = calculatePremium(watchStrikePrice || 0);

    const onSubmit = async (data: CreateOptionFormData) => {
        setIsSubmitting(true);

        try {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + data.expiryDays);

            const result = await createOption({
                strikePrice: data.strikePrice,
                expiry,
                amount: data.amount,
                optionType: 'CALL',
            });

            if (result.success) {
                toast.success('Option created successfully!');
                reset();
                setIsOpen(false);
            } else {
                toast.error(result.error || 'Failed to create option');
            }
        } catch (error) {
            toast.error('An error occurred while creating the option');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!wallet.isConnected) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Option
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Option</DialogTitle>
                    <DialogDescription>
                        Create a new LST call option for the marketplace.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="strikePrice">Strike Price (CSPR)</Label>
                        <Input
                            id="strikePrice"
                            type="number"
                            step="0.01"
                            {...register('strikePrice')}
                        />
                        {errors.strikePrice && (
                            <p className="text-sm text-destructive">{errors.strikePrice.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (LST)</Label>
                        <Input
                            id="amount"
                            type="number"
                            {...register('amount')}
                        />
                        {errors.amount && (
                            <p className="text-sm text-destructive">{errors.amount.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expiryDays">Expiry (days from now)</Label>
                        <Select
                            defaultValue="7"
                            onValueChange={(value) => {
                                const event = { target: { name: 'expiryDays', value } };
                                register('expiryDays').onChange(event as any);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select expiry" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 day</SelectItem>
                                <SelectItem value="3">3 days</SelectItem>
                                <SelectItem value="7">7 days</SelectItem>
                                <SelectItem value="14">14 days</SelectItem>
                                <SelectItem value="30">30 days</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.expiryDays && (
                            <p className="text-sm text-destructive">{errors.expiryDays.message}</p>
                        )}
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Estimated Premium</span>
                            <span className="font-mono font-medium">
                                {formatCspr(estimatedPremium)} CSPR
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Premium = 5% of strike price
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Option'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
