# CasperOptions Architecture 🏗️

Technical design overview of the CasperOptions platform.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  Pages          │  Features        │  State Management      │
│  - Marketplace  │  - Options       │  - Zustand Store       │
│  - My Options   │  - Wallet        │  - React Query         │
│  - History      │  - Transactions  │  - Local Storage       │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Casper Network                            │
├─────────────────────────────────────────────────────────────┤
│  Smart Contracts        │  External Services                │
│  - Option Registry      │  - RPC Nodes                      │
│  - CEP-18 LST Token     │  - Price Oracle                   │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 16 | App Router, SSR |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| State | Zustand | Global state |
| UI | Radix UI | Accessible components |
| Charts | Recharts | Data visualization |


### Directory Structure

```
frontend/src/
├── app/                    # Next.js App Router
│   ├── dashboard/
│   │   └── options/
│   │       ├── page.tsx    # Marketplace
│   │       ├── my/         # Portfolio
│   │       └── history/    # Transactions
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                 # Shadcn/Radix components
│   └── layout/             # Page layouts
├── features/
│   └── options/
│       ├── components/     # Option-specific UI
│       ├── constants/      # Config & mock data
│       └── utils/          # Calculations & store
├── lib/                    # Utilities
└── types/                  # TypeScript definitions
```

### State Management

```typescript
// Zustand store structure
interface OptionsStore {
  // Wallet State
  wallet: WalletState;
  
  // Options Data
  options: Option[];
  myOptions: Option[];
  
  // Oracle
  oraclePrice: number;
  
  // Transactions
  transactions: Transaction[];
  
  // UI State
  buyModal: BuyModalState;
  exerciseModal: ExerciseModalState;
  
  // Actions
  connectWallet: () => Promise<void>;
  buyOption: (id: number) => Promise<DeployResult>;
  exerciseOption: (id: number) => Promise<DeployResult>;
}
```

### Component Hierarchy

```
App
├── Layout
│   ├── Sidebar
│   └── Header
└── Pages
    ├── Marketplace
    │   ├── PriceChart
    │   ├── OptionStats
    │   ├── OptionGrid
    │   │   └── OptionCard[]
    │   └── BuyModal
    ├── MyOptions
    │   ├── PortfolioStats
    │   ├── PayoffChart
    │   ├── MyOptionCard[]
    │   └── ExerciseModal
    └── History
        └── TransactionList
```

---

## Smart Contract Architecture

### Option Registry Contract

```rust
// Core data structures
struct Option {
    id: u64,
    strike_price: U256,
    expiry: u64,
    premium: U256,
    amount: U256,
    creator: AccountHash,
    owner: Option<AccountHash>,
    exercised: bool,
}

// Entry points
#[no_mangle]
pub extern "C" fn create_option() { }

#[no_mangle]
pub extern "C" fn buy_option() { }

#[no_mangle]
pub extern "C" fn exercise_option() { }
```


### Contract Flow

```
CREATE OPTION
─────────────
Writer ──▶ deposit LST ──▶ Contract stores option ──▶ Option available

BUY OPTION
──────────
Buyer ──▶ pay premium ──▶ Contract transfers to writer ──▶ Buyer owns option

EXERCISE OPTION
───────────────
Owner ──▶ call exercise ──▶ Oracle check ──▶ If ITM: transfer LST to owner
                                          ──▶ If OTM: revert
```

### Storage Schema

| Key | Type | Description |
|-----|------|-------------|
| `options` | Dict<u64, Option> | All options |
| `option_count` | u64 | Auto-increment ID |
| `oracle_address` | AccountHash | Price feed |
| `lst_token` | ContractHash | LST token contract |

---

## Data Flow

### Option Lifecycle

```
1. CREATION
   Writer deposits LST collateral
   Contract mints option NFT
   Option listed in marketplace

2. PURCHASE
   Buyer pays premium in CSPR
   Premium transferred to writer
   Option ownership transferred

3. MONITORING
   Oracle provides price feed
   Frontend calculates ITM/OTM
   User sees real-time P&L

4. EXERCISE (if ITM)
   Owner calls exercise
   Contract verifies conditions
   LST transferred to owner
   Option marked exercised

5. EXPIRY (if not exercised)
   Option expires worthless
   Collateral returned to writer
```

### Price Calculation

```typescript
// Premium calculation (5% of strike)
premium = strikePrice * 0.05

// Break-even price
breakEven = strikePrice + (premium / amount)

// Profit calculation for CALL
grossProfit = (currentPrice - strikePrice) * amount
netProfit = grossProfit - premium

// ITM check
isITM = currentPrice > strikePrice
```

---

## Security Considerations

### Smart Contract

- Reentrancy guards on all entry points
- Integer overflow protection
- Access control for admin functions
- Time-based expiry validation

### Frontend

- Input validation on all forms
- Wallet signature verification
- Rate limiting on RPC calls
- Secure key storage (user's wallet)

---

## Scalability

### Current Limitations

- Single LST asset support
- CALL options only
- Manual oracle updates

### Future Improvements

- Multi-asset support
- PUT options
- Automated oracle (Chainlink-style)
- Layer 2 scaling options

---

## Integration Points

### Wallet Integration

```typescript
// Casper Signer connection
const connectWallet = async () => {
  const signer = await CasperSignerProvider.connect();
  const publicKey = await signer.getActivePublicKey();
  return { publicKey, signer };
};
```

### Oracle Integration

```typescript
// Price feed interface
interface Oracle {
  getPrice(asset: string): Promise<number>;
  getLastUpdate(): Promise<Date>;
}
```

### RPC Communication

```typescript
// Deploy transaction
const deploy = DeployUtil.makeDeploy(
  deployParams,
  ExecutableDeployItem.newStoredContractByHash(
    contractHash,
    entryPoint,
    args
  ),
  StandardPayment.build(paymentAmount)
);
```

---

## Testing Strategy

### Unit Tests

- Calculation utilities
- Component rendering
- State management

### Integration Tests

- Contract interactions
- Wallet flows
- Transaction lifecycle

### E2E Tests

- Full user journeys
- Cross-browser testing
- Mobile responsiveness

---

*Architecture designed for extensibility and security.*
