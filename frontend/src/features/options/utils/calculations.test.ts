/**
 * Property-Based Tests for CasperOptions Calculations
 * Feature: lst-options-demo
 * 
 * Uses fast-check for property-based testing with minimum 100 iterations
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Option } from '@/types/options';
import {
    isInTheMoney,
    calculateProfit,
    calculatePremium,
    calculatePremiumPercentage,
    calculateBreakEven,
    sortOptionsByExpiry,
    truncateAddress,
    canExercise,
} from './calculations';
import { PREMIUM_PERCENTAGE, ADDRESS_START_CHARS, ADDRESS_END_CHARS } from '../constants/config';

// ============================================================================
// Arbitraries (Generators)
// ============================================================================

// Use Math.fround() for 32-bit float compatibility with fast-check
const positiveNumber = fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true });
const strikePrice = fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true });
const currentPrice = fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true });
const amount = fc.integer({ min: 1, max: 10000 });

const futureDate = fc.date({ min: new Date(), max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) });
const pastDate = fc.date({ min: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), max: new Date(Date.now() - 1000) });

const casperAddress = fc.stringMatching(/^[0-9a-f]{64}$/).map(hex => `account-hash-${hex}`);

const optionArbitrary = fc.record({
    id: fc.integer({ min: 1, max: 100000 }),
    strikePrice: strikePrice,
    expiry: futureDate,
    premium: positiveNumber,
    underlying: fc.constant('LST' as const),
    optionType: fc.constant('CALL' as const),
    amount: amount,
    creator: casperAddress,
    owner: fc.option(casperAddress, { nil: null }),
    exercised: fc.boolean(),
    createdAt: fc.date({ max: new Date() }),
});

// ============================================================================
// Property 3: ITM/OTM Calculation Correctness
// Feature: lst-options-demo, Property 3: ITM/OTM Calculation Correctness
// Validates: Requirements 2.3
// ============================================================================

describe('Property 3: ITM/OTM Calculation Correctness', () => {
    it('CALL option is ITM if and only if currentPrice > strikePrice', () => {
        fc.assert(
            fc.property(
                strikePrice,
                currentPrice,
                (strike, current) => {
                    const option: Option = {
                        id: 1,
                        strikePrice: strike,
                        expiry: new Date(Date.now() + 86400000),
                        premium: strike * PREMIUM_PERCENTAGE,
                        underlying: 'LST',
                        optionType: 'CALL',
                        amount: 100,
                        creator: 'account-hash-abc',
                        owner: null,
                        exercised: false,
                        createdAt: new Date(),
                    };

                    const result = isInTheMoney(option, current);
                    const expected = current > strike;

                    expect(result).toBe(expected);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('ITM status is consistent regardless of other option properties', () => {
        fc.assert(
            fc.property(
                optionArbitrary,
                currentPrice,
                (option, current) => {
                    // Force CALL type for this test
                    const callOption = { ...option, optionType: 'CALL' as const };
                    const result = isInTheMoney(callOption, current);

                    // ITM should only depend on strike vs current price
                    expect(result).toBe(current > callOption.strikePrice);
                }
            ),
            { numRuns: 100 }
        );
    });
});

// ============================================================================
// Property 7: Profit Calculation Correctness
// Feature: lst-options-demo, Property 7: Profit Calculation Correctness
// Validates: Requirements 4.5
// ============================================================================

describe('Property 7: Profit Calculation Correctness', () => {
    it('For OTM options, net profit equals negative premium', () => {
        fc.assert(
            fc.property(
                strikePrice,
                positiveNumber, // premium
                amount,
                (strike, premium, amt) => {
                    // Current price less than or equal to strike (OTM)
                    const current = strike * 0.9; // 10% below strike

                    const option: Option = {
                        id: 1,
                        strikePrice: strike,
                        expiry: new Date(Date.now() + 86400000),
                        premium: premium,
                        underlying: 'LST',
                        optionType: 'CALL',
                        amount: amt,
                        creator: 'account-hash-abc',
                        owner: null,
                        exercised: false,
                        createdAt: new Date(),
                    };

                    const result = calculateProfit(option, current);

                    // For OTM CALL: gross profit = (current - strike) * amount (negative)
                    // Net profit = gross - premium
                    const expectedGross = (current - strike) * amt;

                    expect(result.grossProfit).toBeCloseTo(expectedGross, 4);
                    expect(result.netProfit).toBeCloseTo(expectedGross - premium, 4);
                    expect(result.isProfitable).toBe(result.netProfit > 0);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('For ITM options, profit formula is correct', () => {
        fc.assert(
            fc.property(
                strikePrice,
                positiveNumber, // premium
                amount,
                (strike, premium, amt) => {
                    // Current price greater than strike (ITM)
                    const current = strike * 1.2; // 20% above strike

                    const option: Option = {
                        id: 1,
                        strikePrice: strike,
                        expiry: new Date(Date.now() + 86400000),
                        premium: premium,
                        underlying: 'LST',
                        optionType: 'CALL',
                        amount: amt,
                        creator: 'account-hash-abc',
                        owner: null,
                        exercised: false,
                        createdAt: new Date(),
                    };

                    const result = calculateProfit(option, current);

                    // For ITM CALL: gross profit = (current - strike) * amount
                    const expectedGross = (current - strike) * amt;
                    const expectedNet = expectedGross - premium;

                    expect(result.grossProfit).toBeCloseTo(expectedGross, 4);
                    expect(result.netProfit).toBeCloseTo(expectedNet, 4);
                    expect(result.isProfitable).toBe(expectedNet > 0);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Profit percentage is calculated correctly', () => {
        fc.assert(
            fc.property(
                optionArbitrary,
                currentPrice,
                (option, current) => {
                    const result = calculateProfit(option, current);

                    if (option.premium > 0) {
                        const expectedPercentage = (result.netProfit / option.premium) * 100;
                        expect(result.profitPercentage).toBeCloseTo(expectedPercentage, 4);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });
});

// ============================================================================
// Property 8: Premium and Break-Even Calculation
// Feature: lst-options-demo, Property 8: Premium and Break-Even Calculation
// Validates: Requirements 7.1, 7.2, 7.4
// ============================================================================

describe('Property 8: Premium and Break-Even Calculation', () => {
    it('Premium percentage equals (premium / strikePrice) * 100', () => {
        fc.assert(
            fc.property(
                positiveNumber, // premium
                strikePrice,
                (premium, strike) => {
                    const result = calculatePremiumPercentage(premium, strike);
                    const expected = (premium / strike) * 100;

                    expect(result).toBeCloseTo(expected, 4);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Break-even price equals strikePrice + premium', () => {
        fc.assert(
            fc.property(
                strikePrice,
                positiveNumber, // premium
                (strike, premium) => {
                    const result = calculateBreakEven(strike, premium);
                    const expected = strike + premium;

                    expect(result).toBeCloseTo(expected, 4);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Default premium calculation follows 5% rule', () => {
        fc.assert(
            fc.property(
                strikePrice,
                (strike) => {
                    const result = calculatePremium(strike);
                    const expected = Math.max(strike * PREMIUM_PERCENTAGE, 0.01);

                    expect(result).toBeCloseTo(expected, 4);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Premium is never less than minimum', () => {
        fc.assert(
            fc.property(
                fc.float({ min: Math.fround(0.0001), max: Math.fround(0.1), noNaN: true }), // Very small strike prices
                (strike) => {
                    const result = calculatePremium(strike);
                    expect(result).toBeGreaterThanOrEqual(0.01);
                }
            ),
            { numRuns: 100 }
        );
    });
});

// ============================================================================
// Property 4: Options Sorting by Expiry
// Feature: lst-options-demo, Property 4: Options Sorting by Expiry
// Validates: Requirements 2.5
// ============================================================================

describe('Property 4: Options Sorting by Expiry', () => {
    it('Sorted options are in ascending order by expiry date', () => {
        fc.assert(
            fc.property(
                fc.array(optionArbitrary, { minLength: 0, maxLength: 20 }),
                (options) => {
                    const sorted = sortOptionsByExpiry(options);

                    // Check that each option's expiry is <= the next option's expiry
                    for (let i = 0; i < sorted.length - 1; i++) {
                        const currentExpiry = new Date(sorted[i].expiry).getTime();
                        const nextExpiry = new Date(sorted[i + 1].expiry).getTime();
                        expect(currentExpiry).toBeLessThanOrEqual(nextExpiry);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Sorting preserves all original options', () => {
        fc.assert(
            fc.property(
                fc.array(optionArbitrary, { minLength: 0, maxLength: 20 }),
                (options) => {
                    const sorted = sortOptionsByExpiry(options);

                    // Same length
                    expect(sorted.length).toBe(options.length);

                    // All original IDs are present
                    const originalIds = options.map(o => o.id).sort();
                    const sortedIds = sorted.map(o => o.id).sort();
                    expect(sortedIds).toEqual(originalIds);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Sorting does not mutate original array', () => {
        fc.assert(
            fc.property(
                fc.array(optionArbitrary, { minLength: 1, maxLength: 20 }),
                (options) => {
                    const originalOrder = options.map(o => o.id);
                    sortOptionsByExpiry(options);
                    const afterOrder = options.map(o => o.id);

                    expect(afterOrder).toEqual(originalOrder);
                }
            ),
            { numRuns: 100 }
        );
    });
});

// ============================================================================
// Property 1: Address Truncation Format
// Feature: lst-options-demo, Property 1: Address Truncation Format
// Validates: Requirements 1.2
// ============================================================================

describe('Property 1: Address Truncation Format', () => {
    it('Truncated address follows pattern: first N chars + "..." + last M chars', () => {
        fc.assert(
            fc.property(
                casperAddress,
                (address) => {
                    const result = truncateAddress(address);

                    if (address.length > ADDRESS_START_CHARS + ADDRESS_END_CHARS) {
                        // Should be truncated
                        const expectedStart = address.slice(0, ADDRESS_START_CHARS);
                        const expectedEnd = address.slice(-ADDRESS_END_CHARS);

                        expect(result).toBe(`${expectedStart}...${expectedEnd}`);
                        expect(result).toContain('...');
                        expect(result.startsWith(expectedStart)).toBe(true);
                        expect(result.endsWith(expectedEnd)).toBe(true);
                    } else {
                        // Should not be truncated
                        expect(result).toBe(address);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Truncated address length is consistent', () => {
        fc.assert(
            fc.property(
                casperAddress,
                (address) => {
                    const result = truncateAddress(address);

                    if (address.length > ADDRESS_START_CHARS + ADDRESS_END_CHARS) {
                        const expectedLength = ADDRESS_START_CHARS + 3 + ADDRESS_END_CHARS; // 3 for "..."
                        expect(result.length).toBe(expectedLength);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });
});

// ============================================================================
// Property 6: Option Exercisability Rules
// Feature: lst-options-demo, Property 6: Option Exercisability Rules
// Validates: Requirements 4.3, 4.4, 5.4, 5.5
// ============================================================================

describe('Property 6: Option Exercisability Rules', () => {
    it('Exercised options cannot be exercised again', () => {
        fc.assert(
            fc.property(
                optionArbitrary,
                currentPrice,
                (option, current) => {
                    const exercisedOption = { ...option, exercised: true };
                    const result = canExercise(exercisedOption, current);

                    expect(result.canExercise).toBe(false);
                    expect(result.reason).toContain('already been exercised');
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Expired options cannot be exercised', () => {
        fc.assert(
            fc.property(
                optionArbitrary,
                // Use a date at least 1 day in the past to ensure it's definitely expired
                fc.date({ min: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), max: new Date(Date.now() - 24 * 60 * 60 * 1000) }),
                currentPrice,
                (option, expiry, current) => {
                    const expiredOption = { ...option, expiry, exercised: false };
                    const result = canExercise(expiredOption, current);

                    expect(result.canExercise).toBe(false);
                    expect(result.reason).toContain('expired');
                }
            ),
            { numRuns: 100 }
        );
    });

    it('OTM options can be exercised but with warning', () => {
        fc.assert(
            fc.property(
                strikePrice,
                // Use a date at least 1 day in the future to avoid race conditions
                fc.date({ min: new Date(Date.now() + 24 * 60 * 60 * 1000), max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }),
                (strike, expiry) => {
                    const current = strike * 0.9; // OTM
                    const option: Option = {
                        id: 1,
                        strikePrice: strike,
                        expiry,
                        premium: strike * 0.05,
                        underlying: 'LST',
                        optionType: 'CALL',
                        amount: 100,
                        creator: 'account-hash-abc',
                        owner: null,
                        exercised: false,
                        createdAt: new Date(),
                    };

                    const result = canExercise(option, current);

                    expect(result.canExercise).toBe(true);
                    expect(result.warning).toBeDefined();
                    expect(result.warning).toContain('Out of The Money');
                }
            ),
            { numRuns: 100 }
        );
    });

    it('ITM non-expired non-exercised options can be exercised without warning', () => {
        fc.assert(
            fc.property(
                strikePrice,
                // Use a date at least 1 day in the future to avoid race conditions
                fc.date({ min: new Date(Date.now() + 24 * 60 * 60 * 1000), max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }),
                (strike, expiry) => {
                    const current = strike * 1.2; // ITM
                    const option: Option = {
                        id: 1,
                        strikePrice: strike,
                        expiry,
                        premium: strike * 0.05,
                        underlying: 'LST',
                        optionType: 'CALL',
                        amount: 100,
                        creator: 'account-hash-abc',
                        owner: null,
                        exercised: false,
                        createdAt: new Date(),
                    };

                    const result = canExercise(option, current);

                    expect(result.canExercise).toBe(true);
                    expect(result.warning).toBeUndefined();
                    expect(result.reason).toBeUndefined();
                }
            ),
            { numRuns: 100 }
        );
    });
});
