#!/bin/bash
# ============================================================================
# Call exercise_option entry point on deployed contract
# ============================================================================
#
# Usage:
#   ./call-exercise-option.sh <secret_key> <contract_hash> <option_id>
#
# Example:
#   ./call-exercise-option.sh ./keys/secret_key.pem hash-abc123... 1
#
# ============================================================================

set -e

NODE_ADDRESS="http://65.21.235.219:7777"
CHAIN_NAME="casper-test"
PAYMENT_AMOUNT="3000000000"  # 3 CSPR for entry point call

if [ "$#" -ne 3 ]; then
    echo "Usage: ./call-exercise-option.sh <secret_key> <contract_hash> <option_id>"
    echo ""
    echo "Arguments:"
    echo "  secret_key    - Path to your secret key PEM file"
    echo "  contract_hash - The deployed contract hash (hash-xxx...)"
    echo "  option_id     - The option ID to exercise (u64)"
    exit 1
fi

SECRET_KEY="$1"
CONTRACT_HASH="$2"
OPTION_ID="$3"

echo "Exercising option..."
echo "  Contract: $CONTRACT_HASH"
echo "  Option ID: $OPTION_ID"
echo ""

casper-client put-deploy \
    --node-address "$NODE_ADDRESS" \
    --chain-name "$CHAIN_NAME" \
    --secret-key "$SECRET_KEY" \
    --payment-amount "$PAYMENT_AMOUNT" \
    --session-hash "$CONTRACT_HASH" \
    --session-entry-point "exercise_option" \
    --session-arg "id:u64='$OPTION_ID'"

echo ""
echo "Option exercise submitted! Check deploy status on testnet explorer."
