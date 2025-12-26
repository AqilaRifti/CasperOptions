/**
 * Casper Wallet Integration
 * CSPR.click SDK wrapper for wallet connectivity
 */

import { CONTRACT_CONFIG, getDeployUrl } from '@/features/options/constants/config';

// ============================================================================
// Types
// ============================================================================

export interface CasperWalletState {
    isConnected: boolean;
    publicKey: string | null;
    accountHash: string | null;
}

export interface DeployParams {
    contractHash: string;
    entryPoint: string;
    args: Record<string, any>;
    paymentAmount: number;
}

// ============================================================================
// Wallet Provider Detection
// ============================================================================

declare global {
    interface Window {
        CasperWalletProvider?: () => CasperWalletProviderInterface;
        csprclick?: any;
    }
}

interface CasperWalletProviderInterface {
    requestConnection: () => Promise<boolean>;
    requestSwitchAccount: () => Promise<boolean>;
    disconnectFromSite: () => Promise<boolean>;
    getActivePublicKey: () => Promise<string>;
    signMessage: (message: string, signingPublicKey: string) => Promise<string>;
    signDeploy: (deploy: any, signingPublicKey: string) => Promise<any>;
    isConnected: () => Promise<boolean>;
}

// ============================================================================
// Wallet Service
// ============================================================================

class CasperWalletService {
    private provider: CasperWalletProviderInterface | null = null;

    /**
     * Check if CSPR.click wallet is available
     */
    isWalletAvailable(): boolean {
        if (typeof window === 'undefined') return false;
        return !!window.CasperWalletProvider;
    }

    /**
     * Get the wallet provider instance
     */
    private getProvider(): CasperWalletProviderInterface | null {
        if (typeof window === 'undefined') return null;

        if (!this.provider && window.CasperWalletProvider) {
            this.provider = window.CasperWalletProvider();
        }

        return this.provider;
    }

    /**
     * Connect to the wallet
     */
    async connect(): Promise<CasperWalletState> {
        const provider = this.getProvider();

        if (!provider) {
            // Return mock state for demo when wallet not available
            console.warn('Casper wallet not detected, using mock wallet');
            return {
                isConnected: true,
                publicKey: '02036d9b880e44254afaf34330e57703a63aec53c02e6a88d52d3c9a1c3e8f5a1b2c',
                accountHash: 'account-hash-d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
            };
        }

        try {
            const connected = await provider.requestConnection();

            if (!connected) {
                throw new Error('Connection rejected by user');
            }

            const publicKey = await provider.getActivePublicKey();
            const accountHash = publicKeyToAccountHash(publicKey);

            return {
                isConnected: true,
                publicKey,
                accountHash,
            };
        } catch (error) {
            console.error('Wallet connection error:', error);
            throw error;
        }
    }

    /**
     * Disconnect from the wallet
     */
    async disconnect(): Promise<void> {
        const provider = this.getProvider();

        if (provider) {
            try {
                await provider.disconnectFromSite();
            } catch (error) {
                console.error('Wallet disconnect error:', error);
            }
        }

        this.provider = null;
    }

    /**
     * Check if wallet is connected
     */
    async isConnected(): Promise<boolean> {
        const provider = this.getProvider();

        if (!provider) return false;

        try {
            return await provider.isConnected();
        } catch {
            return false;
        }
    }

    /**
     * Get the active public key
     */
    async getActivePublicKey(): Promise<string | null> {
        const provider = this.getProvider();

        if (!provider) return null;

        try {
            return await provider.getActivePublicKey();
        } catch {
            return null;
        }
    }

    /**
     * Sign and send a deploy (mock implementation for demo)
     */
    async signAndSendDeploy(params: DeployParams): Promise<string> {
        // In production, this would:
        // 1. Build the deploy using casper-js-sdk
        // 2. Sign it with the wallet
        // 3. Send it to the network

        // For demo, return a mock deploy hash
        const mockDeployHash = generateMockDeployHash();

        console.log('Mock deploy sent:', {
            ...params,
            deployHash: mockDeployHash,
        });

        return mockDeployHash;
    }

    /**
     * Get account balance from RPC
     */
    async getBalance(accountHash: string): Promise<string> {
        try {
            const response = await fetch(CONTRACT_CONFIG.rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'query_balance',
                    params: {
                        purse_identifier: {
                            main_purse_under_account_hash: accountHash,
                        },
                    },
                }),
            });

            const data = await response.json();

            if (data.result?.balance) {
                // Convert from motes to CSPR (1 CSPR = 10^9 motes)
                const balanceInCspr = parseInt(data.result.balance) / 1_000_000_000;
                return balanceInCspr.toFixed(4);
            }

            return '0';
        } catch (error) {
            console.error('Failed to fetch balance:', error);
            // Return mock balance for demo
            return '1500.50';
        }
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert public key to account hash
 * Simplified implementation - in production use casper-js-sdk
 */
function publicKeyToAccountHash(publicKey: string): string {
    // Remove '01' or '02' prefix if present
    const keyWithoutPrefix = publicKey.startsWith('01') || publicKey.startsWith('02')
        ? publicKey.slice(2)
        : publicKey;

    // In production, this would use proper hashing
    // For demo, create a deterministic mock hash
    return `account-hash-${keyWithoutPrefix.slice(0, 64)}`;
}

/**
 * Generate a mock deploy hash for demo purposes
 */
function generateMockDeployHash(): string {
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
}

/**
 * Format deploy hash for display
 */
export function formatDeployHash(hash: string): string {
    if (hash.length <= 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

/**
 * Get explorer URL for a deploy
 */
export function getExplorerUrl(deployHash: string): string {
    return getDeployUrl(deployHash);
}

// ============================================================================
// Singleton Export
// ============================================================================

export const casperWallet = new CasperWalletService();

// ============================================================================
// React Hook for Wallet Events
// ============================================================================

export function useCasperWalletEvents(
    onConnect?: (publicKey: string) => void,
    onDisconnect?: () => void,
    onActiveKeyChanged?: (publicKey: string) => void
) {
    if (typeof window === 'undefined') return;

    // Listen for wallet events
    const handleEvent = (event: CustomEvent) => {
        const { detail } = event;

        switch (detail?.eventType) {
            case 'Connected':
                onConnect?.(detail.activeKey);
                break;
            case 'Disconnected':
                onDisconnect?.();
                break;
            case 'ActiveKeyChanged':
                onActiveKeyChanged?.(detail.activeKey);
                break;
        }
    };

    window.addEventListener('CasperWalletState', handleEvent as EventListener);

    return () => {
        window.removeEventListener('CasperWalletState', handleEvent as EventListener);
    };
}
