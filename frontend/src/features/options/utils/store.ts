/**
 * CasperOptions Zustand Store
 * Global state management for the options trading platform
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    Option,
    Transaction,
    TransactionStatus,
    WalletState,
    BuyModalState,
    ExerciseModalState,
    DeployResult,
    CreateOptionParams,
} from '@/types/options';
import {
    MOCK_OPTIONS,
    MOCK_USER_OPTIONS,
    MOCK_TRANSACTIONS,
    MOCK_ORACLE,
    generateOptionId,
} from '../constants/mock-data';
import { DEFAULT_LST_PRICE, ESTIMATED_GAS_FEE } from '../constants/config';
import { calculatePremium, canAffordPurchase } from './calculations';

// Simple ID generator (no uuid needed)
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

// ============================================================================
// Store Interface
// ============================================================================

interface OptionsState {
    // Wallet
    wallet: WalletState;

    // Options
    options: Option[];
    myOptions: Option[];
    isLoadingOptions: boolean;

    // Oracle
    oraclePrice: number;

    // Transactions
    transactions: Transaction[];

    // UI Modals
    buyModal: BuyModalState;
    exerciseModal: ExerciseModalState;
}

interface OptionsActions {
    // Wallet actions
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    setWalletState: (state: Partial<WalletState>) => void;
    refreshBalance: () => Promise<void>;

    // Options actions
    loadOptions: () => void;
    getOptionById: (id: number) => Option | undefined;
    addOption: (option: Option) => void;
    updateOption: (id: number, updates: Partial<Option>) => void;

    // Trading actions
    buyOption: (optionId: number) => Promise<DeployResult>;
    exerciseOption: (optionId: number) => Promise<DeployResult>;
    createOption: (params: CreateOptionParams) => Promise<DeployResult>;

    // Oracle actions
    setOraclePrice: (price: number) => void;

    // Transaction actions
    addTransaction: (tx: Omit<Transaction, 'id'>) => void;
    updateTransactionStatus: (id: string, status: TransactionStatus, error?: string) => void;

    // Modal actions
    openBuyModal: (option: Option) => void;
    closeBuyModal: () => void;
    setBuyModalProcessing: (processing: boolean) => void;
    openExerciseModal: (option: Option) => void;
    closeExerciseModal: () => void;
    setExerciseModalProcessing: (processing: boolean) => void;
}

type OptionsStore = OptionsState & OptionsActions;

// ============================================================================
// Initial State
// ============================================================================

const initialWalletState: WalletState = {
    isConnected: false,
    publicKey: null,
    accountHash: null,
    balance: null,
    isConnecting: false,
    error: null,
};

const initialBuyModalState: BuyModalState = {
    isOpen: false,
    option: null,
    isProcessing: false,
};

const initialExerciseModalState: ExerciseModalState = {
    isOpen: false,
    option: null,
    isProcessing: false,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useOptionsStore = create<OptionsStore>()(
    persist(
        (set, get) => ({
            // ========== Initial State ==========
            wallet: initialWalletState,
            options: [],
            myOptions: [],
            isLoadingOptions: false,
            oraclePrice: DEFAULT_LST_PRICE,
            transactions: [],
            buyModal: initialBuyModalState,
            exerciseModal: initialExerciseModalState,

            // ========== Wallet Actions ==========
            connectWallet: async () => {
                set({ wallet: { ...get().wallet, isConnecting: true, error: null } });

                try {
                    // Try to use CSPR.click if available
                    if (typeof window !== 'undefined' && (window as any).CasperWalletProvider) {
                        const provider = (window as any).CasperWalletProvider();
                        const connected = await provider.requestConnection();

                        if (connected) {
                            const publicKey = await provider.getActivePublicKey();
                            // Convert public key to account hash (simplified)
                            const accountHash = `account-hash-${publicKey.slice(2, 66)}`;

                            set({
                                wallet: {
                                    isConnected: true,
                                    publicKey,
                                    accountHash,
                                    balance: '1000.00', // Mock balance for demo
                                    isConnecting: false,
                                    error: null,
                                },
                            });

                            // Load user's options
                            get().loadOptions();
                            return;
                        }
                    }

                    // Fallback to mock wallet for demo
                    console.log('Using mock wallet for demo');
                    set({
                        wallet: {
                            isConnected: true,
                            publicKey: '02036d9b880e44254afaf34330e57703a63aec53c02e6a88d52d3c9a1c3e8f5a1b2c',
                            accountHash: 'account-hash-d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
                            balance: '1500.50',
                            isConnecting: false,
                            error: null,
                        },
                    });

                    // Load options after connecting
                    get().loadOptions();
                } catch (error) {
                    set({
                        wallet: {
                            ...get().wallet,
                            isConnecting: false,
                            error: error instanceof Error ? error.message : 'Failed to connect wallet',
                        },
                    });
                }
            },

            disconnectWallet: () => {
                set({
                    wallet: initialWalletState,
                    myOptions: [],
                });
            },

            setWalletState: (state) => {
                set({ wallet: { ...get().wallet, ...state } });
            },

            refreshBalance: async () => {
                const { wallet } = get();
                if (!wallet.isConnected || !wallet.accountHash) return;

                // In production, fetch real balance from Casper RPC
                // For demo, just simulate a balance update
                set({
                    wallet: {
                        ...wallet,
                        balance: (parseFloat(wallet.balance || '0') + Math.random() * 10 - 5).toFixed(2),
                    },
                });
            },

            // ========== Options Actions ==========
            loadOptions: () => {
                set({ isLoadingOptions: true });

                // Simulate loading delay
                setTimeout(() => {
                    const { wallet } = get();

                    // Load available options (not owned by anyone)
                    const availableOptions = MOCK_OPTIONS.filter(opt => opt.owner === null);

                    // Load user's options if connected
                    let userOptions: Option[] = [];
                    if (wallet.isConnected && wallet.accountHash) {
                        userOptions = [
                            ...MOCK_USER_OPTIONS,
                            ...MOCK_OPTIONS.filter(opt => opt.owner === wallet.accountHash),
                        ];
                    }

                    set({
                        options: availableOptions,
                        myOptions: userOptions,
                        isLoadingOptions: false,
                        transactions: MOCK_TRANSACTIONS,
                    });
                }, 500);
            },

            getOptionById: (id) => {
                const { options, myOptions } = get();
                return [...options, ...myOptions].find(opt => opt.id === id);
            },

            addOption: (option) => {
                set({ options: [...get().options, option] });
            },

            updateOption: (id, updates) => {
                set({
                    options: get().options.map(opt =>
                        opt.id === id ? { ...opt, ...updates } : opt
                    ),
                    myOptions: get().myOptions.map(opt =>
                        opt.id === id ? { ...opt, ...updates } : opt
                    ),
                });
            },

            // ========== Trading Actions ==========
            buyOption: async (optionId) => {
                const { wallet, options, myOptions, addTransaction, updateTransactionStatus } = get();

                if (!wallet.isConnected) {
                    return { deployHash: '', success: false, error: 'Wallet not connected' };
                }

                const option = options.find(opt => opt.id === optionId);
                if (!option) {
                    return { deployHash: '', success: false, error: 'Option not found' };
                }

                // Check balance
                const affordCheck = canAffordPurchase(wallet.balance, option.premium, ESTIMATED_GAS_FEE);
                if (!affordCheck.canAfford) {
                    return {
                        deployHash: '',
                        success: false,
                        error: `Insufficient balance. Need ${affordCheck.required.toFixed(4)} CSPR, short by ${affordCheck.shortfall.toFixed(4)} CSPR`
                    };
                }

                // Create pending transaction
                const txId = generateId();
                const deployHash = `deploy-${Date.now()}-${Math.random().toString(36).slice(2)}`;

                addTransaction({
                    type: 'BUY',
                    optionId,
                    deployHash,
                    status: 'PENDING',
                    timestamp: new Date(),
                    amount: option.premium,
                });

                // Simulate transaction processing
                return new Promise((resolve) => {
                    setTimeout(() => {
                        // Update option ownership
                        const purchasedOption = { ...option, owner: wallet.accountHash };

                        set({
                            options: options.filter(opt => opt.id !== optionId),
                            myOptions: [...myOptions, purchasedOption],
                            wallet: {
                                ...wallet,
                                balance: (parseFloat(wallet.balance || '0') - option.premium - ESTIMATED_GAS_FEE).toFixed(2),
                            },
                        });

                        // Update transaction status
                        updateTransactionStatus(txId, 'SUCCESS');

                        resolve({ deployHash, success: true });
                    }, 2000);
                });
            },

            exerciseOption: async (optionId) => {
                const { wallet, myOptions, oraclePrice, addTransaction, updateTransactionStatus } = get();

                if (!wallet.isConnected) {
                    return { deployHash: '', success: false, error: 'Wallet not connected' };
                }

                const option = myOptions.find(opt => opt.id === optionId);
                if (!option) {
                    return { deployHash: '', success: false, error: 'Option not found in your portfolio' };
                }

                if (option.exercised) {
                    return { deployHash: '', success: false, error: 'Option already exercised' };
                }

                if (new Date(option.expiry) < new Date()) {
                    return { deployHash: '', success: false, error: 'Option has expired' };
                }

                // Create pending transaction
                const txId = generateId();
                const deployHash = `deploy-${Date.now()}-${Math.random().toString(36).slice(2)}`;

                // Calculate profit
                const profit = (oraclePrice - option.strikePrice) * option.amount;

                addTransaction({
                    type: 'EXERCISE',
                    optionId,
                    deployHash,
                    status: 'PENDING',
                    timestamp: new Date(),
                    amount: profit,
                });

                // Simulate transaction processing
                return new Promise((resolve) => {
                    setTimeout(() => {
                        // Mark option as exercised
                        set({
                            myOptions: myOptions.map(opt =>
                                opt.id === optionId ? { ...opt, exercised: true } : opt
                            ),
                            wallet: {
                                ...wallet,
                                balance: (parseFloat(wallet.balance || '0') + profit).toFixed(2),
                            },
                        });

                        // Update transaction status
                        updateTransactionStatus(txId, 'SUCCESS');

                        resolve({ deployHash, success: true });
                    }, 2000);
                });
            },

            createOption: async (params) => {
                const { wallet, options, addTransaction, updateTransactionStatus } = get();

                if (!wallet.isConnected || !wallet.accountHash) {
                    return { deployHash: '', success: false, error: 'Wallet not connected' };
                }

                const newOption: Option = {
                    id: generateOptionId(),
                    strikePrice: params.strikePrice,
                    expiry: params.expiry,
                    premium: calculatePremium(params.strikePrice),
                    underlying: 'LST',
                    optionType: params.optionType,
                    amount: params.amount,
                    creator: wallet.accountHash,
                    owner: null,
                    exercised: false,
                    createdAt: new Date(),
                };

                // Create pending transaction
                const txId = generateId();
                const deployHash = `deploy-${Date.now()}-${Math.random().toString(36).slice(2)}`;

                addTransaction({
                    type: 'CREATE',
                    optionId: newOption.id,
                    deployHash,
                    status: 'PENDING',
                    timestamp: new Date(),
                    amount: 0,
                });

                // Simulate transaction processing
                return new Promise((resolve) => {
                    setTimeout(() => {
                        set({ options: [...options, newOption] });
                        updateTransactionStatus(txId, 'SUCCESS');
                        resolve({ deployHash, success: true });
                    }, 2000);
                });
            },

            // ========== Oracle Actions ==========
            setOraclePrice: (price) => {
                set({ oraclePrice: price });
            },

            // ========== Transaction Actions ==========
            addTransaction: (tx) => {
                const newTx: Transaction = {
                    ...tx,
                    id: generateId(),
                };
                set({ transactions: [newTx, ...get().transactions] });
            },

            updateTransactionStatus: (id, status, error) => {
                set({
                    transactions: get().transactions.map(tx =>
                        tx.id === id ? { ...tx, status, errorMessage: error } : tx
                    ),
                });
            },

            // ========== Modal Actions ==========
            openBuyModal: (option) => {
                set({ buyModal: { isOpen: true, option, isProcessing: false } });
            },

            closeBuyModal: () => {
                set({ buyModal: initialBuyModalState });
            },

            setBuyModalProcessing: (processing) => {
                set({ buyModal: { ...get().buyModal, isProcessing: processing } });
            },

            openExerciseModal: (option) => {
                set({ exerciseModal: { isOpen: true, option, isProcessing: false } });
            },

            closeExerciseModal: () => {
                set({ exerciseModal: initialExerciseModalState });
            },

            setExerciseModalProcessing: (processing) => {
                set({ exerciseModal: { ...get().exerciseModal, isProcessing: processing } });
            },
        }),
        {
            name: 'casper-options-storage',
            partialize: (state) => ({
                // Only persist transactions
                transactions: state.transactions,
            }),
        }
    )
);

// ============================================================================
// Selector Hooks
// ============================================================================

export const useWallet = () => useOptionsStore((state) => state.wallet);
export const useOptions = () => useOptionsStore((state) => state.options);
export const useMyOptions = () => useOptionsStore((state) => state.myOptions);
export const useOraclePrice = () => useOptionsStore((state) => state.oraclePrice);
export const useTransactions = () => useOptionsStore((state) => state.transactions);
export const useBuyModal = () => useOptionsStore((state) => state.buyModal);
export const useExerciseModal = () => useOptionsStore((state) => state.exerciseModal);
