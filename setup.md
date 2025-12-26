# CasperOptions Setup Guide 🛠️

Complete instructions for setting up the CasperOptions development environment.

## Prerequisites

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | Frontend runtime |
| pnpm | 8+ | Package manager |
| Rust | 1.70+ | Smart contracts |
| cargo-casper | Latest | Casper toolchain |

### Optional

- Docker (for local Casper node)
- VS Code with Rust Analyzer

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
pnpm install
```

### 2. Environment Configuration

Create `.env.local` from the example:

```bash
cp env.example.txt .env.local
```

Configure the following variables:

```env
# Contract Configuration
NEXT_PUBLIC_CONTRACT_HASH=your_contract_hash
NEXT_PUBLIC_RPC_URL=https://node.testnet.casper.network/rpc
NEXT_PUBLIC_CHAIN_NAME=casper-test

# Oracle Configuration (for demo)
NEXT_PUBLIC_MOCK_LST_PRICE=1.05
```

### 3. Run Development Server

```bash
pnpm dev
```

Access at `http://localhost:3000`

### 4. Build for Production

```bash
pnpm build
pnpm start
```

---

## Smart Contract Setup

### 1. Install Rust Toolchain

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add Casper target
rustup target add wasm32-unknown-unknown

# Install cargo-casper
cargo install cargo-casper
```

### 2. Build Contracts

```bash
cd contracts/option-registry
cargo build --release --target wasm32-unknown-unknown
```

The compiled WASM will be at:
```
target/wasm32-unknown-unknown/release/option_registry.wasm
```

### 3. Run Tests

```bash
cd contracts/option-registry-tests
cargo test
```

---

## Deployment

### Testnet Deployment

#### 1. Get Testnet CSPR

Visit the [Casper Testnet Faucet](https://testnet.cspr.live/tools/faucet) to get test tokens.

#### 2. Deploy Contract

```bash
cd contracts
./deploy.sh
```

Or manually:

```bash
casper-client put-deploy \
  --node-address http://node.testnet.casper.network:7777 \
  --chain-name casper-test \
  --secret-key /path/to/secret_key.pem \
  --payment-amount 100000000000 \
  --session-path ./option-registry/target/wasm32-unknown-unknown/release/option_registry.wasm
```

#### 3. Note the Contract Hash

After deployment, save the contract hash for frontend configuration.

### Mainnet Deployment

⚠️ **Warning:** Ensure thorough testing and audit before mainnet deployment.

1. Update RPC URL to mainnet
2. Use mainnet secret key
3. Adjust payment amounts for mainnet gas prices

---

## Configuration Reference

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_CONTRACT_HASH` | Deployed contract hash | Mock hash |
| `NEXT_PUBLIC_RPC_URL` | Casper RPC endpoint | Testnet |
| `NEXT_PUBLIC_CHAIN_NAME` | Network name | casper-test |
| `NEXT_PUBLIC_MOCK_LST_PRICE` | Demo oracle price | 1.05 |

### Contract Configuration

Located in `frontend/src/features/options/constants/config.ts`:

```typescript
export const CONTRACT_CONFIG = {
  contractHash: process.env.NEXT_PUBLIC_CONTRACT_HASH,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
  chainName: process.env.NEXT_PUBLIC_CHAIN_NAME,
  paymentAmount: 3_000_000_000, // 3 CSPR
};
```

---

## Development Workflow

### Frontend Development

```bash
# Start dev server with hot reload
pnpm dev

# Run linter
pnpm lint

# Run tests
pnpm test

# Type checking
pnpm tsc --noEmit
```

### Contract Development

```bash
# Build contracts
cd contracts/option-registry
cargo build --release --target wasm32-unknown-unknown

# Run tests
cd ../option-registry-tests
cargo test

# Format code
cargo fmt

# Lint
cargo clippy
```

---

## Project Scripts

### Frontend (`frontend/package.json`)

| Script | Description |
|--------|-------------|
| `dev` | Start development server |
| `build` | Production build |
| `start` | Start production server |
| `lint` | Run ESLint |
| `test` | Run Vitest tests |

### Contracts (`contracts/Makefile`)

| Target | Description |
|--------|-------------|
| `build` | Compile contracts |
| `test` | Run contract tests |
| `clean` | Remove build artifacts |
| `deploy` | Deploy to testnet |

---

## Troubleshooting

### Common Issues

#### 1. Node Version Mismatch

```bash
# Check version
node --version

# Use nvm to switch
nvm use 20
```

#### 2. pnpm Not Found

```bash
# Install pnpm
npm install -g pnpm
```

#### 3. Rust Target Missing

```bash
rustup target add wasm32-unknown-unknown
```

#### 4. Contract Build Fails

```bash
# Update Rust
rustup update

# Clean and rebuild
cargo clean
cargo build --release --target wasm32-unknown-unknown
```

#### 5. RPC Connection Issues

- Check network connectivity
- Verify RPC URL is correct
- Try alternative RPC endpoints

---

## IDE Setup

### VS Code Extensions

Recommended extensions for development:

```json
{
  "recommendations": [
    "rust-lang.rust-analyzer",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

### Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  }
}
```

---

## Next Steps

1. ✅ Complete setup
2. 📖 Read [Architecture](./architecture.md)
3. 🎮 Try the [Demo](./demo.md)
4. 🚀 Start building!

---

## Support

- **Issues:** GitHub Issues
- **Discord:** Community server
- **Docs:** This repository

---

*Happy building! 🛠️*
