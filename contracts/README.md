# CasperOptions Smart Contracts

Minimal Casper smart contract for the CasperOptions hackathon project. This contract provides on-chain proof of option creation and exercise events.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CasperOptions System                      │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js) → Backend API → Supabase (fast queries) │
│                              ↓                               │
│                    Option Registry Contract                  │
│                    (minimal on-chain proof)                  │
└─────────────────────────────────────────────────────────────┘
```

## Contract: option-registry

A minimal Casper smart contract that stores option creation and exercise events on-chain.

### Entry Points

| Entry Point | Parameters | Description |
|-------------|------------|-------------|
| `create_option` | `id: u64`, `strike_price: U256`, `expiry: u64` | Records option creation |
| `exercise_option` | `id: u64` | Marks option as exercised |

### Storage Keys

| Key Pattern | Type | Description |
|-------------|------|-------------|
| `option_{id}` | `u64` | Option ID |
| `option_{id}_creator` | `AccountHash` | Creator address |
| `option_{id}_strike` | `U256` | Strike price |
| `option_{id}_expiry` | `u64` | Expiry timestamp |
| `option_{id}_exercised` | `bool` | Exercise status |
| `option_count` | `u64` | Total options created |

## Quick Start

### Prerequisites

1. **Rust** with wasm32 target:
   ```bash
   rustup target add wasm32-unknown-unknown
   ```

2. **casper-client** CLI:
   ```bash
   cargo install casper-client
   ```

3. **Testnet account** with CSPR:
   - Get testnet CSPR: https://testnet.cspr.live/tools/faucet
   - Generate keys: `casper-client keygen ./keys`

### Build

```bash
cd contracts
make prepare  # Install wasm32 target
make build    # Build contract
```

Output: `option-registry/target/wasm32-unknown-unknown/release/option-registry.wasm` (48KB)

### Deploy

```bash
./deploy.sh /path/to/secret_key.pem
```

This will:
1. Deploy the contract to Casper Testnet
2. Output the deploy hash
3. Save deploy hash to `deploy_hash.txt`

### Verify Deployment

```bash
# Check deploy status
casper-client get-deploy --node-address http://65.21.235.219:7777 <DEPLOY_HASH>

# View on explorer
open https://testnet.cspr.live/deploy/<DEPLOY_HASH>
```

### Call Entry Points

**Create Option:**
```bash
./call-create-option.sh ./keys/secret_key.pem <CONTRACT_HASH> 1 1000000 1735689600
```

**Exercise Option:**
```bash
./call-exercise-option.sh ./keys/secret_key.pem <CONTRACT_HASH> 1
```

## Project Structure

```
contracts/
├── option-registry/           # Main contract
│   ├── Cargo.toml
│   ├── rust-toolchain.toml
│   └── src/
│       └── main.rs           # Contract code (~150 lines)
├── option-registry-tests/     # Property-based tests
│   ├── Cargo.toml
│   └── tests/
│       └── integration_tests.rs
├── Makefile                   # Build automation
├── deploy.sh                  # Deployment script
├── call-create-option.sh      # Create option helper
├── call-exercise-option.sh    # Exercise option helper
└── README.md
```

## Testing

Property-based tests verify:
1. **Option Creation Persistence** - Options are stored correctly
2. **Option Count Monotonicity** - Count increases by 1 per option
3. **Exercise Idempotence** - Multiple exercises = same result
4. **Storage Key Uniqueness** - No key collisions

```bash
cd option-registry-tests
cargo test
```

## Testnet Configuration

| Setting | Value |
|---------|-------|
| Node | `http://65.21.235.219:7777` |
| Chain | `casper-test` |
| Deploy Payment | 30 CSPR |
| Call Payment | 3-5 CSPR |
| Explorer | https://testnet.cspr.live |

## Dependencies

- `casper-contract` v4.0.0
- `casper-types` v4.0.0
- Rust nightly-2024-12-01

## License

MIT
