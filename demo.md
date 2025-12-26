# CasperOptions Demo Guide 🎮

This guide walks you through the key features of CasperOptions using the built-in demo mode.

## Getting Started

### 1. Launch the Application

```bash
cd frontend
pnpm dev
```

Navigate to `http://localhost:3000`

### 2. Connect Wallet (Demo Mode)

Click **"Connect Wallet"** in the top right. In demo mode, this simulates a wallet connection with:

- **Balance:** 5,000.75 CSPR
- **Account:** Demo user account hash

---

## Feature Walkthrough

### 📊 Options Marketplace

**Location:** `/dashboard/options`

The marketplace displays all available options for purchase.

#### Stats Dashboard

The enhanced stats panel shows:

| Stat | Description |
|------|-------------|
| 📊 Total Options | All options in the system |
| 🔥 Active | Non-expired, non-exercised options |
| 💰 In The Money | Options profitable to exercise now |
| 📉 Out of Money | Options not yet profitable |
| ⏰ Expiring Soon | Options expiring within 24 hours |
| 🐋 Whale Positions | Large positions (≥500 LST) |
| 🎯 Deep ITM | Strike < 95% of spot price |
| 🚀 Deep OTM | Strike > 115% of spot price |

#### Option Cards

Each option card displays:

- **Strike Price** - The price at which you can buy LST
- **Amount** - Quantity of LST in the contract
- **Premium** - Cost to purchase the option
- **Break-even** - Price needed to profit
- **Expiry** - When the option expires
- **Distance from Spot** - How far strike is from current price
- **Potential Profit** - Estimated P&L if exercised now

#### Visual Indicators

| Badge | Meaning |
|-------|---------|
| 🟢 ITM | In The Money - profitable |
| 🟢 Deep ITM | Very profitable |
| 🟠 OTM | Out of The Money |
| 🟣 Speculative | Deep OTM, high risk/reward |
| 🔴 Urgent | Expiring within 24 hours |
| 🐋 Whale | Large position size |
| 🔴 Expired | Past expiration date |

---

### 💼 My Options Portfolio

**Location:** `/dashboard/options/my`

View and manage your owned options.

#### Portfolio Stats

- **Active Options** - Currently held positions
- **ITM Count** - Profitable positions
- **Total P&L** - Aggregate profit/loss
- **Premium Paid** - Total cost basis

#### Option Actions

For each owned option:

1. **View Details** - See full option information
2. **Exercise** - Execute the option (if ITM)
3. **Payoff Chart** - Visualize profit at different prices

#### Tabs

- **Active** - Options you can still exercise
- **Exercised** - Successfully executed options
- **Expired** - Options that expired worthless

---

### 📜 Transaction History

**Location:** `/dashboard/options/history`

Track all your trading activity.

#### Transaction Types

| Type | Description |
|------|-------------|
| BUY | Purchased an option |
| EXERCISE | Executed an option |
| CREATE | Wrote a new option |

#### Transaction Details

- Timestamp
- Option ID
- Amount (premium or profit)
- Status (Success/Pending/Failed)
- Deploy hash (on-chain reference)

---

### ➕ Create New Option

**Location:** Click "Create Option" button in marketplace

Write your own options to earn premium.

#### Parameters

1. **Strike Price** - Set the exercise price
2. **Amount** - How much LST to collateralize
3. **Expiry** - When the option expires

#### Process

1. Enter parameters
2. Review premium calculation (5% of strike)
3. Confirm transaction
4. Option appears in marketplace

---

## Demo Scenarios

### Scenario 1: Buy a Profitable Option

1. Go to Marketplace
2. Find an option with **"ITM"** or **"Deep ITM"** badge
3. Click **"Buy Option"**
4. Confirm the purchase
5. Navigate to **My Options**
6. Click **"Exercise for Profit"**

### Scenario 2: Speculative Trade

1. Find an option with **"Speculative"** badge
2. Note the low premium cost
3. Purchase the option
4. Wait for price movement (simulated)
5. Exercise if it becomes ITM

### Scenario 3: Urgent Opportunity

1. Look for options with **"Urgent"** badge (red, pulsing)
2. These expire within 24 hours
3. Quick decision required
4. Higher risk but potentially mispriced

### Scenario 4: Whale Watching

1. Filter for **"Whale"** badge options
2. Large positions (500+ LST)
3. Often indicate institutional interest
4. Consider following smart money

---

## Price Chart

The marketplace includes a simulated price chart showing:

- **1D/1W/1M** timeframes
- Price trend visualization
- Current price indicator
- Percentage change

---

## Tips for Demo

1. **Explore All Pages** - Each has unique features
2. **Try Different Options** - ITM, OTM, urgent, whale
3. **Check Payoff Charts** - Understand profit curves
4. **Review Transactions** - See the audit trail
5. **Create Options** - Experience the writer side

---

## Mock Data Summary

The demo includes:

- **22 marketplace options** with varied characteristics
- **10 user-owned options** (active, exercised, expired)
- **8 transaction records**
- **Oracle price:** 1.05 CSPR/LST
- **Wallet balance:** 5,000.75 CSPR

---

## Next Steps

After exploring the demo:

1. Read the [Architecture](./architecture.md) for technical details
2. Check [Setup](./setup.md) for deployment instructions
3. Review the [Pitch](./pitch.md) for project vision

---

*Happy trading! 🎯*
