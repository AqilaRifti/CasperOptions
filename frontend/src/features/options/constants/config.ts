/**
 * CasperOptions Configuration Constants
 */

import type { ContractConfig } from '@/types/options';

// ============================================================================
// Contract Configuration
// ============================================================================

export const CONTRACT_CONFIG: ContractConfig = {
    contractHash: process.env.NEXT_PUBLIC_CONTRACT_HASH ||
        '9c59afcc085657238fb95cf42b8b1c81ed9f21fbad6fb02d307cef65b69d6ea1',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ||
        'https://node.testnet.casper.network/rpc',
    chainName: process.env.NEXT_PUBLIC_CHAIN_NAME || 'casper-test',
    paymentAmount: 3_000_000_000, // 3 CSPR in motes
};

// ============================================================================
// Oracle Configuration
// ============================================================================

/** Default mock LST/CSPR price */
export const DEFAULT_LST_PRICE = parseFloat(
    process.env.NEXT_PUBLIC_MOCK_LST_PRICE || '1.05'
);

// ============================================================================
// Pricing Configuration
// ============================================================================

/** Premium percentage of strike price (5% for demo) */
export const PREMIUM_PERCENTAGE = 0.05;

/** Minimum premium in CSPR */
export const MIN_PREMIUM = 0.01;

/** Gas fee estimate in CSPR */
export const ESTIMATED_GAS_FEE = 3;

// ============================================================================
// UI Configuration
// ============================================================================

/** Number of options to show per page */
export const OPTIONS_PER_PAGE = 12;

/** Refresh interval for balance (ms) */
export const BALANCE_REFRESH_INTERVAL = 30000;

/** Transaction polling interval (ms) */
export const TX_POLL_INTERVAL = 5000;

// ============================================================================
// Explorer URLs
// ============================================================================

export const TESTNET_EXPLORER_URL = 'https://testnet.cspr.live';

export const getDeployUrl = (deployHash: string): string =>
    `${TESTNET_EXPLORER_URL}/deploy/${deployHash}`;

export const getAccountUrl = (accountHash: string): string =>
    `${TESTNET_EXPLORER_URL}/account/${accountHash}`;

export const getContractUrl = (contractHash: string): string =>
    `${TESTNET_EXPLORER_URL}/contract/${contractHash}`;

// ============================================================================
// Display Formatting
// ============================================================================

/** Number of decimal places for CSPR display */
export const CSPR_DECIMALS = 4;

/** Number of characters to show at start of truncated address */
export const ADDRESS_START_CHARS = 6;

/** Number of characters to show at end of truncated address */
export const ADDRESS_END_CHARS = 4;
