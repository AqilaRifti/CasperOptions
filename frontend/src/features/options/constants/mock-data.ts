/**
 * Mock Data for CasperOptions Demo
 * Pre-populated options with varied ITM/OTM status and expiry dates
 */

import type { Option, Transaction } from '@/types/options';
import { DEFAULT_LST_PRICE, PREMIUM_PERCENTAGE } from './config';

// ============================================================================
// Helper Functions
// ============================================================================

const daysFromNow = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

const hoursFromNow = (hours: number): Date => {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    return date;
};

const daysAgo = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

const calculatePremium = (strikePrice: number): number => {
    return Math.max(strikePrice * PREMIUM_PERCENTAGE, 0.01);
};

// ============================================================================
// Mock Account Hashes
// ============================================================================

export const MOCK_ACCOUNTS = {
    creator1: 'account-hash-a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    creator2: 'account-hash-b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    creator3: 'account-hash-c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    creator4: 'account-hash-e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
    creator5: 'account-hash-f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
    whale: 'account-hash-1111111111111111111111111111111111111111111111111111111111111111',
    user: 'account-hash-d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
};

// ============================================================================
// Mock Options - Available for Purchase
// ============================================================================

/**
 * Mock options with varied characteristics:
 * - ITM (In The Money): strike < current price (1.05)
 * - OTM (Out of The Money): strike > current price
 * - Various expiry dates: expired, near-term, far future
 */
export const MOCK_OPTIONS: Option[] = [
    // ========== DEEP ITM Options - High Profit Potential ==========
    {
        id: 1,
        strikePrice: 0.85,
        expiry: daysFromNow(14),
        premium: calculatePremium(0.85),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 500,
        creator: MOCK_ACCOUNTS.whale,
        owner: null,
        exercised: false,
        createdAt: daysAgo(2),
    },
    {
        id: 2,
        strikePrice: 0.90,
        expiry: daysFromNow(21),
        premium: calculatePremium(0.90),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 250,
        creator: MOCK_ACCOUNTS.creator1,
        owner: null,
        exercised: false,
        createdAt: daysAgo(5),
    },
    {
        id: 3,
        strikePrice: 0.95,
        expiry: daysFromNow(7),
        premium: calculatePremium(0.95),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 100,
        creator: MOCK_ACCOUNTS.creator1,
        owner: null,
        exercised: false,
        createdAt: daysAgo(3),
    },

    // ========== ATM Options - At The Money ==========
    {
        id: 4,
        strikePrice: 1.00,
        expiry: daysFromNow(14),
        premium: calculatePremium(1.00),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 50,
        creator: MOCK_ACCOUNTS.creator2,
        owner: null,
        exercised: false,
        createdAt: daysAgo(5),
    },
    {
        id: 5,
        strikePrice: 1.02,
        expiry: daysFromNow(3),
        premium: calculatePremium(1.02),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 200,
        creator: MOCK_ACCOUNTS.creator1,
        owner: null,
        exercised: false,
        createdAt: daysAgo(1),
    },
    {
        id: 6,
        strikePrice: 1.04,
        expiry: daysFromNow(10),
        premium: calculatePremium(1.04),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 150,
        creator: MOCK_ACCOUNTS.creator3,
        owner: null,
        exercised: false,
        createdAt: daysAgo(4),
    },

    // ========== OTM Options - Speculative Plays ==========
    {
        id: 7,
        strikePrice: 1.10,
        expiry: daysFromNow(21),
        premium: calculatePremium(1.10),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 150,
        creator: MOCK_ACCOUNTS.creator3,
        owner: null,
        exercised: false,
        createdAt: daysAgo(2),
    },
    {
        id: 8,
        strikePrice: 1.15,
        expiry: daysFromNow(30),
        premium: calculatePremium(1.15),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 75,
        creator: MOCK_ACCOUNTS.creator2,
        owner: null,
        exercised: false,
        createdAt: daysAgo(7),
    },
    {
        id: 9,
        strikePrice: 1.20,
        expiry: daysFromNow(45),
        premium: calculatePremium(1.20),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 100,
        creator: MOCK_ACCOUNTS.creator1,
        owner: null,
        exercised: false,
        createdAt: daysAgo(10),
    },
    {
        id: 10,
        strikePrice: 1.25,
        expiry: daysFromNow(60),
        premium: calculatePremium(1.25),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 300,
        creator: MOCK_ACCOUNTS.whale,
        owner: null,
        exercised: false,
        createdAt: daysAgo(3),
    },

    // ========== DEEP OTM - High Risk/Reward ==========
    {
        id: 11,
        strikePrice: 1.35,
        expiry: daysFromNow(90),
        premium: calculatePremium(1.35),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 1000,
        creator: MOCK_ACCOUNTS.whale,
        owner: null,
        exercised: false,
        createdAt: daysAgo(1),
    },
    {
        id: 12,
        strikePrice: 1.50,
        expiry: daysFromNow(120),
        premium: calculatePremium(1.50),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 500,
        creator: MOCK_ACCOUNTS.creator4,
        owner: null,
        exercised: false,
        createdAt: daysAgo(5),
    },

    // ========== URGENT - Expiring Soon ==========
    {
        id: 13,
        strikePrice: 1.03,
        expiry: hoursFromNow(6),
        premium: calculatePremium(1.03),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 50,
        creator: MOCK_ACCOUNTS.creator3,
        owner: null,
        exercised: false,
        createdAt: daysAgo(6),
    },
    {
        id: 14,
        strikePrice: 0.98,
        expiry: hoursFromNow(12),
        premium: calculatePremium(0.98),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 75,
        creator: MOCK_ACCOUNTS.creator5,
        owner: null,
        exercised: false,
        createdAt: daysAgo(4),
    },
    {
        id: 15,
        strikePrice: 1.01,
        expiry: daysFromNow(1),
        premium: calculatePremium(1.01),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 100,
        creator: MOCK_ACCOUNTS.creator2,
        owner: null,
        exercised: false,
        createdAt: daysAgo(3),
    },

    // ========== WHALE SIZE - Large Positions ==========
    {
        id: 16,
        strikePrice: 1.08,
        expiry: daysFromNow(28),
        premium: calculatePremium(1.08),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 2000,
        creator: MOCK_ACCOUNTS.whale,
        owner: null,
        exercised: false,
        createdAt: daysAgo(2),
    },
    {
        id: 17,
        strikePrice: 0.92,
        expiry: daysFromNow(35),
        premium: calculatePremium(0.92),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 1500,
        creator: MOCK_ACCOUNTS.whale,
        owner: null,
        exercised: false,
        createdAt: daysAgo(8),
    },

    // ========== MICRO SIZE - Small Positions ==========
    {
        id: 18,
        strikePrice: 1.06,
        expiry: daysFromNow(7),
        premium: calculatePremium(1.06),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 10,
        creator: MOCK_ACCOUNTS.creator4,
        owner: null,
        exercised: false,
        createdAt: daysAgo(1),
    },
    {
        id: 19,
        strikePrice: 1.12,
        expiry: daysFromNow(14),
        premium: calculatePremium(1.12),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 25,
        creator: MOCK_ACCOUNTS.creator5,
        owner: null,
        exercised: false,
        createdAt: daysAgo(2),
    },

    // ========== SWEET SPOT - Popular Strikes ==========
    {
        id: 20,
        strikePrice: 1.00,
        expiry: daysFromNow(30),
        premium: calculatePremium(1.00),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 200,
        creator: MOCK_ACCOUNTS.creator1,
        owner: null,
        exercised: false,
        createdAt: daysAgo(6),
    },
    {
        id: 21,
        strikePrice: 1.05,
        expiry: daysFromNow(21),
        premium: calculatePremium(1.05),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 175,
        creator: MOCK_ACCOUNTS.creator2,
        owner: null,
        exercised: false,
        createdAt: daysAgo(4),
    },
    {
        id: 22,
        strikePrice: 1.10,
        expiry: daysFromNow(45),
        premium: calculatePremium(1.10),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 250,
        creator: MOCK_ACCOUNTS.creator3,
        owner: null,
        exercised: false,
        createdAt: daysAgo(7),
    },

    // Already owned by user (for My Options demo)
    {
        id: 23,
        strikePrice: 0.98,
        expiry: daysFromNow(10),
        premium: calculatePremium(0.98),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 100,
        creator: MOCK_ACCOUNTS.creator2,
        owner: MOCK_ACCOUNTS.user,
        exercised: false,
        createdAt: daysAgo(4),
    },
];

