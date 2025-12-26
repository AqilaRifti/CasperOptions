/**
 * LST Options Trading Types
 * CasperOptions - DeFi Options Platform for Casper Network
 */

// ============================================================================
// Core Option Types
// ============================================================================

export type OptionType = 'CALL' | 'PUT';
export type UnderlyingAsset = 'LST';

export interface Option {
    /** Unique identifier for the option */
    id: number;
    /** Strike price in CSPR */
    strikePrice: number;
    /** Expiration date/time */
    expiry: Date;
    /** Premium cost to purchase the option (in CSPR) */
    premium: number;
    /** Underlying asset (always LST for this demo) */
    underlying: UnderlyingAsset;
    /** Option type (CALL or PUT) */
    optionType: OptionType;
    /** Amount of underlying asset */
    amount: number;
    /** Creator's Casper account hash */
    creator: string;
    /** Current owner's account hash (null if available for purchase) */
    owner: string | null;
    /** Whether the option has been exercised */
    exercised: boolean;
    /** When the option was created */
    createdAt: Date;
    /** On-chain transaction hash for creation (if recorded) */
    onChainHash?: string;
}

// ============================================================================
// Transaction Types
// ============================================================================

export type TransactionType = 'BUY' | 'EXERCISE' | 'CREATE';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface Transaction {
    /** Unique transaction ID */
    id: string;
    /** Type of transaction */
    type: TransactionType;
    /** Related option ID */
    optionId: number;
    /** Casper deploy hash */
    deployHash: string;
    /** Current status */
    status: TransactionStatus;
    /** When the transaction was initiated */
    timestamp: Date;
    /** Amount in CSPR (spent or received) */
    amount: number;
    /** Error message if failed */
    errorMessage?: string;
}

// ============================================================================
// Wallet Types
// ============================================================================

export interface WalletState {
    /** Whether wallet is connected */
    isConnected: boolean;
    /** Connected account's public key (hex) */
    publicKey: string | null;
    /** Connected account's account hash */
    accountHash: string | null;
    /** CSPR balance (as string to handle large numbers) */
    balance: string | null;
    /** Whether wallet is currently connecting */
    isConnecting: boolean;
    /** Connection error message */
    error: string | null;
}

// ============================================================================
// Oracle Types
// ============================================================================

export interface OracleState {
    /** Current LST/CSPR price */
    lstPrice: number;
    /** When the price was last updated */
    lastUpdated: Date;
    /** Whether the oracle is using mock data */
    isMock: boolean;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface OptionFilters {
    /** Filter by option type */
    optionType?: OptionType;
    /** Filter by ITM/OTM status */
    moneyness?: 'ITM' | 'OTM' | 'ALL';
    /** Filter by expiry status */
    expiryStatus?: 'ACTIVE' | 'EXPIRED' | 'ALL';
    /** Sort field */
    sortBy?: 'expiry' | 'strikePrice' | 'premium' | 'createdAt';
    /** Sort direction */
    sortDirection?: 'asc' | 'desc';
}

export interface BuyModalState {
    isOpen: boolean;
    option: Option | null;
    isProcessing: boolean;
}

export interface ExerciseModalState {
    isOpen: boolean;
    option: Option | null;
    isProcessing: boolean;
}

// ============================================================================
// Calculation Result Types
// ============================================================================

export interface ProfitCalculation {
    /** Gross profit/loss (before premium) */
    grossProfit: number;
    /** Net profit/loss (after premium) */
    netProfit: number;
    /** Profit as percentage of premium paid */
    profitPercentage: number;
    /** Whether the option is profitable to exercise */
    isProfitable: boolean;
}

export interface ExercisabilityResult {
    /** Whether the option can be exercised */
    canExercise: boolean;
    /** Reason if cannot exercise */
    reason?: string;
    /** Warning message (e.g., for OTM exercise) */
    warning?: string;
}

export interface PremiumCalculation {
    /** Premium amount in CSPR */
    premium: number;
    /** Premium as percentage of strike price */
    premiumPercentage: number;
    /** Break-even price */
    breakEvenPrice: number;
}

// ============================================================================
// Contract Types
// ============================================================================

export interface ContractConfig {
    /** Contract hash on Casper testnet */
    contractHash: string;
    /** RPC endpoint URL */
    rpcUrl: string;
    /** Chain name (casper-test for testnet) */
    chainName: string;
    /** Gas payment amount in motes */
    paymentAmount: number;
}

export interface DeployResult {
    /** Deploy hash */
    deployHash: string;
    /** Whether the deploy was successful */
    success: boolean;
    /** Error message if failed */
    error?: string;
}

// ============================================================================
// Store Types
// ============================================================================

export interface OptionsStore {
    // Wallet state
    wallet: WalletState;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    refreshBalance: () => Promise<void>;

    // Options state
    options: Option[];
    myOptions: Option[];
    isLoadingOptions: boolean;
    loadOptions: () => void;
    getOptionById: (id: number) => Option | undefined;

    // Trading actions
    buyOption: (optionId: number) => Promise<DeployResult>;
    exerciseOption: (optionId: number) => Promise<DeployResult>;
    createOption: (params: CreateOptionParams) => Promise<DeployResult>;

    // Oracle state
    oraclePrice: number;
    setOraclePrice: (price: number) => void;

    // Transactions
    transactions: Transaction[];
    addTransaction: (tx: Omit<Transaction, 'id'>) => void;
    updateTransactionStatus: (id: string, status: TransactionStatus, error?: string) => void;

    // UI state
    buyModal: BuyModalState;
    openBuyModal: (option: Option) => void;
    closeBuyModal: () => void;
    exerciseModal: ExerciseModalState;
    openExerciseModal: (option: Option) => void;
    closeExerciseModal: () => void;
}

export interface CreateOptionParams {
    strikePrice: number;
    expiry: Date;
    amount: number;
    optionType: OptionType;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface CasperRpcResponse<T> {
    jsonrpc: string;
    id: number;
    result?: T;
    error?: {
        code: number;
        message: string;
    };
}

export interface AccountBalance {
    balance_value: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/** Helper type for option card display */
export interface OptionDisplayData extends Option {
    isInTheMoney: boolean;
    isExpired: boolean;
    profit: ProfitCalculation;
    exercisability: ExercisabilityResult;
    premiumInfo: PremiumCalculation;
    timeToExpiry: string;
}
