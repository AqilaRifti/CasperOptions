#!/bin/bash
# ============================================================================
# CasperOptions Contract Deployment Script
# ============================================================================
# 
# This script deploys the option-registry contract to Casper Testnet.
#
# Prerequisites:
#   1. casper-client CLI installed: cargo install casper-client
#   2. Testnet account with CSPR balance
#   3. Secret key file (get from Casper Signer or generate)
#   4. Contract built: make build
#
# Usage:
#   ./deploy.sh /path/to/secret_key.pem
#
# Get testnet CSPR from faucet:
#   https://testnet.cspr.live/tools/faucet
#
# ============================================================================

set -e

# Configuration
NODE_ADDRESS="http://65.21.235.219:7777"
CHAIN_NAME="casper-test"
PAYMENT_AMOUNT="30000000000"  # 30 CSPR
WASM_PATH="option-registry/target/wasm32-unknown-unknown/release/option-registry.wasm"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print banner
echo "=============================================="
echo "  CasperOptions Contract Deployment"
echo "=============================================="
echo ""

# Check for secret key argument
if [ -z "$1" ]; then
    echo -e "${RED}Error: Secret key path required${NC}"
    echo ""
    echo "Usage: ./deploy.sh /path/to/secret_key.pem"
    echo ""
    echo "To generate a key pair:"
    echo "  casper-client keygen ./keys"
    echo ""
    echo "To get testnet CSPR:"
    echo "  https://testnet.cspr.live/tools/faucet"
    exit 1
fi

SECRET_KEY="$1"

# Verify secret key exists
if [ ! -f "$SECRET_KEY" ]; then
    echo -e "${RED}Error: Secret key file not found: $SECRET_KEY${NC}"
    exit 1
fi

# Verify WASM file exists
if [ ! -f "$WASM_PATH" ]; then
    echo -e "${RED}Error: WASM file not found. Run 'make build' first.${NC}"
    exit 1
fi

# Check if casper-client is installed
if ! command -v casper-client &> /dev/null; then
    echo -e "${RED}Error: casper-client not found${NC}"
    echo ""
    echo "Install with: cargo install casper-client"
    exit 1
fi

# Display deployment info
echo -e "${YELLOW}Deployment Configuration:${NC}"
echo "  Node:     $NODE_ADDRESS"
echo "  Chain:    $CHAIN_NAME"
echo "  Payment:  $PAYMENT_AMOUNT motes (30 CSPR)"
echo "  WASM:     $WASM_PATH"
echo "  Key:      $SECRET_KEY"
echo ""

# Get WASM file size
WASM_SIZE=$(ls -lh "$WASM_PATH" | awk '{print $5}')
echo -e "${YELLOW}WASM file size: $WASM_SIZE${NC}"
echo ""

# Confirm deployment
read -p "Deploy to Casper Testnet? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo -e "${YELLOW}Deploying contract...${NC}"
echo ""

# Deploy the contract
DEPLOY_OUTPUT=$(casper-client put-deploy \
    --node-address "$NODE_ADDRESS" \
    --chain-name "$CHAIN_NAME" \
    --secret-key "$SECRET_KEY" \
    --payment-amount "$PAYMENT_AMOUNT" \
    --session-path "$WASM_PATH" 2>&1)

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Deploy submitted successfully!${NC}"
    echo ""
    echo "$DEPLOY_OUTPUT"
    echo ""
    
    # Extract deploy hash
    DEPLOY_HASH=$(echo "$DEPLOY_OUTPUT" | grep -o '"deploy_hash": "[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$DEPLOY_HASH" ]; then
        echo "=============================================="
        echo -e "${GREEN}DEPLOY HASH: $DEPLOY_HASH${NC}"
        echo "=============================================="
        echo ""
        echo "Next steps:"
        echo "  1. Check deploy status:"
        echo "     casper-client get-deploy --node-address $NODE_ADDRESS $DEPLOY_HASH"
        echo ""
        echo "  2. View on testnet explorer:"
        echo "     https://testnet.cspr.live/deploy/$DEPLOY_HASH"
        echo ""
        echo "  3. Get contract hash (after deploy confirms):"
        echo "     casper-client query-global-state --node-address $NODE_ADDRESS \\"
        echo "       --state-root-hash <STATE_ROOT_HASH> --key <ACCOUNT_HASH>"
        echo ""
        
        # Save deploy hash to file
        echo "$DEPLOY_HASH" > deploy_hash.txt
        echo "Deploy hash saved to: deploy_hash.txt"
    fi
else
    echo -e "${RED}Deployment failed!${NC}"
    echo ""
    echo "$DEPLOY_OUTPUT"
    exit 1
fi