// ============================================================================
// Mock User's Options (for My Options page demo)
// ============================================================================

export const MOCK_USER_OPTIONS: Option[] = [
    // Deep ITM - Big profit potential
    {
        id: 101,
        strikePrice: 0.85,
        expiry: daysFromNow(12),
        premium: calculatePremium(0.85),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 200,
        creator: MOCK_ACCOUNTS.whale,
        owner: MOCK_ACCOUNTS.user,
        exercised: false,
        createdAt: daysAgo(15),
    },
    // ITM - Can exercise for profit
    {
        id: 102,
        strikePrice: 0.90,
        expiry: daysFromNow(5),
        premium: calculatePremium(0.90),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 100,
        creator: MOCK_ACCOUNTS.creator1,
        owner: MOCK_ACCOUNTS.user,
        exercised: false,
        createdAt: daysAgo(10),
    },
    // ITM - Near expiry (urgent!)
    {
        id: 103,
        strikePrice: 1.00,
        expiry: hoursFromNow(18),
        premium: calculatePremium(1.00),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 50,
        creator: MOCK_ACCOUNTS.creator2,
        owner: MOCK_ACCOUNTS.user,
        exercised: false,
        createdAt: daysAgo(8),
    },
    // ATM - Right at the money
    {
        id: 104,
        strikePrice: 1.05,
        expiry: daysFromNow(7),
        premium: calculatePremium(1.05),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 75,
        creator: MOCK_ACCOUNTS.creator3,
        owner: MOCK_ACCOUNTS.user,
        exercised: false,
        createdAt: daysAgo(6),
    },
    // OTM - Not profitable yet
    {
        id: 105,
        strikePrice: 1.15,
        expiry: daysFromNow(20),
        premium: calculatePremium(1.15),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 75,
        creator: MOCK_ACCOUNTS.creator3,
        owner: MOCK_ACCOUNTS.user,
        exercised: false,
        createdAt: daysAgo(5),
    },
    // Deep OTM - Speculative
    {
        id: 106,
        strikePrice: 1.30,
        expiry: daysFromNow(45),
        premium: calculatePremium(1.30),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 150,
        creator: MOCK_ACCOUNTS.whale,
        owner: MOCK_ACCOUNTS.user,
        exercised: false,
        createdAt: daysAgo(3),
    },
    // Already exercised - Profitable
    {
        id: 107,
        strikePrice: 0.92,
        expiry: daysAgo(2),
        premium: calculatePremium(0.92),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 100,
        creator: MOCK_ACCOUNTS.creator1,
        owner: MOCK_ACCOUNTS.user,
        exercised: true,
        createdAt: daysAgo(15),
    },
    // Already exercised - Small profit
    {
        id: 108,
        strikePrice: 1.02,
        expiry: daysAgo(5),
        premium: calculatePremium(1.02),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 50,
        creator: MOCK_ACCOUNTS.creator4,
        owner: MOCK_ACCOUNTS.user,
        exercised: true,
        createdAt: daysAgo(20),
    },
    // Expired (not exercised) - Lost premium
    {
        id: 109,
        strikePrice: 1.08,
        expiry: daysAgo(3),
        premium: calculatePremium(1.08),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 50,
        creator: MOCK_ACCOUNTS.creator2,
        owner: MOCK_ACCOUNTS.user,
        exercised: false,
        createdAt: daysAgo(20),
    },
    // Expired OTM - Lost premium
    {
        id: 110,
        strikePrice: 1.20,
        expiry: daysAgo(7),
        premium: calculatePremium(1.20),
        underlying: 'LST',
        optionType: 'CALL',
        amount: 100,
        creator: MOCK_ACCOUNTS.creator5,
        owner: MOCK_ACCOUNTS.user,
        exercised: false,
        createdAt: daysAgo(30),
    },
];

