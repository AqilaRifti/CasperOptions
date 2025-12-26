#!/bin/bash
# ============================================================================
# Call create_option entry point on deployed contract
# ============================================================================
#
# Usage:
#   ./call-create-option.sh <secret_key> <contract_hash> <option_id> <strike_price> <expiry>
#
# Example:
#   ./call-create-option.sh ./keys/secret_key.pem hash-abc123... 1 1000000 1735689600
#
# ============================================================================

set -e

NODE_ADDRESS="http://65.21.235.219:7777"
CHAIN_NAME="casper-test"
PAYMENT_AMOUNT="5000000000"  # 5 CSPR for entry point call

if [ "$#" -ne 5 ]; then
    echo "Usage: ./call-create-option.sh <secret_key> <contract_hash> <option_id> <strike_price> <expiry>"
    echo ""
    echo "Arguments:"
    echo "  secret_key    - Path to your secret key PEM file"
    echo "  contract_hash - The deployed contract hash (hash-xxx...)"
    echo "  option_id     - Unique option ID (u64)"
    echo "  strike_price  - Strike price in smallest unit (U256)"
    echo "  expiry        - Expiry timestamp in unix seconds (u64)"
    exit 1
fi

SECRET_KEY="$1"
CONTRACT_HASH="$2"
OPTION_ID="$3"
STRIKE_PRICE="$4"
EXPIRY="$5"

echo "Creating option..."
echo "  Contract: $CONTRACT_HASH"
echo "  Option ID: $OPTION_ID"
echo "  Strike Price: $STRIKE_PRICE"
echo "  Expiry: $EXPIRY"
echo ""

casper-client put-deploy \
    --node-address "$NODE_ADDRESS" \
    --chain-name "$CHAIN_NAME" \
    --secret-key "$SECRET_KEY" \
    --payment-amount "$PAYMENT_AMOUNT" \
    --session-hash "$CONTRACT_HASH" \
    --session-entry-point "create_option" \
    --session-arg "id:u64='$OPTION_ID'" \
    --session-arg "strike_price:u256='$STRIKE_PRICE'" \
    --session-arg "expiry:u64='$EXPIRY'"

echo ""
echo "Option creation submitted! Check deploy status on testnet explorer."
