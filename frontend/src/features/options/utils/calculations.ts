/**
 * CasperOptions Calculation Utilities
 * Core pricing, profit, and exercisability logic
 */

import type {
    Option,
    ProfitCalculation,
    ExercisabilityResult,
    PremiumCalculation,
    OptionDisplayData,
} from '@/types/options';
import {
    PREMIUM_PERCENTAGE,
    MIN_PREMIUM,
    ADDRESS_START_CHARS,
    ADDRESS_END_CHARS,
    CSPR_DECIMALS,
} from '../constants/config';

// ============================================================================
// Premium Calculations
// ============================================================================

/**
 * Calculate premium for an option based on strike price
 * Simple model: premium = 5% of strike price
 */
export function calculatePremium(strikePrice: number): number {
    const premium = strikePrice * PREMIUM_PERCENTAGE;
    return Math.max(premium, MIN_PREMIUM);
}

/**
 * Calculate premium as percentage of strike price
 */
export function calculatePremiumPercentage(
    premium: number,
    strikePrice: number
): number {
    if (strikePrice === 0) return 0;
    return (premium / strikePrice) * 100;
}

/**
 * Calculate break-even price (strike + premium)
 */
export function calculateBreakEven(
    strikePrice: number,
    premium: number
): number {
    return strikePrice + premium;
}

/**
 * Get full premium calculation info
 */
export function getPremiumInfo(option: Option): PremiumCalculation {
    return {
        premium: option.premium,
        premiumPercentage: calculatePremiumPercentage(option.premium, option.strikePrice),
        breakEvenPrice: calculateBreakEven(option.strikePrice, option.premium),
    };
}

// ============================================================================
// ITM/OTM Calculations
// ============================================================================

/**
 * Determine if a CALL option is In The Money
 * ITM when current price > strike price
 */
export function isInTheMoney(
    option: Option,
    currentPrice: number
): boolean {
    if (option.optionType === 'CALL') {
        return currentPrice > option.strikePrice;
    }
    // For PUT options (future feature)
    return currentPrice < option.strikePrice;
}

/**
 * Check if option has expired
 */
export function isExpired(option: Option, currentTime: Date = new Date()): boolean {
    return new Date(option.expiry) < currentTime;
}

// ============================================================================
// Profit Calculations
// ============================================================================

/**
 * Calculate profit/loss for exercising an option
 * 
 * For CALL options:
 * - Gross profit = (currentPrice - strikePrice) * amount
 * - Net profit = gross profit - premium paid
 */
export function calculateProfit(
    option: Option,
    currentPrice: number
): ProfitCalculation {
    let grossProfit: number;

    if (option.optionType === 'CALL') {
        // CALL: profit when price goes up
        grossProfit = (currentPrice - option.strikePrice) * option.amount;
    } else {
        // PUT: profit when price goes down
        grossProfit = (option.strikePrice - currentPrice) * option.amount;
    }

    const netProfit = grossProfit - option.premium;
    const profitPercentage = option.premium > 0
        ? (netProfit / option.premium) * 100
        : 0;

    return {
        grossProfit,
        netProfit,
        profitPercentage,
        isProfitable: netProfit > 0,
    };
}

// ============================================================================
// Exercisability Logic
// ============================================================================

/**
 * Determine if an option can be exercised and why/why not
 */
export function canExercise(
    option: Option,
    currentPrice: number,
    currentTime: Date = new Date()
): ExercisabilityResult {
    // Already exercised
    if (option.exercised) {
        return {
            canExercise: false,
            reason: 'This option has already been exercised',
        };
    }

    // Expired
    if (isExpired(option, currentTime)) {
        return {
            canExercise: false,
            reason: 'This option has expired',
        };
    }

    // Check if OTM (can still exercise but with warning)
    const itm = isInTheMoney(option, currentPrice);
    if (!itm) {
        return {
            canExercise: true,
            warning: 'This option is Out of The Money. Exercising will result in a loss.',
        };
    }

    // ITM and valid
    return {
        canExercise: true,
    };
}

// ============================================================================
// Balance Validation
// ============================================================================

/**
 * Check if user has sufficient balance for a purchase
 */
export function canAffordPurchase(
    balance: string | null,
    premium: number,
    gasFee: number
): { canAfford: boolean; required: number; shortfall: number } {
    const required = premium + gasFee;
    const balanceNum = parseFloat(balance || '0');
    const canAfford = balanceNum >= required;
    const shortfall = canAfford ? 0 : required - balanceNum;

    return {
        canAfford,
        required,
        shortfall,
    };
}

// ============================================================================
// Sorting
// ============================================================================

/**
 * Sort options by expiry date (ascending - nearest first)
 */
export function sortOptionsByExpiry(options: Option[]): Option[] {
    return [...options].sort((a, b) => {
        const dateA = new Date(a.expiry).getTime();
        const dateB = new Date(b.expiry).getTime();
        return dateA - dateB;
    });
}

/**
 * Sort options by strike price
 */
export function sortOptionsByStrike(
    options: Option[],
    direction: 'asc' | 'desc' = 'asc'
): Option[] {
    return [...options].sort((a, b) => {
        const diff = a.strikePrice - b.strikePrice;
        return direction === 'asc' ? diff : -diff;
    });
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Truncate address for display
 * Format: first 6 chars + "..." + last 4 chars
 */
export function truncateAddress(address: string): string {
    if (!address || address.length <= ADDRESS_START_CHARS + ADDRESS_END_CHARS) {
        return address;
    }
    const start = address.slice(0, ADDRESS_START_CHARS);
    const end = address.slice(-ADDRESS_END_CHARS);
    return `${start}...${end}`;
}

/**
 * Format CSPR amount for display
 */
export function formatCspr(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toFixed(CSPR_DECIMALS);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 2): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Format time remaining until expiry
 */
export function formatTimeToExpiry(expiry: Date): string {
    const now = new Date();
    const expiryDate = new Date(expiry);
    const diffMs = expiryDate.getTime() - now.getTime();

    if (diffMs < 0) {
        return 'Expired';
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
        return `${diffDays}d ${diffHours}h`;
    }

    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes}m`;
    }

    return `${diffMinutes}m`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// ============================================================================
// Option Display Data Builder
// ============================================================================

/**
 * Build complete display data for an option
 */
export function buildOptionDisplayData(
    option: Option,
    currentPrice: number,
    currentTime: Date = new Date()
): OptionDisplayData {
    return {
        ...option,
        isInTheMoney: isInTheMoney(option, currentPrice),
        isExpired: isExpired(option, currentTime),
        profit: calculateProfit(option, currentPrice),
        exercisability: canExercise(option, currentPrice, currentTime),
        premiumInfo: getPremiumInfo(option),
        timeToExpiry: formatTimeToExpiry(option.expiry),
    };
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate option parameters for creation
 */
export function validateOptionParams(params: {
    strikePrice: number;
    expiry: Date;
    amount: number;
}): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (params.strikePrice <= 0) {
        errors.push('Strike price must be greater than 0');
    }

    if (params.amount <= 0) {
        errors.push('Amount must be greater than 0');
    }

    const now = new Date();
    if (new Date(params.expiry) <= now) {
        errors.push('Expiry must be in the future');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