// ============================================================================
// Mock Transactions
// ============================================================================

export const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: 'tx-001',
        type: 'BUY',
        optionId: 101,
        deployHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
        status: 'SUCCESS',
        timestamp: daysAgo(15),
        amount: calculatePremium(0.85),
    },
    {
        id: 'tx-002',
        type: 'BUY',
        optionId: 102,
        deployHash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
        status: 'SUCCESS',
        timestamp: daysAgo(10),
        amount: calculatePremium(0.90),
    },
    {
        id: 'tx-003',
        type: 'BUY',
        optionId: 103,
        deployHash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
        status: 'SUCCESS',
        timestamp: daysAgo(8),
        amount: calculatePremium(1.00),
    },
    {
        id: 'tx-004',
        type: 'BUY',
        optionId: 105,
        deployHash: 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
        status: 'SUCCESS',
        timestamp: daysAgo(5),
        amount: calculatePremium(1.15),
    },
    {
        id: 'tx-005',
        type: 'BUY',
        optionId: 106,
        deployHash: 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
        status: 'SUCCESS',
        timestamp: daysAgo(3),
        amount: calculatePremium(1.30),
    },
    {
        id: 'tx-006',
        type: 'EXERCISE',
        optionId: 107,
        deployHash: 'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
        status: 'SUCCESS',
        timestamp: daysAgo(2),
        amount: 13.0, // Profit from exercise (0.13 * 100)
    },
    {
        id: 'tx-007',
        type: 'EXERCISE',
        optionId: 108,
        deployHash: 'a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3',
        status: 'SUCCESS',
        timestamp: daysAgo(5),
        amount: 1.5, // Small profit from exercise
    },
    {
        id: 'tx-008',
        type: 'CREATE',
        optionId: 200,
        deployHash: 'b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4',
        status: 'SUCCESS',
        timestamp: daysAgo(1),
        amount: 100, // Collateral locked
    },
];

// ============================================================================
// Mock Wallet State
// ============================================================================

export const MOCK_WALLET = {
    publicKey: '02036d9b880e44254afaf34330e57703a63aec53c02e6a88d52d3c9a1c3e8f5a1b2c',
    accountHash: MOCK_ACCOUNTS.user,
    balance: '5000.75', // 5000.75 CSPR - enough to buy whale options
};

// ============================================================================
// Oracle Price
// ============================================================================

export const MOCK_ORACLE = {
    lstPrice: DEFAULT_LST_PRICE,
    lastUpdated: new Date(),
    isMock: true,
};

// ============================================================================
// Helper to get all available options (not owned)
// ============================================================================

export const getAvailableOptions = (): Option[] => {
    return MOCK_OPTIONS.filter(opt => opt.owner === null);
};

// ============================================================================
// Helper to generate unique option ID
// ============================================================================

let nextOptionId = 300;
export const generateOptionId = (): number => {
    return nextOptionId++;
};
