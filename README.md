# CasperOptions 🎯

**Decentralized Options Trading on Casper Network**

CasperOptions is a DeFi platform enabling trustless options trading for Liquid Staking Tokens (LST) on the Casper blockchain. Buy, sell, and exercise call options with transparent on-chain settlement.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Casper](https://img.shields.io/badge/Casper-Testnet-red.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)

## ✨ Features

- **Call Options Trading** - Buy options to gain exposure to LST price movements
- **On-Chain Settlement** - Trustless execution via Casper smart contracts
- **Real-Time P&L** - Live profit/loss calculations based on oracle prices
- **Portfolio Management** - Track owned options, exercise history, and performance
- **Intuitive UI** - Modern interface with visual indicators for ITM/OTM status

## 🏗️ Project Structure

```
casper-options/
├── contracts/              # Rust smart contracts
│   ├── option-registry/    # Main options contract
│   └── option-registry-tests/
├── frontend/               # Next.js web application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Feature modules (options)
│   │   └── types/         # TypeScript definitions
│   └── ...
└── docs/                   # Documentation
```

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/casper-options.git
cd casper-options

# Start the frontend
cd frontend
pnpm install
pnpm dev
```

Visit `http://localhost:3000` to access the application.

## 📖 Documentation

- [Setup Guide](./setup.md) - Installation and configuration
- [Architecture](./architecture.md) - Technical design overview
- [Demo Guide](./demo.md) - Walkthrough of features
- [Pitch Deck](./pitch.md) - Project overview and vision

## 🔧 Tech Stack

**Frontend:**
- Next.js 16 with App Router
- TypeScript
- Tailwind CSS v4
- Zustand (state management)
- Recharts (visualizations)
- Radix UI (accessible components)

**Smart Contracts:**
- Rust
- Casper SDK
- CEP-18 token standard

## 🎮 Demo Mode

The application includes mock data for demonstration:
- 22+ pre-configured options with varied strikes and expiries
- Simulated wallet with 5,000 CSPR balance
- Mock oracle price at 1.05 CSPR/LST
- Transaction history examples

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.

---

Built with ❤️ for the Casper ecosystem
